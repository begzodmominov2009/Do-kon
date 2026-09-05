"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@/lib/i18n";

export type ChipItem = {
  id: string;
  label: string;
};

type ChipRowProps = {
  items: ChipItem[];
  activeId: string;
  onSelect: (id: string) => void;
  trailing?: ReactNode;
};

export function ChipRow({ items, activeId, onSelect, trailing }: ChipRowProps) {
  const { locale } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [rect, setRect] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const measure = () => {
    const container = containerRef.current;
    const activeButton = buttonRefs.current.get(activeId);
    if (!container || !activeButton) return;

    setRect({ left: activeButton.offsetLeft, width: activeButton.offsetWidth });

    const buttonLeft = activeButton.offsetLeft;
    const buttonRight = buttonLeft + activeButton.offsetWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;

    if (buttonLeft < viewLeft) {
      container.scrollTo({ left: buttonLeft - 16, behavior: "smooth" });
    } else if (buttonRight > viewRight) {
      container.scrollTo({
        left: buttonRight - container.clientWidth + 16,
        behavior: "smooth",
      });
    }
  };

  // Measure synchronously before paint so the first frame is never wrong.
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, items, locale]);

  // Enable the sliding transition only after the first correct paint.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div
        ref={containerRef}
        className="no-scrollbar relative flex flex-1 items-center gap-2 overflow-x-auto"
      >
        <div
          aria-hidden
          className={`absolute inset-y-0 left-0 rounded-chip bg-accent ${
            ready ? "transition-[transform,width] duration-[260ms] ease-in-out" : ""
          }`}
          style={{ transform: `translateX(${rect.left}px)`, width: `${rect.width}px` }}
        />
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) buttonRefs.current.set(item.id, el);
                else buttonRefs.current.delete(item.id);
              }}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`relative z-10 min-h-11 shrink-0 whitespace-nowrap rounded-chip px-4 text-sm font-medium transition-colors duration-200 ${
                active ? "text-white" : "text-text-muted"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {trailing}
    </div>
  );
}
