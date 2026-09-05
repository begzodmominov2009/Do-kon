"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
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
  const [searchVisible, setSearchVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollY.current;
      setScrolled(currentY > 4);
      if (currentY < 40) {
        setSearchVisible(true);
      } else {
        setSearchVisible(!goingDown);
      }
      lastScrollY.current = currentY;
    };
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
      className={`sticky top-0 z-30 bg-bg/92 backdrop-blur-md ${
        scrolled ? "border-b border-border" : "border-b border-transparent"
      }`}
    >
      <Container className="pt-3">
        <div
          className="grid transition-[grid-template-rows] duration-[240ms] ease-in-out"
          style={{ gridTemplateRows: searchVisible ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div
              className="relative pb-3 transition-opacity duration-[240ms]"
              style={{ opacity: searchVisible ? 1 : 0 }}
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={t("common.searchPlaceholder")}
                className="h-11 w-full rounded-input bg-surface-2 pl-9 pr-3 text-sm text-text outline-none placeholder:text-text-muted"
              />
            </div>
          </div>
        </div>

        <div className="pb-3">
          <ChipRow items={categories} activeId={categoryId} onSelect={onCategoryChange} />

          <div className="mt-2">
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
      </Container>
    </div>
  );
}
