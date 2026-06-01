import type Stripe from "stripe";
import type { ReservationRecord } from "@/lib/reservations";
import {
  formatPaidAt,
  formatReservationDate,
  formatReservationTime,
  getPackageLabel,
  getSlotLabel,
  resolveReservationTime,
} from "@/lib/reservation-labels";

type NotifyResult = {
  admin: boolean;
  customer: boolean;
};

function getNotifyRecipients() {
  const raw =
    process.env.RESERVATION_NOTIFY_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "hello@thenicepicnic.com";
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function getFromEmail() {
  return (
    process.env.RESERVATION_FROM_EMAIL ||
    "The Nice Picnic <reservations@thenicepicnic.com>"
  );
}

function formatAmount(session?: Stripe.Checkout.Session) {
  if (!session?.amount_total) {
    return "—";
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: (session.currency || "eur").toUpperCase(),
  }).format(session.amount_total / 100);
}

function buildAdminHtml(reservation: ReservationRecord, session?: Stripe.Checkout.Session) {
  const dateLabel = formatReservationDate(reservation.reservationDate, reservation.locale);
  const timeLabel = formatReservationTime(
    resolveReservationTime(reservation.slot, reservation.reservationTime),
    reservation.locale,
  );
  const slotLabel = getSlotLabel(reservation.slot);
  const packageLabel = getPackageLabel(reservation.packageType);
  const paidLabel = formatPaidAt(reservation.paidAt, reservation.locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thenicepicnic.com";
  const adminUrl = `${siteUrl}/admin/reservations`;

  return `
    <div style="font-family:Georgia,serif;color:#1a1714;max-width:560px">
      <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#bf6b45;margin:0 0 8px">Nouvelle réservation</p>
      <h1 style="font-size:24px;font-weight:400;margin:0 0 20px">Paiement confirmé</h1>
      <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6">
        <tr><td style="padding:6px 0;color:#6b6560">Date</td><td style="padding:6px 0"><strong>${dateLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Heure</td><td style="padding:6px 0"><strong>${timeLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Créneau</td><td style="padding:6px 0"><strong>${slotLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Payé le</td><td style="padding:6px 0"><strong>${paidLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Package</td><td style="padding:6px 0"><strong>${packageLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Personnes</td><td style="padding:6px 0"><strong>${reservation.quantity}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Montant</td><td style="padding:6px 0"><strong>${formatAmount(session)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Client</td><td style="padding:6px 0"><strong>${reservation.customerName}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Email</td><td style="padding:6px 0">${reservation.customerEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Téléphone</td><td style="padding:6px 0">${reservation.customerPhone}</td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">Réf.</td><td style="padding:6px 0;font-size:12px">${reservation.id}</td></tr>
      </table>
      <p style="margin:24px 0 0">
        <a href="${adminUrl}" style="display:inline-block;background:#bf6b45;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase">Voir l'admin</a>
      </p>
    </div>
  `;
}

function buildCustomerHtml(reservation: ReservationRecord, session?: Stripe.Checkout.Session) {
  const isFr = reservation.locale === "fr";
  const dateLabel = formatReservationDate(reservation.reservationDate, reservation.locale);
  const timeLabel = formatReservationTime(
    resolveReservationTime(reservation.slot, reservation.reservationTime),
    reservation.locale,
  );
  const slotLabel = getSlotLabel(reservation.slot);
  const packageLabel = getPackageLabel(reservation.packageType);

  return `
    <div style="font-family:Georgia,serif;color:#1a1714;max-width:560px">
      <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#bf6b45;margin:0 0 8px">The Nice Picnic</p>
      <h1 style="font-size:24px;font-weight:400;margin:0 0 16px">${
        isFr ? "Réservation confirmée" : "Booking confirmed"
      }</h1>
      <p style="font-size:15px;line-height:1.6;color:#3d3835">${
        isFr
          ? `Merci ${reservation.customerName}, nous avons bien reçu votre paiement.`
          : `Thank you ${reservation.customerName}, we have received your payment.`
      }</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6;margin-top:16px">
        <tr><td style="padding:6px 0;color:#6b6560">${isFr ? "Date" : "Date"}</td><td style="padding:6px 0"><strong>${dateLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">${isFr ? "Heure" : "Time"}</td><td style="padding:6px 0"><strong>${timeLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">${isFr ? "Créneau" : "Timeslot"}</td><td style="padding:6px 0"><strong>${slotLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">${isFr ? "Package" : "Package"}</td><td style="padding:6px 0"><strong>${packageLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">${isFr ? "Personnes" : "Guests"}</td><td style="padding:6px 0"><strong>${reservation.quantity}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#6b6560">${isFr ? "Montant" : "Amount"}</td><td style="padding:6px 0"><strong>${formatAmount(session)}</strong></td></tr>
      </table>
      <p style="font-size:14px;line-height:1.6;color:#6b6560;margin-top:20px">${
        isFr
          ? "À très bientôt pour votre pique-nique sur la Côte d'Azur."
          : "See you soon for your French Riviera picnic."
      }</p>
    </div>
  `;
}

async function sendEmail(input: {
  to: string[];
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing — email not sent.");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Resend error", response.status, body);
    return false;
  }

  return true;
}

