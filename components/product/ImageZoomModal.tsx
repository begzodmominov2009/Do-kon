"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type ImageZoomModalProps = {
  images: string[];
  initialIndex: number;
  onClose: () => void;
};

export function ImageZoomModal({
  images,
  initialIndex,
  onClose,
}: ImageZoomModalProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const track = trackRef.current;
    if (track) {
      track.scrollLeft = initialIndex * track.clientWidth;
    }
    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoomed) return;
    dragStartY.current = event.clientY;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const delta = event.clientY - dragStartY.current;
    setDragY(Math.max(0, delta));
  };

  const handlePointerUp = () => {
    if (dragY > 100) {
      onClose();
    } else {
      setDragY(0);
    }
    dragStartY.current = null;
  };

  const backdropOpacity = 1 - Math.min(dragY / 300, 0.6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        ref={trackRef}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto transition-transform duration-150"
        style={{ transform: `translateY(${dragY}px)` }}
      >
        {images.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setZoomed((prev) => !prev)}
            className="flex h-full w-full shrink-0 snap-start items-center justify-center"
          >
            <span
              className="text-[10rem] transition-transform duration-300"
              style={{ transform: zoomed ? "scale(2)" : "scale(1)" }}
            >
              {emoji}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
