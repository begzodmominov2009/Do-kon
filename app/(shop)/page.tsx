import { getCategories, getProducts } from "@/lib/api/products";
import { HomeContent } from "@/components/home/HomeContent";

export default async function Home() {
  const [categories, recommended, sale] = await Promise.all([
    getCategories(),
    getProducts({ limit: 10 }),
    getProducts({ discountOnly: true, limit: 10 }),
  ]);

  return (
    <HomeContent
      categories={categories}
      products={recommended.products}
      saleProducts={sale.products}
    />
  );
}