export async function sendReservationNotifications(
  reservation: ReservationRecord,
  session?: Stripe.Checkout.Session,
): Promise<NotifyResult> {
  const dateLabel = formatReservationDate(reservation.reservationDate, reservation.locale);
  const timeLabel = formatReservationTime(
    resolveReservationTime(reservation.slot, reservation.reservationTime),
    reservation.locale,
  );
  const slotLabel = getSlotLabel(reservation.slot);
  const packageLabel = getPackageLabel(reservation.packageType);
  const amount = formatAmount(session);
  const paidLabel = formatPaidAt(reservation.paidAt, reservation.locale);

  const adminText = [
    "Nouvelle réservation confirmée — The Nice Picnic",
    "",
    `Date : ${dateLabel}`,
    `Heure : ${timeLabel}`,
    `Créneau : ${slotLabel}`,
    `Payé le : ${paidLabel}`,
    `Package : ${packageLabel}`,
    `Personnes : ${reservation.quantity}`,
    `Montant : ${amount}`,
    `Client : ${reservation.customerName}`,
    `Email : ${reservation.customerEmail}`,
    `Téléphone : ${reservation.customerPhone}`,
    `Référence : ${reservation.id}`,
  ].join("\n");

  const isFr = reservation.locale === "fr";
  const customerText = [
    isFr
      ? "Votre réservation The Nice Picnic est confirmée."
      : "Your The Nice Picnic booking is confirmed.",
    "",
    `${isFr ? "Date" : "Date"} : ${dateLabel}`,
    `${isFr ? "Heure" : "Time"} : ${timeLabel}`,
    `${isFr ? "Créneau" : "Timeslot"} : ${slotLabel}`,
    `${isFr ? "Package" : "Package"} : ${packageLabel}`,
    `${isFr ? "Personnes" : "Guests"} : ${reservation.quantity}`,
    `${isFr ? "Montant" : "Amount"} : ${amount}`,
  ].join("\n");

  const [admin, customer] = await Promise.all([
    sendEmail({
      to: getNotifyRecipients(),
      subject: `Nouvelle réservation — ${dateLabel} (${slotLabel})`,
      html: buildAdminHtml(reservation, session),
      text: adminText,
    }),
    sendEmail({
      to: [reservation.customerEmail],
      subject: isFr
        ? `Confirmation — ${dateLabel} (${slotLabel})`
        : `Booking confirmed — ${dateLabel} (${slotLabel})`,
      html: buildCustomerHtml(reservation, session),
      text: customerText,
    }),
  ]);

  return { admin, customer };
}
