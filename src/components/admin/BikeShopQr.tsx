"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { ArrowsOut, DownloadSimple, X } from "@phosphor-icons/react";

interface BikeShopQrProps {
  bikeId: string;
  bikeName: string;
}

const QR_SMALL = 160;
const QR_LARGE = 480;

function generateQr(canvas: HTMLCanvasElement, url: string, size: number) {
  QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 2,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });
}

export function BikeShopQr({ bikeId, bikeName }: BikeShopQrProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [url, setUrl] = useState(`/shop/${bikeId}`);

  const getUrl = () => `${window.location.origin}/shop/${bikeId}`;

  useEffect(() => {
    const qrUrl = getUrl();
    setUrl(qrUrl);
    if (canvasRef.current) generateQr(canvasRef.current, qrUrl, QR_SMALL);
  }, [bikeId]);

  useEffect(() => {
    if (fullscreen && modalCanvasRef.current) {
      generateQr(modalCanvasRef.current, getUrl(), QR_LARGE);
    }
  }, [fullscreen, bikeId]);

  function handleDownload() {
    if (!canvasRef.current) return;
    // Render a high-res version for download
    const offscreen = document.createElement("canvas");
    generateQr(offscreen, getUrl(), 800);
    // Give qrcode a tick to render
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `qr-${bikeName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = offscreen.toDataURL("image/png");
      link.click();
    }, 100);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-center">
        <canvas ref={canvasRef} className="rounded" />
        <p className="text-sm font-semibold text-gray-800">{bikeName}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setFullscreen(true)}
            title="View full screen"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowsOut size={13} />
            Full Screen
          </button>
          <button
            onClick={handleDownload}
            title="Download PNG"
            className="flex items-center gap-1.5 rounded-lg border border-brand-blue/30 bg-brand-blue/5 px-3 py-1.5 text-xs font-medium text-brand-blue hover:bg-brand-blue/10 transition-colors"
          >
            <DownloadSimple size={13} />
            Download
          </button>
        </div>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setFullscreen(false)}
        >
          <div
            className="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <canvas ref={modalCanvasRef} className="rounded-lg" />
            <p className="text-lg font-bold text-gray-900">{bikeName}</p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90 transition-colors"
            >
              <DownloadSimple size={15} />
              Download PNG
            </button>
          </div>
        </div>
      )}
    </>
  );
}
