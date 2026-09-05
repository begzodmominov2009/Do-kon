import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getSimilarProducts } from "@/lib/mock/products";
import { ProductDetailContent } from "@/components/product/ProductDetailContent";

export async function generateMetadata(
  props: PageProps<"/product/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const product = getProductById(id);
  return { title: product ? product.name : "Mahsulot" };
}

export default async function ProductPage(props: PageProps<"/product/[id]">) {
  const { id } = await props.params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const similar = getSimilarProducts(product);

  return <ProductDetailContent product={product} similar={similar} />;
}
