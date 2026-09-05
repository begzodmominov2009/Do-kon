"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ShoppingCart, Store, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useCartTotalCount } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";

const items = [
  { href: "/", key: "nav.home", Icon: Home },
  { href: "/catalog", key: "nav.catalog", Icon: Store },
  { href: "/cart", key: "nav.cart", Icon: ShoppingCart },
  { href: "/favorites", key: "nav.favorites", Icon: Heart },
  { href: "/profile", key: "nav.profile", Icon: User },
] as const;

export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const cartCount = useCartTotalCount();
  const favoritesCount = useFavoritesStore((state) => state.ids.length);

  const badgeCount = (href: (typeof items)[number]["href"]) => {
    if (href === "/cart") return cartCount;
    if (href === "/favorites") return favoritesCount;
    return 0;
  };

  return (
    <div className="sticky bottom-0 z-20 px-3 pb-3.5 pt-2">
      <nav className="mx-auto max-w-[calc(520px-24px)] rounded-nav border border-border bg-surface/80 backdrop-blur">
        <ul className="flex items-center justify-around px-1 py-1.5">
          {items.map(({ href, key, Icon }) => {
            const active = pathname === href;
            const count = badgeCount(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative flex flex-col items-center gap-0.5 rounded-nav px-3 py-1.5 text-[11px] transition-colors ${
                    active ? "bg-accent-soft text-accent" : "text-text-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {t(key)}
                  {count > 0 ? (
                    <span className="absolute right-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
                      {count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
