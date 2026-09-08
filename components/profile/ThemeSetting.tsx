"use client";

import { useEffect, useState } from "react";
import { Moon, Smartphone, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/lib/i18n";
import { SettingsPickerRow } from "./SettingsPickerRow";

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

  const labels: Record<ThemeOption, string> = {
    light: t("profile.settings.theme.light"),
    dark: t("profile.settings.theme.dark"),
    system: t("profile.settings.theme.auto"),
  };

  const options = [
    { value: "light", label: labels.light, icon: <Sun className="h-5 w-5" /> },
    { value: "dark", label: labels.dark, icon: <Moon className="h-5 w-5" /> },
    {
      value: "system",
      label: labels.system,
      icon: <Smartphone className="h-5 w-5" />,
      description: t("profile.settings.theme.autoDescription"),
    },
  ];

  return (
    <SettingsPickerRow
      icon={<Moon className="h-5 w-5" />}
      title={t("profile.settings.theme.title")}
      valueLabel={labels[active]}
      options={options}
      selectedValue={active}
      onSelect={(value) => setTheme(value)}
    />
  );
}
