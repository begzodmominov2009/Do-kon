import { OrderSuccessContent } from "@/components/order/OrderSuccessContent";

type OrderSuccessPageProps = {
  searchParams: Promise<{ number?: string; total?: string; count?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;

  return (
    <OrderSuccessContent
      orderNumber={params.number ?? ""}
      total={params.total ? Number(params.total) : 0}
      count={params.count ? Number(params.count) : 0}
    />
  );
}
