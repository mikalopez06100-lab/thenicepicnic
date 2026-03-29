"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

const anchors = [
  { key: "concept" as const, hash: "#concept" },
  { key: "packages" as const, hash: "#packages" },
  { key: "menus" as const, hash: "#menus" },
  { key: "spots" as const, hash: "#spots" },
  { key: "faq" as const, hash: "#faq" },
];

export function SiteNav() {
  const t = useTranslations("Nav");
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav
        id="nav"
        className={`nav ${solid ? "solid" : ""} ${open ? "menu-open" : ""}`}
        aria-label={t("ariaMain")}
      >
        <Link href="/" className="nav-logo">
          <span>The</span> Nice <em>Picnic</em>
        </Link>
        <div className="nav-links">
          <LanguageSwitcher />
          {anchors.map((a) => (
            <a key={a.hash} href={a.hash} className="nav-link">
              {t(a.key)}
            </a>
          ))}
          <Link href="/reservation" className="nav-cta btn">
            {t("reserve")}
          </Link>
        </div>
        <button
          type="button"
          className="nav-burger"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      <div
        className={`nav-mobile-panel ${open ? "open" : ""}`}
        id="nav-mobile"
        aria-hidden={!open}
      >
        <button
          type="button"
          className="nav-mobile-close"
          aria-label={t("close")}
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <div className="nav-mobile-lang">
          <LanguageSwitcher />
        </div>
        {anchors.map((a) => (
          <a key={a.hash} href={a.hash} onClick={() => setOpen(false)}>
            {t(a.key)}
          </a>
        ))}
        <Link
          href="/reservation"
          className="nav-cta-mobile"
          onClick={() => setOpen(false)}
        >
          {t("reserve")}
        </Link>
      </div>
    </>
  );
}
