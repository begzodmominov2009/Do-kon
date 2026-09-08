import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
import type { Product } from "@/lib/types/product";

type ProductRailProps = {
  products: Product[];
  loading?: boolean;
};

export function ProductRail({ products, loading = false }: ProductRailProps) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} variant="rail" />
          ))
        : products.map((product) => (
            <ProductCard key={product.id} product={product} variant="rail" />
          ))}
    </div>
  );
}
