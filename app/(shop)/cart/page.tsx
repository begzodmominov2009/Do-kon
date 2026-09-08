import { getProducts } from "@/lib/api/products";
import { CartPageContent } from "@/components/cart/CartPageContent";

export default async function CartPage() {
  const { products } = await getProducts({ limit: 6 });
  return <CartPageContent suggestedProducts={products} />;
}
