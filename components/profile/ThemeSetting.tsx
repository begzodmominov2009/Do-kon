"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/lib/i18n";

const THEME_OPTIONS = ["light", "dark", "system"] as const;
type ThemeOption = (typeof THEME_OPTIONS)[number];

export function ThemeSetting() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const active: ThemeOption =
    mounted && (THEME_OPTIONS as readonly string[]).includes(theme ?? "")
      ? (theme as ThemeOption)
      : "system";
  const activeIndex = THEME_OPTIONS.indexOf(active);

  const labels: Record<ThemeOption, string> = {
    light: t("profile.settings.theme.light"),
    dark: t("profile.settings.theme.dark"),
    system: t("profile.settings.theme.auto"),
  };

  return (
    <div className="flex w-full items-start gap-3 px-4 py-3">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Moon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">
          {t("profile.settings.theme.title")}
        </p>
        <div className="mt-2 rounded-chip bg-surface-2 p-1">
          <div
            role="tablist"
            aria-label={t("profile.settings.theme.title")}
            className="relative grid grid-cols-3"
          >
            <div
              aria-hidden
              className="absolute inset-y-0 transition-transform duration-[260ms] ease-in-out"
              style={{
                width: `${100 / THEME_OPTIONS.length}%`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            >
              <div className="absolute inset-0.5 rounded-[10px] bg-accent" />
            </div>
            {THEME_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={active === option}
                onClick={() => setTheme(option)}
                className={`relative z-10 flex h-9 items-center justify-center rounded-[10px] text-sm font-medium transition-colors duration-200 ${
                  active === option ? "text-white" : "text-text-muted"
                }`}
              >
                {labels[option]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
