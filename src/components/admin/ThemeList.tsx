"use client";

import { useState, useRef } from "react";
import NextImage from "next/image";
import { PencilSimple, Trash, UploadSimple, Image } from "@phosphor-icons/react";
import { ThemeForm } from "@/components/admin/ThemeForm";
import { ThemeDeleteButton } from "@/components/admin/ThemeDeleteButton";
import type { Theme } from "@prisma/client";

type ThemeWithCount = Theme & { _count: { rideSlots: number } };

export function ThemeList({ themes }: { themes: ThemeWithCount[] }) {
  if (themes.length === 0) {
    return (
      <p className="px-6 py-8 text-sm text-gray-500 text-center">
        No themes yet. Create one to get started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {themes.map((theme) => (
        <ThemeRow key={theme.id} theme={theme} rideCount={theme._count.rideSlots} />
      ))}
    </ul>
  );
}

function ThemeRow({ theme, rideCount }: { theme: Theme; rideCount: number }) {
  const [editing, setEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(theme.photoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`/api/admin/theme-image?id=${theme.id}`, { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setPhotoUrl(url);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handlePhotoRemove() {
    setUploading(true);
    try {
      await fetch(`/api/admin/theme-image?id=${theme.id}`, { method: "DELETE" });
      setPhotoUrl(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <li className="px-6 py-4">
      {editing ? (
        <div className="space-y-3">
          <ThemeForm theme={theme} onSuccess={() => setEditing(false)} />
          <button
            onClick={() => setEditing(false)}
            className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{theme.name}</p>
            {theme.description && (
              <p className="mt-0.5 text-sm text-gray-500">{theme.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {rideCount} ride{rideCount !== 1 ? "s" : ""}
            </p>
            {/* Inline photo upload */}
            <div className="mt-3 flex items-center gap-2">
              <div className="relative h-14 w-20 flex-none overflow-hidden rounded border border-gray-200 bg-gray-50">
                {photoUrl ? (
                  <NextImage src={photoUrl} alt={theme.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <Image size={20} weight="thin" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <span className="text-[10px] text-gray-500">…</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                <UploadSimple size={12} weight="bold" />
                {photoUrl ? "Replace photo" : "Add photo"}
              </button>
              {photoUrl && (
                <button
                  onClick={handlePhotoRemove}
                  disabled={uploading}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash size={12} weight="regular" />
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              title="Edit theme"
              onClick={() => setEditing(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:bg-brand-blue hover:border-brand-blue hover:text-white"
            >
              <PencilSimple size={15} weight="duotone" />
            </button>
            <ThemeDeleteButton id={theme.id} name={theme.name} />
          </div>
        </div>
      )}
    </li>
  );
}
