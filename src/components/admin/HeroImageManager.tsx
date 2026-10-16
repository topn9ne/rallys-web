"use client";

import { useState, useRef } from "react";
import NextImage from "next/image";
import { UploadSimple, Trash, Image } from "@phosphor-icons/react";

interface Slot {
  key: "hero_photo" | "group_photo" | "custom_hero_photo";
  label: string;
  hint: string;
  ratio: string;
  currentUrl: string | null;
}

interface Props {
  heroPhotoUrl: string | null;
  groupPhotoUrl: string | null;
  customHeroPhotoUrl?: string | null;
}

export function HeroImageManager({ heroPhotoUrl, groupPhotoUrl, customHeroPhotoUrl = null }: Props) {
  const [slots, setSlots] = useState<Slot[]>([
    {
      key: "hero_photo",
      label: "Hero Photo",
      hint: "Right-column portrait on the landing page. Ideal: 3:4, min 800 × 1067 px.",
      ratio: "3/4",
      currentUrl: heroPhotoUrl,
    },
    {
      key: "group_photo",
      label: "Book the Whole Dang Vehicle",
      hint: "Right-column image in the fuchsia group events section. Ideal: 4:5, min 800 × 1000 px.",
      ratio: "4/5",
      currentUrl: groupPhotoUrl,
    },
    {
      key: "custom_hero_photo",
      label: "Custom Rides Hero",
      hint: "Screened background on the /custom page hero section. Ideal: 16:9 or wider, min 1600 px wide.",
      ratio: "16/9",
      currentUrl: customHeroPhotoUrl,
    },
  ]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/admin/site-image?key=${key}`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const { url } = await res.json();
        setSlots((prev) =>
          prev.map((s) => (s.key === key ? { ...s, currentUrl: url } : s))
        );
      }
    } finally {
      setUploading(null);
      if (fileRefs.current[key]) fileRefs.current[key]!.value = "";
    }
  };

  const handleRemove = async (key: string) => {
    setRemoving(key);
    try {
      await fetch(`/api/admin/site-image?key=${key}`, { method: "DELETE" });
      setSlots((prev) =>
        prev.map((s) => (s.key === key ? { ...s, currentUrl: null } : s))
      );
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {slots.map((slot) => {
        const busy = uploading === slot.key || removing === slot.key;
        return (
          <div key={slot.key}>
            <p className="mb-1 text-[13px] font-bold uppercase tracking-[1px] text-white/80">
              {slot.label}
            </p>
            <p className="mb-3 text-[12px] text-white/40">{slot.hint}</p>

            <div
              className="relative mb-3 w-full overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.04]"
              style={{ aspectRatio: slot.ratio }}
            >
              {slot.currentUrl ? (
                <NextImage
                  src={slot.currentUrl}
                  alt={slot.label}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-white/25">
                  <Image size={32} weight="thin" />
                  <span className="text-[11px] uppercase tracking-wide">No image set</span>
                </div>
              )}
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-sm text-white/70">
                    {uploading === slot.key ? "Uploading…" : "Removing…"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                ref={(el) => { fileRefs.current[slot.key] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(slot.key, file);
                }}
              />
              <button
                onClick={() => fileRefs.current[slot.key]?.click()}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-[10px] bg-admin-accent px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(255,46,136,0.3)] transition-[filter] hover:brightness-110 disabled:opacity-50"
              >
                <UploadSimple size={14} weight="bold" />
                {slot.currentUrl ? "Replace" : "Upload"}
              </button>
              {slot.currentUrl && (
                <button
                  onClick={() => handleRemove(slot.key)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-white/60 transition-colors hover:border-red-400/40 hover:text-red-400 disabled:opacity-50"
                >
                  <Trash size={14} weight="regular" />
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
