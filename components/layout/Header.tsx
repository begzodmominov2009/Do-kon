"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { SearchInput } from "@/components/ui/SearchInput";
import { Container } from "./Container";

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const headerRef = useRef<HTMLElement>(null);

  // Publishes the header's real height so other sticky bars (e.g. the
  // catalog chip row) can stick below it instead of overlapping it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${el.offsetHeight}px`,
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHome]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-20 border-b border-border bg-bg"
    >
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
          <div className="mt-3">
            <SearchInput placeholder={t("common.searchPlaceholder")} />
          </div>
        ) : null}
      </Container>
    </header>
  );
}
