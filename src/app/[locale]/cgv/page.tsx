import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return {
    title: `${t("cgv.title")} — The Nice Picnic`,
  };
}

export default async function CgvPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const isFr = locale === "fr";

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="mb-8 font-[family-name:var(--font-cormorant)] text-3xl font-light">
        {t("cgv.title")}
      </h1>
      {isFr ? (
        <article className="space-y-6 text-sm leading-7 text-[var(--ink2)]">
          <p className="text-[var(--muted)]">
            Version finale des Conditions Générales de Vente de THE NICE PICNIC.
          </p>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 1 – Objet
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les
              prestations proposées par l&apos;association THE NICE PICNIC, dont
              le siège est situé au :
              <br />
              22 Avenue Gustavin, 06300 Nice
              <br />
              Email : hello@thenicepicnic.com
            </p>
            <p>THE NICE PICNIC propose des expériences de pique-nique comprenant :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>la mise à disposition de kits pique-nique</li>
              <li>des installations sur mesure</li>
              <li>l&apos;organisation d&apos;événements</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 2 – Acceptation des CGV
            </h2>
            <p>
              Toute commande implique l&apos;acceptation pleine et entière des
              présentes CGV.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 3 – Prestations
            </h2>
            <p>Les prestations incluent, selon le package choisi :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>mise à disposition de matériel (mobilier, décoration, accessoires)</li>
              <li>installation et désinstallation</li>
              <li>personnalisation de l&apos;expérience</li>
            </ul>
            <p>Le contenu exact est précisé lors de la commande.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 4 – Commande
            </h2>
            <p>La commande est validée après :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>paiement en ligne par carte bancaire</li>
              <li>confirmation envoyée par email</li>
            </ul>
            <p>
              THE NICE PICNIC se réserve le droit de refuser une commande en cas
              de demande anormale ou indisponibilité.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 5 – Prix et paiement
            </h2>
            <p>Les prix sont indiqués en euros.</p>
            <p>Le paiement s&apos;effectue en ligne par carte bancaire.</p>
            <p>Une caution obligatoire de 100€ est demandée pour toute prestation.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 6 – Caution et responsabilité financière
            </h2>
            <p>La caution couvre notamment :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>dégradations</li>
              <li>pertes</li>
              <li>vols</li>
              <li>matériel non restitué</li>
              <li>nettoyage anormal</li>
            </ul>
            <p>Elle est restituée après vérification à l&apos;issue de la prestation.</p>
            <p>
              En cas de dommages supérieurs au montant de la caution : THE NICE
              PICNIC se réserve le droit de facturer au client toute somme
              complémentaire nécessaire à la réparation du préjudice subi.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 7 – Conditions d&apos;annulation
            </h2>
            <p>Annulation par le client</p>
            <p>
              Plus de 7 jours avant la prestation : report de la prestation ou
              avoir valable 6 mois.
            </p>
            <p>Moins de 7 jours : aucun remboursement ni avoir.</p>
            <p>
              Absence ou retard : toute prestation non honorée du fait du client
              reste due dans sa totalité.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 8 – Conditions météorologiques
            </h2>
            <p>
              En cas de conditions météorologiques défavorables (pluie, vent,
              intempéries), THE NICE PICNIC se réserve le droit de proposer un
              report et une adaptation de la prestation peut être envisagée.
            </p>
            <p>Aucun remboursement ne sera effectué pour cause de météo.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 9 – Produits alimentaires et boissons
            </h2>
            <p>
              Dans le cadre de ses prestations, THE NICE PICNIC peut proposer des
              produits alimentaires et boissons. Ces produits sont fournis
              exclusivement par des prestataires partenaires indépendants.
            </p>
            <p>À ce titre :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>THE NICE PICNIC n&apos;agit pas en qualité de restaurateur</li>
              <li>
                la responsabilité liée aux produits (qualité, conservation,
                conformité) incombe au prestataire partenaire
              </li>
              <li>le client est responsable de la consommation des produits</li>
            </ul>
            <p>THE NICE PICNIC ne pourra être tenu responsable en cas :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>d&apos;allergie</li>
              <li>d&apos;intolérance</li>
              <li>de mauvaise utilisation ou conservation après remise</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 10 – Responsabilité
            </h2>
            <p>
              Le client est responsable du matériel mis à disposition pendant
              toute la durée de la prestation.
            </p>
            <p>Il s&apos;engage à :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>en faire un usage normal</li>
              <li>surveiller les équipements</li>
              <li>restituer l&apos;ensemble en bon état</li>
            </ul>
            <p>Toute dégradation pourra donner lieu à facturation.</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 11 – Utilisation des lieux
            </h2>
            <p>Le client est responsable du respect :</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>des lieux publics ou privés</li>
              <li>des règles locales</li>
              <li>de l&apos;environnement</li>
            </ul>
            <p>
              THE NICE PICNIC ne pourra être tenu responsable en cas de
              non-respect de la réglementation par le client.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 12 – Données personnelles
            </h2>
            <p>
              Les données collectées sont utilisées uniquement pour la gestion
              des commandes et la relation client. Elles ne sont ni vendues ni
              cédées à des tiers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Article 13 – Droit applicable
            </h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de
              litige, une solution amiable sera privilégiée avant toute action
              judiciaire.
            </p>
          </section>
        </article>
      ) : (
        <article className="space-y-6 text-sm leading-7 text-[var(--ink2)]">
          <p className="text-[var(--muted)]">
            Last updated: 29/03/2026. These terms and conditions apply to all
            bookings made on The Nice Picnic website.
          </p>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              1. Seller information
            </h2>
            <p>
              The Nice Picnic - Sole proprietorship (French micro-business), APE
              9329Z.
              <br />
              Address: [TO BE COMPLETED]
              <br />
              Company number (SIREN): [TO BE COMPLETED]
              <br />
              Email: hello@thenicepicnic.com
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              2. Purpose
            </h2>
            <p>
              These terms define the rights and obligations of the parties for
              online sales of turnkey picnic experiences, kits and optional
              services offered by The Nice Picnic.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              3. Services and availability
            </h2>
            <p>
              Offers (Kit, Medium, Prestige, options) are those shown on the
              website on the booking date. Services are subject to availability,
              weather conditions, seasonality and local logistics.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">4. Prices</h2>
            <p>
              Prices are shown in EUR, taxes included. The Nice Picnic may
              update prices at any time; the applicable price is the one in
              force at the time of booking confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              5. Booking and payment
            </h2>
            <p>
              A booking is confirmed once online payment is successfully
              validated via Stripe. The customer confirms they are authorized to
              use the selected payment method.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              6. Equipment deposit
            </h2>
            <p>
              A EUR 100 card pre-authorization may be requested to cover damage,
              loss, or non-return of equipment. This amount is not charged
              unless damage is confirmed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              7. Cancellation and rescheduling
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>More than 7 days before: 100% refund.</li>
              <li>Between 3 and 7 days before: 50% refund.</li>
              <li>Less than 48 hours before: non-refundable.</li>
              <li>
                In case of unsuitable weather, a new date is offered subject to
                availability.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              8. Customer obligations
            </h2>
            <p>
              Customers must comply with confirmed times, locations, equipment
              usage instructions and safety rules. Any abusive, unsafe or illegal
              use is the customer&apos;s responsibility.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              9. Liability
            </h2>
            <p>
              The Nice Picnic is bound by a best-efforts obligation. Liability
              cannot be engaged in cases of force majeure, third-party actions,
              or customer fault.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              10. Right of withdrawal
            </h2>
            <p>
              Under French Consumer Code article L221-28, the right of
              withdrawal does not apply to leisure services supplied for a
              specific date or period.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              11. Personal data
            </h2>
            <p>
              Personal data is processed to manage bookings and customer
              relations. Customers may exercise access, rectification and
              deletion rights by emailing hello@thenicepicnic.com.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              12. Applicable law and disputes
            </h2>
            <p>
              These terms are governed by French law. An amicable settlement is
              preferred before legal proceedings. Failing agreement, disputes are
              submitted to the competent French courts.
            </p>
          </section>
        </article>
      )}
      <Link
        href="/"
        className="mt-8 inline-block text-[var(--terra)] underline-offset-4 hover:underline"
      >
        {t("cgv.back")}
      </Link>
    </main>
  );
}
