/**
 * Vérifie l'intégration GYG (health + endpoints authentifiés).
 * Usage : node scripts/verify-gyg-integration.mjs [baseUrl]
 */
const baseUrl = (
  process.argv[2] ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.thenicepicnic.com"
).replace(/\/$/, "");

const user = process.env.GYG_API_USERNAME || "";
const pass = process.env.GYG_API_PASSWORD || "";
const token = process.env.GYG_API_TOKEN || "";

function authHeaders() {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  if (user && pass) {
    return {
      Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`,
    };
  }
  return {};
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { url, status: response.status, json };
}

function futureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log(`\n🔍 Vérification GYG — ${baseUrl}\n`);

  const health = await request("/api/gyg/health");
  console.log("GET /api/gyg/health", health.status);
  console.log(JSON.stringify(health.json, null, 2));

  if (!health.json?.integration) {
    console.error("\n❌ Intégration désactivée (GYG_INTEGRATION_ENABLED=false)");
    process.exit(1);
  }

  if (!health.json?.database) {
    console.warn("\n⚠️  Postgres non configuré — holds GYG non persistants");
  }

  if (!health.json?.authConfigured) {
    console.warn(
      "\n⚠️  Auth GYG non configurée sur le serveur — les endpoints protégés renverront 401",
    );
  }

  const products = await request("/api/gyg/1/products");
  console.log("\nGET /api/gyg/1/products", products.status);
  if (products.status === 401) {
    console.error("❌ Auth refusée — configurez GYG_API_USERNAME/PASSWORD ou TOKEN");
    process.exit(1);
  }
  console.log(JSON.stringify(products.json, null, 2));

  const productId =
    products.json?.data?.products?.[0]?.productId || "medium";
  const from = futureDate(14);
  const to = futureDate(21);

  const avail = await request(
    `/api/gyg/1/get-availabilities?productId=${productId}&fromDate=${from}&toDate=${to}`,
  );
  console.log(`\nGET /api/gyg/1/get-availabilities (${from} → ${to})`, avail.status);
  const slots = avail.json?.data?.availabilities?.length ?? 0;
  const withVacancy =
    avail.json?.data?.availabilities?.filter((a) => a.vacancies > 0).length ?? 0;
  console.log(`  → ${slots} créneaux, ${withVacancy} avec places libres`);

  if (avail.status !== 200) {
    console.error("❌ Échec get-availabilities");
    console.log(JSON.stringify(avail.json, null, 2));
    process.exit(1);
  }

  if (withVacancy < 2) {
    console.warn(
      "\n⚠️  GYG exige au moins 2 créneaux disponibles pour valider le mapping",
    );
  }

  const openSlot = avail.json?.data?.availabilities?.find(
    (a) => a.vacancies > 0,
  );
  if (openSlot) {
    const reserve = await request("/api/gyg/1/reserve", {
      method: "POST",
      body: JSON.stringify({
        productId,
        dateTime: openSlot.dateTime,
        bookingItems: [{ category: "ADULT", count: 2 }],
        gygBookingReference: `test-${Date.now()}`,
      }),
    });
    console.log("\nPOST /api/gyg/1/reserve", reserve.status);
    const ref = reserve.json?.data?.reservationReference;
    console.log("  → reservationReference:", ref || "—");

    if (ref) {
      const cancel = await request("/api/gyg/1/cancel-reservation", {
        method: "POST",
        body: JSON.stringify({ reservationReference: ref }),
      });
      console.log("POST /api/gyg/1/cancel-reservation", cancel.status);
    }
  }

  console.log("\n✅ Vérification terminée\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
