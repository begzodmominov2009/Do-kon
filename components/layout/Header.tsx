"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Store } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Input } from "@/components/ui/Input";
import { Container } from "./Container";

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg">
      <Container className={isHome ? "py-3" : "py-3.5"}>
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white"
          >
            <Store className="h-4.5 w-4.5" />
          </Link>
          <span className="text-base font-semibold text-text">
            {t("common.siteName")}
          </span>
        </div>

        {isHome ? (
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="search"
              placeholder={t("common.searchPlaceholder")}
              className="pl-9"
            />
          </div>
        ) : null}
      </Container>
    </header>
  );
}
