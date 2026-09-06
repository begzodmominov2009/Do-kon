"use client";

import { User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useUser } from "@/lib/user/useUser";

export function ProfileCard() {
  const { t } = useTranslation();
  const user = useUser();
  const isGuest = user.kind === "guest";

  const displayName = isGuest ? t("profile.guest.name") : (user.name ?? "");
  const subtitle = isGuest
    ? t("profile.guest.subtitle")
    : user.username
      ? `@${user.username}`
      : "";
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4 rounded-[18px] bg-surface p-[18px]">
      <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-white">
        {isGuest ? (
          <User className="h-6 w-6" />
        ) : user.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xl font-semibold">{initial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-text">{displayName}</p>
        <p className="mt-0.5 truncate text-sm text-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
