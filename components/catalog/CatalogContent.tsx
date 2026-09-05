"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
import { categories, products } from "@/lib/mock/products";
import { StickyFilterBar, type SortId } from "./StickyFilterBar";
import { FilterPanel, EMPTY_FILTER, type FilterState } from "./FilterPanel";
import type { ChipItem } from "./ChipRow";

const PAGE_SIZE = 4;

export function CatalogContent() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sortId, setSortId] = useState<SortId>("newest");
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [entered, setEntered] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const categoryChips: ChipItem[] = useMemo(
    () => [
      { id: "all", label: t("catalog.categories.all") },
      ...categories.map((category) => ({
        id: category.id,
        label: t(`home.categories.${category.id}`),
      })),
    ],
    [t],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const min = filter.minPrice ? Number(filter.minPrice) : null;
    const max = filter.maxPrice ? Number(filter.maxPrice) : null;

    const list = products.filter((product) => {
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (categoryId !== "all" && product.categoryId !== categoryId) return false;
      if (min !== null && product.price < min) return false;
      if (max !== null && product.price > max) return false;
      if (filter.discountOnly && !product.oldPrice) return false;
      if (filter.inStockOnly && !product.inStock) return false;
      return true;
    });

    if (sortId === "cheap") return [...list].sort((a, b) => a.price - b.price);
    if (sortId === "expensive") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [search, categoryId, sortId, filter]);

  // Reset pagination during render when the result set's inputs change,
  // rather than in an effect (avoids an extra cascading render).
  const filterSignature = JSON.stringify({ search, categoryId, sortId, filter });
  const [lastFilterSignature, setLastFilterSignature] = useState(filterSignature);
  if (filterSignature !== lastFilterSignature) {
    setLastFilterSignature(filterSignature);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadingMore(true);
          window.setTimeout(() => {
            setVisibleCount((prev) => prev + PAGE_SIZE);
            setLoadingMore(false);
          }, 500);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const activeFilterCount =
    (filter.minPrice || filter.maxPrice ? 1 : 0) +
    (filter.discountOnly ? 1 : 0) +
    (filter.inStockOnly ? 1 : 0);

  const handleClearAll = () => {
    setSearch("");
    setCategoryId("all");
    setSortId("newest");
    setFilter(EMPTY_FILTER);
  };

  return (
    <div className="pb-6">
      <StickyFilterBar
        search={search}
        onSearchChange={setSearch}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categoryChips}
        sortId={sortId}
        onSortChange={setSortId}
        activeFilterCount={activeFilterCount}
        onOpenFilter={() => setFilterOpen(true)}
      />

      <Container className="pt-4">
        <h1 className="text-xl font-bold text-text">{t("catalog.results.title")}</h1>
        <p className="mt-0.5 text-sm text-text-muted">
          {filtered.length} {t("cart.itemsSuffix")}
        </p>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="h-7 w-7" />}
            title={t("catalog.empty.title")}
            description={t("catalog.empty.description")}
            ctaLabel={t("catalog.empty.cta")}
            onCtaClick={handleClearAll}
          />
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {visibleProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="transition-all duration-300 ease-out"
                  style={{
                    opacity: entered ? 1 : 0,
                    transform: entered ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: entered ? `${index * 40}ms` : "0ms",
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
              {loadingMore
                ? Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={`loading-${index}`} />
                  ))
                : null}
            </div>
            {hasMore ? <div ref={sentinelRef} className="h-1" /> : null}
          </>
        )}
      </Container>

      <FilterPanel
        open={filterOpen}
        value={filter}
        onApply={setFilter}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
