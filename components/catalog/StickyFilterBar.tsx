"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { SearchInput } from "@/components/ui/SearchInput";
import { ChipRow, type ChipItem } from "./ChipRow";

export type SortId = "newest" | "cheap" | "expensive";

type StickyFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (id: string) => void;
  categories: ChipItem[];
  sortId: SortId;
  onSortChange: (id: SortId) => void;
  activeFilterCount: number;
  onOpenFilter: () => void;
};

const HIDE_AFTER_DOWN = 80;
const SHOW_AFTER_UP = 40;
const TOP_THRESHOLD = 4;

export function StickyFilterBar({
  search,
  onSearchChange,
  categoryId,
  onCategoryChange,
  categories,
  sortId,
  onSortChange,
  activeFilterCount,
  onOpenFilter,
}: StickyFilterBarProps) {
  const { t } = useTranslation();
  const [chipsVisible, setChipsVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastYRef = useRef(0);
  const anchorYRef = useRef(0);
  const directionRef = useRef<"up" | "down" | null>(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const lastY = lastYRef.current;
        setScrolled(currentY > TOP_THRESHOLD);

        if (currentY <= TOP_THRESHOLD) {
          setChipsVisible(true);
          directionRef.current = null;
          anchorYRef.current = currentY;
        } else if (currentY > lastY) {
          if (directionRef.current !== "down") {
            directionRef.current = "down";
            anchorYRef.current = lastY;
          }
          if (currentY - anchorYRef.current > HIDE_AFTER_DOWN) {
            setChipsVisible(false);
          }
        } else if (currentY < lastY) {
          if (directionRef.current !== "up") {
            directionRef.current = "up";
            anchorYRef.current = lastY;
          }
          if (anchorYRef.current - currentY > SHOW_AFTER_UP) {
            setChipsVisible(true);
          }
        }

        lastYRef.current = currentY;
        tickingRef.current = false;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sortItems: ChipItem[] = [
    { id: "newest", label: t("catalog.sort.newest") },
    { id: "cheap", label: t("catalog.sort.cheap") },
    { id: "expensive", label: t("catalog.sort.expensive") },
  ];

  return (
    <div
      className={`sticky z-30 bg-bg/92 backdrop-blur-md ${
        scrolled ? "border-b border-border" : "border-b border-transparent"
      }`}
      style={{ top: "var(--header-height, 65px)" }}
    >
      <Container className="pt-3">
        <div className="pb-3">
          <SearchInput
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("common.searchPlaceholder")}
          />
        </div>

        <div
          className="grid transition-[grid-template-rows] duration-[280ms] ease-in-out"
          style={{ gridTemplateRows: chipsVisible ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div
              className="flex flex-col gap-2 pb-3 transition-opacity duration-[280ms] ease-in-out"
              style={{ opacity: chipsVisible ? 1 : 0 }}
            >
              <ChipRow items={categories} activeId={categoryId} onSelect={onCategoryChange} />
              <ChipRow
                items={sortItems}
                activeId={sortId}
                onSelect={(id) => onSortChange(id as SortId)}
                trailing={
                  <button
                    type="button"
                    onClick={onOpenFilter}
                    className="relative flex min-h-11 shrink-0 items-center gap-1.5 rounded-chip bg-surface-2 px-4 text-sm font-medium text-text"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("catalog.filter.button")}
                    {activeFilterCount > 0 ? (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
