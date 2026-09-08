import { getCategories, getProducts } from "@/lib/api/products";
import { CatalogContent } from "@/components/catalog/CatalogContent";

const PAGE_SIZE = 4;

export default async function CatalogPage() {
  const [categories, page] = await Promise.all([
    getCategories(),
    getProducts({ limit: PAGE_SIZE }),
  ]);

  return (
    <CatalogContent
      categories={categories}
      initialProducts={page.products}
      initialTotal={page.total}
    />
  );
}
