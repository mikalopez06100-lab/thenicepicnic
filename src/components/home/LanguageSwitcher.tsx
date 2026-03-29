"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("LanguageSwitcher");

  return (
    <div
      className="lang-switch"
      role="group"
      aria-label={t("label")}
    >
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className={isActive ? "is-active" : undefined}
            lang={loc}
            aria-current={isActive ? "true" : undefined}
          >
            {loc === "fr" ? t("fr") : t("en")}
          </Link>
        );
      })}
    </div>
  );
}
