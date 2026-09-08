"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataError } from "@/components/shared/DataError";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
import { ProductRail } from "@/components/shared/ProductRail";
import { Button } from "@/components/ui/Button";
import { ChipRow, type ChipItem } from "@/components/catalog/ChipRow";
import { useFavoritesStore } from "@/store/favorites";
import type { Product } from "@/lib/types/product";

type SortId = "newest" | "cheap" | "expensive";

const UNDO_DURATION = 5000;
const EXIT_DURATION = 200;
// Small catalog — one page is enough to cover every favorited product and
// to pick suggestions from.
const CATALOG_FETCH_LIMIT = 100;

function shuffled(list: Product[]): Product[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function FavoritesContent() {
  const { t } = useTranslation();
  const storeIds = useFavoritesStore((state) => state.ids);
  const addedAt = useFavoritesStore((state) => state.addedAt);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);

  const [sortId, setSortId] = useState<SortId>("newest");
  const [order, setOrder] = useState<string[]>(storeIds);
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removed, setRemoved] = useState<{ id: string; name: string } | null>(null);

  // Favorite ids only exist in client-side storage, so the products they
  // point at have to be fetched here instead of on the server.
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  const previousStoreIdsRef = useRef(storeIds);
  const removalTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bulkClearRef = useRef(false);

  const fetchAllProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(false);
    try {
      const response = await fetch(`/api/products?limit=${CATALOG_FETCH_LIMIT}`);
      if (!response.ok) throw new Error("fetch_failed");
      const data = (await response.json()) as { products: Product[]; total: number };
      setAllProducts(data.products);
    } catch {
      setProductsError(true);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      fetchAllProducts();
    });
    return () => cancelAnimationFrame(raf);
  }, [fetchAllProducts]);

  useEffect(() => {
    if (allProducts.length === 0) return;
    const raf = requestAnimationFrame(() => {
      setSuggestions(shuffled(allProducts).slice(0, 6));
    });
    return () => cancelAnimationFrame(raf);
  }, [allProducts]);

  useEffect(() => {
    const timers = removalTimersRef.current;
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Keeps a locally-owned copy of the id list so a removed card can play its
  // exit animation instead of vanishing the instant the store drops the id.
  useEffect(() => {
    const previous = previousStoreIdsRef.current;
    previousStoreIdsRef.current = storeIds;

    if (bulkClearRef.current) {
      bulkClearRef.current = false;
      removalTimersRef.current.forEach((timer) => clearTimeout(timer));
      removalTimersRef.current.clear();
      setOrder(storeIds);
      setLeavingIds(new Set());
      return;
    }

    const removedIds = previous.filter((id) => !storeIds.includes(id));
    const addedIds = storeIds.filter((id) => !previous.includes(id));

    if (addedIds.length > 0) {
      addedIds.forEach((id) => {
        const timer = removalTimersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          removalTimersRef.current.delete(id);
        }
      });
      setOrder((prev) => [...addedIds, ...prev.filter((id) => !addedIds.includes(id))]);
      setLeavingIds((prev) => {
        const next = new Set(prev);
        addedIds.forEach((id) => next.delete(id));
        return next;
      });
    }

    if (removedIds.length > 0) {
      setLeavingIds((prev) => {
        const next = new Set(prev);
        removedIds.forEach((id) => next.add(id));
        return next;
      });
      removedIds.forEach((id) => {
        const timer = setTimeout(() => {
          setOrder((prev) => prev.filter((existing) => existing !== id));
          setLeavingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          removalTimersRef.current.delete(id);
        }, EXIT_DURATION);
        removalTimersRef.current.set(id, timer);
      });

      const lastRemovedId = removedIds[removedIds.length - 1];
      const product = allProducts.find((item) => item.id === lastRemovedId);
      if (product) {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setRemoved({ id: lastRemovedId, name: product.name.uz });
        undoTimerRef.current = setTimeout(() => setRemoved(null), UNDO_DURATION);
      }
    }
  }, [storeIds, allProducts]);

  const visibleProducts = useMemo(() => {
    const list = order
      .map((id) => allProducts.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product));

    if (sortId === "cheap") return [...list].sort((a, b) => a.price - b.price);
    if (sortId === "expensive") return [...list].sort((a, b) => b.price - a.price);
    return [...list].sort((a, b) => (addedAt[b.id] ?? 0) - (addedAt[a.id] ?? 0));
  }, [order, sortId, addedAt, allProducts]);

  const sortItems: ChipItem[] = [
    { id: "newest", label: t("favorites.sort.newest") },
    { id: "cheap", label: t("favorites.sort.cheap") },
    { id: "expensive", label: t("favorites.sort.expensive") },
  ];

  const handleUndo = () => {
    if (!removed) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    toggleFavorite(removed.id);
    setRemoved(null);
  };

  const handleClearAll = () => {
    bulkClearRef.current = true;
    storeIds.forEach((id) => toggleFavorite(id));
    setConfirmOpen(false);
  };

  const isEmpty = order.length === 0;

  return (
    <Container className="flex flex-col gap-5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-bold text-text">{t("favorites.title")}</h1>
        <div className="flex items-center gap-1">
          <span className="text-sm text-text-muted">
            {storeIds.length} {t("cart.itemsSuffix")}
          </span>
          {!isEmpty ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmOpen(true)}
            >
              {t("favorites.clear.button")}
            </Button>
          ) : null}
        </div>
      </div>

      {productsError ? (
        <DataError onRetry={fetchAllProducts} />
      ) : productsLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: Math.min(Math.max(storeIds.length, 2), 6) }).map(
            (_, index) => (
              <ProductCardSkeleton key={index} />
            ),
          )}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col gap-7">
          <EmptyState
            icon={<Heart className="h-7 w-7 fill-danger text-danger" />}
            title={t("favorites.empty.title")}
            description={t("favorites.empty.description")}
            ctaLabel={t("favorites.empty.cta")}
            ctaHref="/catalog"
          />
          <div className="flex flex-col gap-3">
            <SectionHeader
              icon={<Sparkles className="h-5 w-5" />}
              title={t("favorites.suggestions.title")}
            />
            <ProductRail products={suggestions} />
          </div>
        </div>
      ) : (
        <>
          <ChipRow
            items={sortItems}
            activeId={sortId}
            onSelect={(id) => setSortId(id as SortId)}
          />

          <div className="grid grid-cols-2 gap-4">
            {visibleProducts.map((product) => {
              const leaving = leavingIds.has(product.id);
              return (
                <div
                  key={product.id}
                  className="transition-[opacity,transform] duration-200 ease-out"
                  style={{
                    opacity: leaving ? 0 : 1,
                    transform: leaving ? "scale(0.94)" : "scale(1)",
                  }}
                >
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-favorites-title"
        >
          <div className="w-full max-w-xs rounded-card bg-surface p-5 text-center">
            <p id="clear-favorites-title" className="font-semibold text-text">
              {t("favorites.clear.title")}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {t("favorites.clear.description")}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setConfirmOpen(false)}
              >
                {t("favorites.clear.cancel")}
              </Button>
              <Button type="button" variant="danger" fullWidth onClick={handleClearAll}>
                {t("favorites.clear.confirm")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {removed ? (
        <div
          className="fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-40 flex justify-center px-4"
          role="status"
        >
          <div className="flex items-center gap-3 rounded-chip border border-border bg-surface px-4 py-3 shadow-lg">
            <span className="text-sm text-text">{t("favorites.removedToast")}</span>
            <button
              type="button"
              onClick={handleUndo}
              className="text-sm font-semibold text-accent"
            >
              {t("favorites.undo")}
            </button>
          </div>
        </div>
      ) : null}
    </Container>
  );
}
