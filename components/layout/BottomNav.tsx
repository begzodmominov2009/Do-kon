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

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

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

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.href === pathname),
  );

  return (
    <div className="sticky bottom-0 z-20 px-3 pb-[max(14px,env(safe-area-inset-bottom))] pt-2">
      <nav className="relative mx-auto max-w-[496px] rounded-[24px] border border-border bg-surface/93 p-[7px] backdrop-blur-[18px]">
        <div className="relative grid grid-cols-5">
          <div
            aria-hidden
            className="absolute inset-y-0 transition-transform duration-[260ms] ease-in-out"
            style={{
              width: `${100 / items.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          >
            <div className="absolute inset-1 rounded-[16px] bg-accent-soft" />
          </div>

          {items.map(({ href, key, Icon }) => {
            const active = href === pathname;
            const count = badgeCount(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative flex h-14 flex-col items-center justify-center gap-[3px]"
              >
                <span className="relative inline-flex">
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors duration-200 ${
                      active ? "text-accent" : "text-text-muted"
                    }`}
                  />
                  {count > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-danger px-0.5 text-[10.5px] font-semibold leading-none text-white">
                      {formatBadgeCount(count)}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`text-[10.5px] transition-colors duration-200 ${
                    active ? "text-accent" : "text-text-muted"
                  }`}
                >
                  {t(key)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
