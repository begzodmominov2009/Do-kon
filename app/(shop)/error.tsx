"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { DataError } from "@/components/shared/DataError";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-6">
      <DataError onRetry={reset} />
    </Container>
  );
}
