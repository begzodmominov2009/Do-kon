import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/api/products";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";

export async function generateMetadata(
  props: PageProps<"/product/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProductBySlug(id);
  return { title: product ? product.name.uz : "Mahsulot" };
}

export default async function ProductPage(props: PageProps<"/product/[id]">) {
  const { id } = await props.params;
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  const similar = await getRelatedProducts(product.id, product.categoryId);

  return <ProductDetailContent product={product} similar={similar} />;
}
