"use client";

import { useEffect, useCallback } from "react";
import NextImage from "next/image";
import { X, ArrowLeft, ArrowRight } from "@phosphor-icons/react";

interface Photo {
  url: string;
  caption?: string | null;
}

interface Props {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function PhotoLightbox({ photos, index, onClose, onPrev, onNext }: Props) {
  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          <ArrowLeft size={18} weight="bold" />
        </button>
      )}

      {/* Image container */}
      <div
        className="relative max-h-[88vh] max-w-[90vw] min-h-[200px] min-w-[200px] w-full h-full"
        style={{ aspectRatio: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Use a plain img here — dimensions unknown, lightbox shows full-res */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption ?? "Gallery photo"}
          className="block max-h-[88vh] max-w-[90vw] w-auto h-auto rounded-lg object-contain mx-auto shadow-2xl"
          draggable={false}
        />
        {photo.caption && (
          <p className="mt-3 text-center text-sm text-white/70">{photo.caption}</p>
        )}
      </div>

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
        >
          <ArrowRight size={18} weight="bold" />
        </button>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
      >
        <X size={16} weight="bold" />
      </button>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/60 backdrop-blur-sm">
        {index + 1} / {photos.length}
      </div>
    </div>
  );
}
