"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProductImage } from "@/components/shared/ProductImage";
import { useTranslation } from "@/lib/i18n";
import { getDotWindow, MAX_DOTS } from "./ProductGallery";

type ImageZoomModalProps = {
  images: (string | null)[];
  alt: string;
  initialIndex: number;
  onClose: () => void;
};

const DRAG_CLOSE_THRESHOLD = 100;
const DRAG_MOVE_THRESHOLD = 10;

export function ImageZoomModal({ images, alt, initialIndex, onClose }: ImageZoomModalProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const imageCount = images.length;

  useEffect(() => {
    triggerRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const track = trackRef.current;
    if (track) track.scrollLeft = initialIndex * track.clientWidth;
    closeButtonRef.current?.focus();
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = () => setVisible(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActiveIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const goToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, imageCount - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActiveIndex(clamped);
  };

  // Only the backdrop area (not the image or the controls, which stop
  // propagation) closes on click.
  const handleBackdropClick = () => {
    if (!isDraggingRef.current) requestClose();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    isDraggingRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!isDraggingRef.current) {
      if (Math.abs(dy) < DRAG_MOVE_THRESHOLD || Math.abs(dy) < Math.abs(dx)) return;
      isDraggingRef.current = true;
    }
    setDragY(Math.max(0, dy));
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
    const wasDragging = isDraggingRef.current;
    if (wasDragging) {
      if (dragY > DRAG_CLOSE_THRESHOLD) {
        requestClose();
      } else {
        setDragY(0);
      }
    }
    // Deferred so the click handler firing right after pointerup can see it.
    requestAnimationFrame(() => {
      isDraggingRef.current = false;
    });
  };

  const handleTrackTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.propertyName === "opacity" && !visible) onClose();
  };

  const dragFade = Math.min(dragY / 320, 0.6);
  const backdropOpacity = visible ? 1 - dragFade : 0;
  const showPrev = activeIndex > 0;
  const showNext = activeIndex < imageCount - 1;
  const dotWindow = getDotWindow(imageCount, activeIndex, MAX_DOTS);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-[220ms]"
      style={{
        opacity: backdropOpacity,
        backgroundColor: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleBackdropClick}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          requestClose();
        }}
        aria-label={t("common.close")}
        className="absolute right-3.5 top-3.5 z-10 flex h-11 w-11 items-center justify-center"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
          <X className="h-5 w-5" />
        </span>
      </button>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        onClick={(event) => event.stopPropagation()}
        onTransitionEnd={handleTrackTransitionEnd}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto transition-[transform,opacity] duration-[260ms] ease-[cubic-bezier(0.34,1.2,0.64,1)]"
        style={{
          transform: `translateY(${dragY}px) scale(${visible ? 1 : 0.92})`,
          opacity: visible ? 1 : 0,
        }}
      >
        {images.map((url, index) => (
          <div
            key={index}
            className="flex h-full w-full shrink-0 snap-start items-center justify-center"
          >
            <ProductImage
              url={url}
              alt={alt}
              className="h-[82%] w-[92%] rounded-2xl"
              sizes="92vw"
              fit="contain"
            />
          </div>
        ))}
      </div>

      {imageCount > 1 ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goToIndex(activeIndex - 1);
            }}
            aria-label={t("product.previousImage")}
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center transition-opacity duration-[180ms]"
            style={{ opacity: showPrev ? 1 : 0, pointerEvents: showPrev ? "auto" : "none" }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
              <ChevronLeft className="h-5 w-5" />
            </span>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goToIndex(activeIndex + 1);
            }}
            aria-label={t("product.nextImage")}
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center transition-opacity duration-[180ms]"
            style={{ opacity: showNext ? 1 : 0, pointerEvents: showNext ? "auto" : "none" }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
              <ChevronRight className="h-5 w-5" />
            </span>
          </button>
        </>
      ) : null}

      {imageCount > 1 ? (
        <div
          onClick={(event) => event.stopPropagation()}
          className="absolute inset-x-4 bottom-6 z-10 flex items-center justify-center gap-1.5"
        >
          {dotWindow.map((index, position) => {
            const active = index === activeIndex;
            const isEdgeShrink =
              (position === 0 && dotWindow[0] > 0) ||
              (position === dotWindow.length - 1 &&
                dotWindow[dotWindow.length - 1] < imageCount - 1);
            return (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full bg-white transition-[transform,opacity] duration-[240ms] ${
                  active
                    ? "scale-x-[3] opacity-100"
                    : isEdgeShrink
                      ? "scale-75 opacity-45"
                      : "opacity-45"
                }`}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
