import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { homeImages } from "./images";
import { HomeFaq } from "./HomeFaq";
import { Reveal } from "./Reveal";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

type SpotRow = { tag: string; title: string; small: string; alt: string };

const spotImgs = [
  homeImages.spotChateau,
  homeImages.spotBoron,
  homeImages.spotPromenade,
  homeImages.spotHauteurs,
  homeImages.spotCimiez,
] as const;

const em = (chunks: React.ReactNode) => <em>{chunks}</em>;

export async function HomeView() {
  const t = await getTranslations("Home");
  const marquee = t.raw("marquee") as string[];
  const ticker = t.raw("ticker") as string[];
  const spots = t.raw("spots.list") as SpotRow[];

  return (
    <>
      <SiteNav />
      <header className="hero">
        <div className="hero-bg">
          <Image
            src={homeImages.hero}
            alt={t("hero.imgAlt")}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-inner">
          <p className="hero-tag">{t("hero.tag")}</p>
          <h1>{t.rich("hero.titleRich", { em })}</h1>
          <p className="hero-p">{t("hero.lead")}</p>
          <div className="hero-btns">
            <a href="#packages" className="btn btn-fill">
              {t("hero.ctaPackages")}
            </a>
            <a href="#spots" className="btn btn-ghost">
              {t("hero.ctaSpots")}
            </a>
          </div>
        </div>
      </header>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...marquee, ...marquee].map((text, i) => (
            <span key={`${text}-${i}`} className="marquee-item">
              {text} &nbsp;◇&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section className="sec" id="concept" style={{ background: "var(--bg)" }}>
        <Reveal>
          <div className="sec-inner">
            <p className="tag">{t("concept.tag")}</p>
            <h2 className="t">{t.rich("concept.titleRich", { em })}</h2>
            <p className="desc">{t("concept.desc")}</p>
            <div className="concept-grid">
              <div className="c-step">
                <span style={{ fontSize: 28 }}>📱</span>
                <h3>{t("concept.step1Title")}</h3>
                <p>{t("concept.step1Text")}</p>
              </div>
              <div className="c-step">
                <span style={{ fontSize: 28 }}>📍</span>
                <h3>{t("concept.step2Title")}</h3>
                <p>{t("concept.step2Text")}</p>
              </div>
              <div className="c-step">
                <span style={{ fontSize: 28 }}>✨</span>
                <h3>{t("concept.step3Title")}</h3>
                <p>{t("concept.step3Text")}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="ed">
        <div className="ed-img relative min-h-[260px]">
          <Image
            src={homeImages.editorialConcept}
            alt={t("editorial1.imgAlt")}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="ed-txt">
          <p className="tag">{t("editorial1.tag")}</p>
          <h2 className="t">{t.rich("editorial1.titleRich", { em })}</h2>
          <p className="desc">{t("editorial1.desc")}</p>
        </div>
      </section>

      <section className="sec" id="packages" style={{ background: "var(--bg2)" }}>
        <Reveal>
          <div className="sec-inner">
            <p className="tag">{t("packages.tag")}</p>
            <h2 className="t">{t.rich("packages.titleRich", { em })}</h2>
            <p className="desc">{t("packages.desc")}</p>
            <div className="pkg-cards">
              <div className="pkg">
                <div className="pkg-top">
                  <div>
                    <div className="pkg-name">{t("packages.kit.name")}</div>
                    <div className="pkg-mode">{t("packages.kit.mode")}</div>
                  </div>
                  <div>
                    <div className="pkg-price">29,90€</div>
                    <div className="pkg-per">{t("packages.perPerson")}</div>
                  </div>
                </div>
                <div className="pkg-line" />
                <div className="pkg-items">
                  {(t.raw("packages.kit.items") as string[]).map((line) => (
                    <div key={line} className="pkg-item">
                      {line}
                    </div>
                  ))}
                </div>
                <div className="pkg-foot">{t("packages.kit.foot")}</div>
                <Link
                  href="/reservation?package=kit"
                  className="pkg-btn block text-center"
                >
                  {t("packages.kit.cta")}
                </Link>
              </div>

              <div className="pkg pop">
                <div className="pkg-badge">{t("packages.popular")}</div>
                <div className="pkg-top">
                  <div>
                    <div className="pkg-name">{t("packages.medium.name")}</div>
                    <div className="pkg-mode">{t("packages.medium.mode")}</div>
                  </div>
                  <div>
                    <div className="pkg-price">59€</div>
                    <div className="pkg-per">{t("packages.perPerson")}</div>
                  </div>
                </div>
                <div className="pkg-line" />
                <div className="pkg-items">
                  {(t.raw("packages.medium.items") as string[]).map((line) => (
                    <div key={line} className="pkg-item">
                      {line}
                    </div>
                  ))}
                </div>
                <div className="pkg-foot">{t("packages.medium.foot")}</div>
                <Link
                  href="/reservation?package=medium"
                  className="pkg-btn block text-center"
                >
                  {t("packages.medium.cta")}
                </Link>
              </div>

              <div className="pkg prem">
                <div className="pkg-top">
                  <div>
                    <div className="pkg-name">{t("packages.prestige.name")}</div>
                    <div className="pkg-mode">{t("packages.prestige.mode")}</div>
                  </div>
                  <div>
                    <div className="pkg-price">79€</div>
                    <div className="pkg-per">{t("packages.perPerson")}</div>
                  </div>
                </div>
                <div className="pkg-line" />
                <div className="pkg-items">
                  {(t.raw("packages.prestige.items") as string[]).map((line) => (
                    <div key={line} className="pkg-item">
                      {line}
                    </div>
                  ))}
                </div>
                <div className="pkg-foot">{t("packages.prestige.foot")}</div>
                <Link
                  href="/reservation?package=prestige"
                  className="pkg-btn block text-center"
                >
                  {t("packages.prestige.cta")}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="sec" id="menus" style={{ background: "var(--bg)" }}>
        <Reveal>
          <div className="sec-inner">
            <p className="tag">{t("menus.tag")}</p>
            <h2 className="t">{t.rich("menus.titleRich", { em })}</h2>
            <p className="desc">{t("menus.desc")}</p>
            <div className="menu-cards">
              <div className="menu-card">
                <h4>{t("menus.brunchTitle")}</h4>
                <p>{t("menus.brunchText")}</p>
              </div>
              <div className="menu-card">
                <h4>{t("menus.dejeunerTitle")}</h4>
                <p>{t("menus.dejeunerText")}</p>
              </div>
              <div className="menu-card">
                <h4>{t("menus.aperoTitle")}</h4>
                <p>{t("menus.aperoText")}</p>
              </div>
            </div>
            <p
              style={{
                textAlign: "center",
                marginTop: 24,
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              {t("menus.drinksNote")}
            </p>
          </div>
        </Reveal>
      </section>

      <div className="ticker" aria-hidden>
        <div className="ticker-track">
          {[...ticker, ...ticker].map((text, i) => (
            <span key={`${text}-${i}`} className="ticker-item">
              {text}
              <span style={{ marginLeft: 24 }} />
            </span>
          ))}
        </div>
      </div>

      <section className="sec" style={{ background: "var(--bg2)" }}>
        <Reveal>
          <div className="sec-inner">
            <p className="tag">{t("bento.tag")}</p>
            <h2 className="t">{t.rich("bento.titleRich", { em })}</h2>
            <div className="bento-grid">
              <div className="b-card">
                <span style={{ fontSize: 22 }}>📸</span>
                <h4>{t("bento.b1t")}</h4>
                <p>{t("bento.b1p")}</p>
              </div>
              <div className="b-card img-only relative min-h-[200px]">
                <Image
                  src={homeImages.bentoSetup}
                  alt={t("bento.imgAlt")}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="b-card">
                <span style={{ fontSize: 22 }}>💌</span>
                <h4>{t("bento.b2t")}</h4>
                <p>{t("bento.b2p")}</p>
              </div>
              <div className="b-card dark">
                <span style={{ fontSize: 22 }}>🎵</span>
                <h4>{t("bento.b3t")}</h4>
                <p>{t("bento.b3p")}</p>
              </div>
              <div className="b-card">
                <span style={{ fontSize: 22 }}>🕯️</span>
                <h4>{t("bento.b4t")}</h4>
                <p>{t("bento.b4p")}</p>
              </div>
              <div className="b-card">
                <span style={{ fontSize: 22 }}>🌿</span>
                <h4>{t("bento.b5t")}</h4>
                <p>{t("bento.b5p")}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="sec pricing">
        <Reveal>
          <div className="sec-inner">
            <p className="tag">{t("pricing.tag")}</p>
            <h2 className="t">{t.rich("pricing.titleRich", { em })}</h2>
            <p className="desc">{t("pricing.desc")}</p>
            <table className="ptable">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>{t("pricing.colPackage")}</th>
                  <th>{t("pricing.colNoFood")}</th>
                  <th>{t("pricing.colWithFood")}</th>
                  <th>{t("pricing.colTwo")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("pricing.kitRow")}</td>
                  <td>29,90€</td>
                  <td>39,90€</td>
                  <td>79,80€</td>
                </tr>
                <tr>
                  <td>{t("pricing.mediumRow")}</td>
                  <td colSpan={2} style={{ color: "var(--terra)" }}>
                    {t("pricing.mediumAll")}
                  </td>
                  <td style={{ color: "var(--terra)" }}>118€</td>
                </tr>
                <tr>
                  <td>{t("pricing.prestigeRow")}</td>
                  <td colSpan={2} style={{ color: "var(--gold)" }}>
                    {t("pricing.prestigeAll")}
                  </td>
                  <td style={{ color: "var(--gold)" }}>158€</td>
                </tr>
              </tbody>
            </table>
            <p
              style={{
                marginTop: 20,
                fontSize: 12,
                color: "rgba(255,255,255,.2)",
              }}
            >
              {t("pricing.footnote")}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="img-div relative">
        <Image
          src={homeImages.dividerPromenade}
          alt={t("divider.imgAlt")}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="img-div-txt">
          <h3>{t("divider.title")}</h3>
          <p>{t("divider.subtitle")}</p>
        </div>
      </section>

      <section className="sec" id="spots" style={{ background: "var(--bg)" }}>
        <Reveal>
          <div className="sec-inner">
            <p className="tag">{t("spots.tag")}</p>
            <h2 className="t">{t.rich("spots.titleRich", { em })}</h2>
            <p className="desc">{t("spots.desc")}</p>
            <div className="spots-grid">
              {spots.map((s, i) => (
                <div key={s.title} className="spot">
                  <Image
                    src={spotImgs[i]}
                    alt={s.alt}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="spot-ov" />
                  <div className="spot-nfo">
                    <p className="tag" style={{ color: "var(--gold)" }}>
                      {s.tag}
                    </p>
                    <h3>{s.title}</h3>
                    <small>{s.small}</small>
                  </div>
                </div>
              ))}
            </div>
            <p
              style={{
                textAlign: "center",
                marginTop: 28,
                fontSize: 14,
                color: "var(--muted)",
              }}
            >
              {t("spots.more")}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="ed" style={{ direction: "rtl" }}>
        <div
          className="ed-img relative min-h-[260px]"
          style={{ direction: "ltr" }}
        >
          <Image
            src={homeImages.editorialPrestige}
            alt={t("editorialPrestige.imgAlt")}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="ed-txt" style={{ direction: "ltr" }}>
          <p className="tag">{t("editorialPrestige.tag")}</p>
          <h2 className="t">{t.rich("editorialPrestige.titleRich", { em })}</h2>
          <p className="desc">{t("editorialPrestige.desc")}</p>
          <Link
            href="/reservation?package=prestige"
            className="btn btn-fill"
            style={{ marginTop: 20 }}
          >
            {t("editorialPrestige.cta")}
          </Link>
        </div>
      </section>

      <section className="sec gift">
        <Reveal>
          <div className="sec-inner text-center">
            <p className="tag">{t("gift.tag")}</p>
            <h2 className="t">{t.rich("gift.titleRich", { em })}</h2>
            <p
              className="desc"
              style={{
                textAlign: "center",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {t("gift.desc")}
            </p>
            <Link href="/bon-cadeau" className="btn btn-white">
              {t("gift.cta")}
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="sec cta">
        <Reveal>
          <div className="sec-inner text-center">
            <h2 className="t">{t.rich("cta.titleRich", { em })}</h2>
            <p>{t("cta.lead")}</p>
            <Link href="/reservation" className="btn btn-cta">
              {t("cta.btn")}
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="sec" id="faq" style={{ background: "var(--bg)" }}>
        <Reveal>
          <div className="sec-inner">
            <p className="tag">{t("faqSection.tag")}</p>
            <h2 className="t">{t.rich("faqSection.titleRich", { em })}</h2>
            <HomeFaq />
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </>
  );
}
