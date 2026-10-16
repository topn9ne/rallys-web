"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import NextImage from "next/image";
import { Trash, UploadSimple, Image, ArrowsOutCardinal, MagnifyingGlassPlus, Globe } from "@phosphor-icons/react";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";
import { publishGallery } from "@/server/actions/gallery";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

interface Props {
  initialPhotos: Photo[];
}

export function GalleryManager({ initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishGallery();
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } finally {
      setPublishing(false);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/admin/gallery", { method: "POST", body: formData });
        if (res.ok) {
          const photo = await res.json();
          setPhotos((prev) => [...prev, photo]);
        }
      } catch {
        // silently continue with other files on error
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        // Adjust lightbox index if open
        setLightboxIndex((cur) => {
          if (cur === null) return null;
          const deletedIdx = photos.findIndex((p) => p.id === id);
          if (deletedIdx < cur) return cur - 1;
          if (deletedIdx === cur) return null;
          return cur;
        });
      }
    });
  };

  // ─── Drag-to-reorder ────────────────────────────────────────────────────────

  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (id !== draggingId) setDragOverId(id);
    },
    [draggingId]
  );

  const handleDrop = useCallback(
    async (targetId: string) => {
      if (!draggingId || draggingId === targetId) {
        setDraggingId(null);
        setDragOverId(null);
        return;
      }

      const fromIdx = photos.findIndex((p) => p.id === draggingId);
      const toIdx = photos.findIndex((p) => p.id === targetId);

      const reordered = [...photos];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);

      const withOrder = reordered.map((p, i) => ({ ...p, sortOrder: i }));
      setPhotos(withOrder);
      setDraggingId(null);
      setDragOverId(null);

      await fetch("/api/admin/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: withOrder.map(({ id, sortOrder }) => ({ id, sortOrder })) }),
      });
    },
    [draggingId, photos]
  );

  return (
    <>
      <div>
        {/* Upload row */}
        <div className="mb-6 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-[10px] bg-admin-accent px-5 py-2.5 font-display text-[13px] uppercase tracking-[1px] text-white shadow-[0_4px_12px_rgba(255,46,136,0.35)] transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            <UploadSimple size={16} weight="bold" />
            {uploading ? "Uploading…" : "Upload Photos"}
          </button>
          {photos.length > 0 && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <Globe size={15} weight="regular" />
              {published ? "Published ✓" : publishing ? "Publishing…" : "Publish to Site"}
            </button>
          )}
          <p className="text-[12px] text-white/40">
            {photos.length === 0
              ? "No photos yet — landing gallery shows placeholders until you add some"
              : `${photos.length} photo${photos.length !== 1 ? "s" : ""} · drag to reorder · click to enlarge`}
          </p>
        </div>

        {/* Photo grid */}
        {photos.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[14px] border-2 border-dashed border-white/20 py-20 text-white/40 transition-colors hover:border-white/40 hover:text-white/60"
          >
            <Image size={40} weight="thin" />
            <p className="text-sm">Click to upload your first photo</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(photo.id)}
                onDragOver={(e) => handleDragOver(e, photo.id)}
                onDrop={() => handleDrop(photo.id)}
                onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                className={`group relative aspect-square cursor-grab overflow-hidden rounded-[10px] transition-all active:cursor-grabbing ${
                  draggingId === photo.id ? "opacity-40 ring-2 ring-admin-accent" : ""
                } ${
                  dragOverId === photo.id ? "ring-2 ring-white/60 scale-[1.02]" : ""
                }`}
              >
                <NextImage
                  src={photo.url}
                  alt={photo.caption ?? "Gallery photo"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  draggable={false}
                />

                {/* Drag handle */}
                <div className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowsOutCardinal size={12} className="text-white" />
                </div>

                {/* Enlarge button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  title="Enlarge"
                  className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MagnifyingGlassPlus size={14} weight="bold" />
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                  disabled={isPending}
                  title="Delete photo"
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100 disabled:opacity-40"
                >
                  <Trash size={13} weight="bold" />
                </button>

                {/* Caption overlay */}
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 px-2 pb-2 pt-4">
                    <p className="text-[11px] text-white/90">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Upload tile */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-white/20 text-white/40 transition-colors hover:border-admin-accent/60 hover:text-admin-accent"
            >
              <UploadSimple size={22} />
              <span className="text-[11px] uppercase tracking-wide">Add more</span>
            </div>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))}
        />
      )}
    </>
  );
}
