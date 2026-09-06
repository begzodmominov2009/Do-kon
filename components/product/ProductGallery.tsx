"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n";
import { useCartTotalCount } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import type { Product } from "@/lib/mock/products";
import { ImageZoomModal } from "./ImageZoomModal";

type ProductGalleryProps = {
  product: Product;
  overlayOpacity: number;
};

export const MAX_DOTS = 5;

// A tap that moved less than this many px is a tap, not a swipe.
const TAP_MOVE_THRESHOLD = 10;
// Two taps landing within this window count as a double-tap, which is
// ignored so it doesn't open the fullscreen viewer.
const DOUBLE_TAP_WINDOW = 300;

export function getDotWindow(count: number, active: number, max: number): number[] {
  if (count <= max) return Array.from({ length: count }, (_, i) => i);
  let start = active - Math.floor(max / 2);
  start = Math.max(0, Math.min(start, count - max));
  return Array.from({ length: max }, (_, i) => start + i);
}

export function ProductGallery({ product, overlayOpacity }: ProductGalleryProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);
  const isFavorite = useFavoritesStore((state) =>
    state.ids.includes(product.id),
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const cartCount = useCartTotalCount();
  const imageCount = product.gallery.length;

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  const discountPercent = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToIndex(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToIndex(activeIndex + 1);
    }
  };

  const handleHeartClick = () => {
    toggleFavorite(product.id);
    setHeartPulse(true);
    window.setTimeout(() => setHeartPulse(false), 300);
  };

  // The open-fullscreen action lives only here, on the slide itself — not
  // on the whole gallery container — so nearby control buttons never
  // trigger it. A tap must not have moved (that's a swipe) and must not be
  // the second half of a double-tap.
  const handleSlidePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleSlidePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const movedX = Math.abs(event.clientX - start.x);
    const movedY = Math.abs(event.clientY - start.y);
    if (movedX > TAP_MOVE_THRESHOLD || movedY > TAP_MOVE_THRESHOLD) return;

    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < DOUBLE_TAP_WINDOW;
    lastTapRef.current = now;

    if (isDoubleTap) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      return;
    }

    tapTimeoutRef.current = setTimeout(() => {
      setZoomOpen(true);
      tapTimeoutRef.current = null;
    }, DOUBLE_TAP_WINDOW);
  };

  const handleSlideKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setZoomOpen(true);
    }
  };

  const showPrev = activeIndex > 0;
  const showNext = activeIndex < imageCount - 1;
  const dotWindow = getDotWindow(imageCount, activeIndex, MAX_DOTS);

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="sticky top-0 z-0 h-[62vh] w-full overflow-hidden bg-surface-2 outline-none"
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
      >
        {product.gallery.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onPointerDown={handleSlidePointerDown}
            onPointerUp={handleSlidePointerUp}
            onKeyDown={handleSlideKeyDown}
            className="flex h-full w-full shrink-0 snap-start items-center justify-center text-[7rem]"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {discountPercent ? (
        <Badge variant="danger" className="absolute left-4 top-4 z-10">
          -{discountPercent}%
        </Badge>
      ) : null}

      <div className="absolute left-4 top-4 z-10">
        <Link
          href="/"
          aria-label={t("product.back")}
          className="flex h-11 w-11 items-center justify-center"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
            <ArrowLeft className="h-5 w-5" />
          </span>
        </Link>
      </div>

      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleHeartClick();
          }}
          aria-label={t("product.favoriteToggle")}
          aria-pressed={isFavorite}
          className="flex h-11 w-11 items-center justify-center"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
            <Heart
              className={`h-5 w-5 transition-transform duration-150 ${
                heartPulse ? "scale-125" : "scale-100"
              } ${isFavorite ? "fill-danger text-danger" : ""}`}
            />
          </span>
        </button>
        <Link
          href="/cart"
          aria-label={t("nav.cart")}
          onClick={(event) => event.stopPropagation()}
          className="flex h-11 w-11 items-center justify-center"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </span>
        </Link>
      </div>

      {imageCount > 1 ? (
        <div className="absolute right-4 top-16 z-10 rounded-chip bg-black/45 px-2 py-1 text-xs text-white backdrop-blur-md">
          {activeIndex + 1} / {imageCount}
        </div>
      ) : null}

      {imageCount > 1 ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goToIndex(activeIndex - 1);
            }}
            aria-label={t("product.previousImage")}
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 items-center justify-center transition-[opacity,transform] duration-[180ms]"
            style={{
              opacity: showPrev ? 1 : 0,
              transform: `translateY(-50%) scale(${showPrev ? 1 : 0.7})`,
              pointerEvents: showPrev ? "auto" : "none",
            }}
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
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 items-center justify-center transition-[opacity,transform] duration-[180ms]"
            style={{
              opacity: showNext ? 1 : 0,
              transform: `translateY(-50%) scale(${showNext ? 1 : 0.7})`,
              pointerEvents: showNext ? "auto" : "none",
            }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
              <ChevronRight className="h-5 w-5" />
            </span>
          </button>
        </>
      ) : null}

      {imageCount > 1 ? (
        <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-center gap-1.5">
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

      {zoomOpen ? (
        <ImageZoomModal
          images={product.gallery}
          initialIndex={activeIndex}
          onClose={() => setZoomOpen(false)}
        />
      ) : null}
    </div>
  );
}
