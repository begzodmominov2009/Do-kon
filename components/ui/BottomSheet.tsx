"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { lockScroll, unlockScroll } from "@/lib/utils/scrollLock";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

const SWIPE_CLOSE_THRESHOLD = 80;
const CLOSE_TRANSITION_MS = 200;

// Shared bottom-sheet primitive: backdrop, slide-up panel, Escape/backdrop/
// swipe-down to close. Externally controlled (open/onClose) so any store
// can drive it — the sheet itself only owns the mount/animation timing.
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishClosing = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMounted(false);
    setDragY(0);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (open) {
        // A stale fallback timer from a previous close (see below) must
        // never be allowed to fire after we've just reopened — otherwise
        // it force-unmounts the sheet moments after it appears.
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        setMounted(true);
      } else {
        setVisible(false);
        // transitionend is the normal path to finishClosing(); this timer
        // is a guaranteed fallback (e.g. prefers-reduced-motion can shrink
        // the transition enough that the event may not reliably fire) so
        // the sheet never stays mounted — and blocking clicks — forever.
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = setTimeout(finishClosing, CLOSE_TRANSITION_MS + 50);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    lockScroll();
    return () => unlockScroll();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mounted, onClose]);

  // Safety net in case the component unmounts through some other path
  // while a close is still pending.
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartY.current = event.clientY;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const delta = event.clientY - dragStartY.current;
    setDragY(Math.max(0, delta));
  };

  const handlePointerUp = () => {
    dragStartY.current = null;
    if (dragY > SWIPE_CLOSE_THRESHOLD) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const handleTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.propertyName === "transform" && !visible) {
      finishClosing();
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={(event) => event.stopPropagation()}
        onTransitionEnd={handleTransitionEnd}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined}
        className={`relative z-10 flex w-full max-w-[520px] flex-col rounded-t-card border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
