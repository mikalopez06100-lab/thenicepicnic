import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("mentions.title")} — The Nice Picnic`,
  };
}

export default async function MentionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const isFr = locale === "fr";

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-8 font-[family-name:var(--font-cormorant)] text-3xl font-light">
        {t("mentions.title")}
      </h1>
      {isFr ? (
        <article className="space-y-6 text-sm leading-7 text-[var(--ink2)]">
          <p className="text-[var(--muted)]">
            Mentions légales du site THE NICE PICNIC.
          </p>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              1. Éditeur du site
            </h2>
            <p>
              Le présent site internet{" "}
              <a
                href="https://thenicepicnic.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                https://thenicepicnic.com
              </a>{" "}
              est édité par :
              <br />
              THE NICE PICNIC
              <br />
              Association loi 1901
              <br />
              Siège social :
              <br />
              22 Avenue Gustavin, 06300 Nice – France
              <br />
              Email : hello@thenicepicnic.com
              <br />
              Responsable de la publication :
              <br />
              Le représentant légal de l&apos;association THE NICE PICNIC
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              2. Hébergement
            </h2>
            <p>
              Le site est hébergé par :
              <br />
              IONOS SE
              <br />
              Elgendorfer Str. 57
              <br />
              56410 Montabaur
              <br />
              Allemagne
              <br />
              Site web :{" "}
              <a
                href="https://www.ionos.fr"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                https://www.ionos.fr
              </a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              3. Objet du site
            </h2>
            <p>
              Le site thenicepicnic.com a pour objet de présenter et de
              permettre la réservation de prestations proposées par
              l&apos;association THE NICE PICNIC, notamment des expériences de
              pique-nique, événements et prestations associées.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              4. Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble des contenus présents sur le site (textes, images,
              graphismes, logos, vidéos, structure, etc.) est protégé par le
              droit de la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification ou exploitation,
              totale ou partielle, sans autorisation écrite préalable de THE
              NICE PICNIC est strictement interdite.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              5. Données personnelles
            </h2>
            <p>
              Les informations collectées via le site sont utilisées uniquement
              dans le cadre de la gestion des réservations et de la relation
              client.
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD) :
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                vous disposez d&apos;un droit d&apos;accès, de rectification et
                de suppression de vos données
              </li>
              <li>
                vous pouvez exercer ce droit en écrivant à :
                hello@thenicepicnic.com
              </li>
            </ul>
            <p>Les données ne sont ni vendues ni cédées à des tiers.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              6. Cookies
            </h2>
            <p>
              Le site peut utiliser des cookies afin d&apos;améliorer
              l&apos;expérience utilisateur et de mesurer l&apos;audience.
            </p>
            <p>
              L&apos;utilisateur peut configurer son navigateur pour refuser les
              cookies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              7. Responsabilité
            </h2>
            <p>
              THE NICE PICNIC s&apos;efforce d&apos;assurer l&apos;exactitude des
              informations diffusées sur le site.
            </p>
            <p>Cependant, l&apos;association ne saurait être tenue responsable :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>des erreurs ou omissions</li>
              <li>d&apos;une indisponibilité du site</li>
              <li>d&apos;un mauvais usage des informations fournies</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              8. Droit applicable
            </h2>
            <p>Les présentes mentions légales sont soumises au droit français.</p>
          </section>
        </article>
      ) : (
        <p className="text-[var(--muted)]">{t("mentions.body")}</p>
      )}
      <Link
        href="/"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {t("mentions.back")}
      </Link>
    </main>
  );
}
