"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FileText, Heart, ShoppingCart } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useCartTotalCount } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { useOrdersStore } from "@/store/orders";

function StatCard({
  icon,
  value,
  label,
  href,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  href?: string;
}) {
  const content = (
    <div className="flex flex-col items-center gap-2 rounded-card bg-surface px-2 py-4 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
      </span>
      <span className="text-[23px] font-bold leading-none text-text">{value}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

export function ProfileStats() {
  const { t } = useTranslation();
  const ordersCount = useOrdersStore((state) => state.orders.length);
  const cartCount = useCartTotalCount();
  const favoritesCount = useFavoritesStore((state) => state.ids.length);

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        icon={<FileText className="h-5 w-5" />}
        value={ordersCount}
        label={t("profile.stats.orders")}
      />
      <StatCard
        icon={<ShoppingCart className="h-5 w-5" />}
        value={cartCount}
        label={t("profile.stats.cartItems")}
        href="/cart"
      />
      <StatCard
        icon={<Heart className="h-5 w-5" />}
        value={favoritesCount}
        label={t("profile.stats.favorites")}
        href="/favorites"
      />
    </div>
  );
}
