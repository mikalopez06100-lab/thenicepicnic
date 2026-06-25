import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <Image
            src="/images/brand/logo-main.png"
            alt="The Nice Picnic"
            width={132}
            height={132}
            className="footer-logo"
          />
          <p className="footer-desc">{t("tagline")}</p>
          <p className="footer-desc" style={{ marginTop: 12 }}>
            <Link href="/contact" className="underline-offset-2 hover:underline">
              {t("contactUs")}
            </Link>
          </p>
        </div>
        <div>
          <h4 className="footer-col-title">{t("colPackages")}</h4>
          <a href="#packages" className="fl">
            {t("medium")}
          </a>
          <a href="#packages" className="fl">
            {t("prestige")}
          </a>
          <a href="#packages" className="fl">
            {t("wellness")}
          </a>
          <a href="#packages" className="fl">
            {t("floating")}
          </a>
          <Link href="/galerie" className="fl">
            {t("gallery")}
          </Link>
          <a href="#avis" className="fl">
            {t("reviews")}
          </a>
          <a href="#menus" className="fl">
            {t("menusLink")}
          </a>
        </div>
        <div>
          <h4 className="footer-col-title">{t("colInfo")}</h4>
          <a href="#concept" className="fl">
            {t("concept")}
          </a>
          <a href="#spots" className="fl">
            {t("ourSpots")}
          </a>
          <a href="#faq" className="fl">
            {t("faq")}
          </a>
          <Link href="/cgv" className="fl">
            {t("terms")}
          </Link>
          <Link href="/mentions-legales" className="fl">
            {t("legal")}
          </Link>
        </div>
        <div>
          <h4 className="footer-col-title">{t("colContact")}</h4>
          <p className="footer-desc whitespace-pre-line">{t("contactBlock")}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t("copyright", { year })}</p>
        <p>{t("tagline2")}</p>
      </div>
    </footer>
  );
}
