"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataError } from "@/components/shared/DataError";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
import { i18nField } from "@/lib/utils/i18nField";
import type { Category, Product } from "@/lib/types/product";
import { StickyFilterBar, type SortId } from "./StickyFilterBar";
import { FilterPanel, EMPTY_FILTER, type FilterState } from "./FilterPanel";
import type { ChipItem } from "./ChipRow";

const PAGE_SIZE = 4;
const SEARCH_DEBOUNCE_MS = 350;

type CatalogProductsResponse = {
  products: Product[];
  total: number;
};

type CatalogContentProps = {
  categories: Category[];
  initialProducts: Product[];
  initialTotal: number;
};

export function CatalogContent({
  categories,
  initialProducts,
  initialTotal,
}: CatalogContentProps) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sortId, setSortId] = useState<SortId>("newest");
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [entered, setEntered] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  const categoryChips: ChipItem[] = useMemo(
    () => [
      { id: "all", label: t("catalog.categories.all") },
      ...categories.map((category) => ({
        id: category.slug,
        label: i18nField(category.name, locale),
      })),
    ],
    [t, categories, locale],
  );

  const buildParams = useCallback(
    (offset: number) => {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (categoryId !== "all") params.set("category", categoryId);
      if (filter.minPrice) params.set("minPrice", filter.minPrice);
      if (filter.maxPrice) params.set("maxPrice", filter.maxPrice);
      if (filter.discountOnly) params.set("discountOnly", "true");
      if (filter.inStockOnly) params.set("inStockOnly", "true");
      params.set("sort", sortId);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      return params;
    },
    [debouncedSearch, categoryId, filter, sortId],
  );

  const fetchPage = useCallback(
    async (offset: number, mode: "replace" | "append") => {
      const requestId = ++requestIdRef.current;
      if (mode === "replace") setLoading(true);
      else setLoadingMore(true);
      setError(false);

      try {
        const response = await fetch(`/api/products?${buildParams(offset).toString()}`);
        if (!response.ok) throw new Error("fetch_failed");
        const data = (await response.json()) as CatalogProductsResponse;
        if (requestId !== requestIdRef.current) return;

        setProducts((prev) =>
          mode === "replace" ? data.products : [...prev, ...data.products],
        );
        setTotal(data.total);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError(true);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [buildParams],
  );

  // The server already rendered page 1 for the default filter state — only
  // refetch once a filter actually changes.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    fetchPage(0, "replace");
  }, [debouncedSearch, categoryId, sortId, filter, fetchPage]);

  const hasMore = products.length < total;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          fetchPage(products.length, "append");
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, products.length, fetchPage]);

  const activeFilterCount =
    (filter.minPrice || filter.maxPrice ? 1 : 0) +
    (filter.discountOnly ? 1 : 0) +
    (filter.inStockOnly ? 1 : 0);

  const handleClearAll = () => {
    setSearch("");
    setDebouncedSearch("");
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
          {total} {t("cart.itemsSuffix")}
        </p>

        {error && products.length === 0 ? (
          <DataError onRetry={() => fetchPage(0, "replace")} />
        ) : loading ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
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
              {products.map((product, index) => (
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
                ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <ProductCardSkeleton key={`loading-${index}`} />
                  ))
                : null}
            </div>
            {error && products.length > 0 ? (
              <div className="mt-4">
                <DataError onRetry={() => fetchPage(products.length, "append")} />
              </div>
            ) : null}
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
