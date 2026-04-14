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
            Date de mise a jour : 29/03/2026. Les presentes conditions generales
            de vente s&apos;appliquent a toutes les reservations effectuees sur
            le site The Nice Picnic.
          </p>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              1. Identite du vendeur
            </h2>
            <p>
              The Nice Picnic - Micro-entreprise (auto-entrepreneur), APE 9329Z.
              <br />
              Adresse : [A COMPLETER]
              <br />
              SIREN : [A COMPLETER]
              <br />
              Email : hello@thenicepicnic.com
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              2. Objet
            </h2>
            <p>
              Les CGV definissent les droits et obligations des parties dans le
              cadre de la vente en ligne de prestations de pique-nique cle en
              main, kits et options proposes par The Nice Picnic.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              3. Prestations et disponibilite
            </h2>
            <p>
              Les offres (Kit, Medium, Prestige, options) sont celles presentes
              sur le site au jour de la commande. Les prestations sont
              proposees sous reserve de disponibilite, conditions meteo,
              saisonnalite et contraintes logistiques locales.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              4. Prix
            </h2>
            <p>
              Les prix sont indiques en euros TTC. The Nice Picnic se reserve le
              droit de modifier ses tarifs a tout moment ; la prestation est
              facturee au tarif en vigueur au moment de la validation de la
              commande.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              5. Reservation et paiement
            </h2>
            <p>
              La reservation devient ferme apres validation du paiement en ligne
              via Stripe. Le client garantit etre pleinement habilite a utiliser
              le moyen de paiement fourni.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              6. Caution materiel
            </h2>
            <p>
              Une pre-autorisation bancaire de 200 EUR peut etre demandee pour
              couvrir la degradation, la perte ou la non-restitution du
              materiel. Cette somme n&apos;est pas encaissee sauf en cas de
              dommage constate.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              7. Annulation et report
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Annulation a plus de 7 jours : remboursement a 100 %.</li>
              <li>Annulation entre 3 et 7 jours : remboursement a 50 %.</li>
              <li>Annulation a moins de 48h : non remboursable.</li>
              <li>
                En cas de meteo defavorable, un report de date est propose selon
                disponibilites.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              8. Obligations du client
            </h2>
            <p>
              Le client s&apos;engage a respecter les horaires, les lieux
              communiques, le materiel mis a disposition et les regles de
              securite. Toute utilisation abusive, dangereuse ou illicite de la
              prestation engage sa responsabilite.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              9. Responsabilite
            </h2>
            <p>
              The Nice Picnic est tenue a une obligation de moyens. Sa
              responsabilite ne saurait etre engagee en cas de force majeure,
              faits imputables a un tiers, ou mauvaise execution due au client.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              10. Droit de retractation
            </h2>
            <p>
              Conformement a l&apos;article L221-28 du Code de la consommation,
              le droit de retractation ne s&apos;applique pas aux prestations de
              services de loisirs fournies a une date ou periode determinee.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              11. Donnees personnelles
            </h2>
            <p>
              Les donnees collectees sont traitees pour la gestion des
              reservations et la relation client. Le client peut exercer ses
              droits d&apos;acces, rectification et suppression en ecrivant a
              hello@thenicepicnic.com.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              12. Droit applicable et litiges
            </h2>
            <p>
              Les presentes CGV sont soumises au droit francais. En cas de
              litige, une resolution amiable est privilegiee avant toute action
              judiciaire. A defaut d&apos;accord, competence est attribuee aux
              juridictions francaises competentes.
            </p>
          </section>

          <section className="space-y-2 rounded-md border border-[var(--bg3)] bg-[var(--bg2)] p-4">
            <h2 className="font-medium uppercase tracking-[0.08em]">
              Mediation de la consommation
            </h2>
            <p>
              Conformement aux articles L.611-1 et suivants du Code de la
              consommation, le client a le droit de recourir gratuitement a un
              mediateur de la consommation en vue de la resolution amiable d&apos;un
              litige.
            </p>
            <p>
              Mediateur propose : [A COMPLETER - Nom de l&apos;organisme]
              <br />
              Site internet : [A COMPLETER]
              <br />
              Adresse postale : [A COMPLETER]
            </p>
            <p>
              Plateforme europeenne de reglement en ligne des litiges (RLL) :
              https://ec.europa.eu/consumers/odr
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
              A EUR 200 card pre-authorization may be requested to cover damage,
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
