export type FaqItem = { id: string; q: string; a: string };
export type FaqCategory = { id: string; title: string; items: FaqItem[] };

const fr: FaqCategory[] = [
  {
    id: "packages",
    title: "Les packages & tarifs",
    items: [
      {
        id: "medium-vs-premium",
        q: "Quelle est la différence entre le Medium et le Premium ?",
        a: "Le Medium (59€/pers) est notre expérience bohème signature : installation complète, apéritif niçois, boissons, enceinte bluetooth, 1h30 sur site. Le Premium (79€/pers) inclut tout cela avec une décoration plus complète, des lampes marocaines, une petite toile créative avec pinceaux, et une imprimante photo instantanée pour repartir avec vos souvenirs imprimés.",
      },
      {
        id: "pricing",
        q: "Combien coûte un pique-nique organisé à Nice ?",
        a: "Nos packages démarrent à 39€/pers pour le Wellness Picnic (yoga + brunch). Le Medium est à 59€/pers, le Premium à 79€/pers et le Floating Picnic à 89€/pers. Tous nos prix sont par personne, tout inclus (installation, nourriture, boissons, décoration).",
      },
      {
        id: "food-included",
        q: "Le prix inclut-il la nourriture et les boissons ?",
        a: "Oui, pour tous les packages sauf le Kit (qui propose la nourriture en option à +10€/pers). Les packages Medium, Premium, Wellness et Floating Picnic incluent l'apéritif niçois et les boissons.",
      },
      {
        id: "group-size",
        q: "Peut-on commander une formule pour plus de 2 personnes ?",
        a: "Oui, pour les packages terrestre (Medium, Premium), nous accueillons jusqu'à 8 personnes. Le Floating Picnic est limité à 2 personnes maximum. Pour les groupes de plus de 8 (EVJF, anniversaires...), contactez-nous à hello@thenicepicnic.com pour un devis sur-mesure.",
      },
      {
        id: "deposit",
        q: "Y a-t-il une caution ?",
        a: "Oui, une pré-autorisation de 200€ est effectuée sur votre carte bancaire à la réservation. Ce n'est pas un débit — la somme est simplement bloquée puis libérée intégralement après la prestation et le retour du matériel en bon état.",
      },
    ],
  },
  {
    id: "process",
    title: "Le déroulement",
    items: [
      {
        id: "how-it-works",
        q: "Comment se déroule concrètement la prestation ?",
        a: "Vous réservez en ligne et payez par carte. Avant votre arrivée, nos équipes installent le pique-nique complet sur le spot. Vous arrivez à l'heure convenue au point de rendez-vous que nous vous communiquons. Vous profitez. Nous débarrassons une fois la durée écoulée.",
      },
      {
        id: "meeting-point",
        q: "Où se trouve le point de rendez-vous ?",
        a: "Les coordonnées exactes du spot vous sont communiquées par email 24h avant la prestation. Nous ne les divulguons pas avant pour préserver le caractère exclusif et la surprise de la découverte du lieu.",
      },
      {
        id: "duration",
        q: "Combien de temps dure la prestation ?",
        a: "Medium : 1h30 sur site. Premium : 2h sur site. Floating Picnic : 1h30 sur l'eau. Wellness Picnic : 2h (1h yoga + 1h brunch). Ces durées sont garanties à partir de votre arrivée.",
      },
      {
        id: "what-to-bring",
        q: "Faut-il apporter quelque chose ?",
        a: "Non, absolument rien. Tout est fourni : nourriture, boissons, vaisselle, décoration, enceinte bluetooth. Venez juste avec votre téléphone pour les photos (et chargé, de préférence !).",
      },
      {
        id: "parking",
        q: "Y a-t-il un parking à proximité des spots ?",
        a: "Oui. Les indications d'accès et les options de stationnement vous sont communiquées avec les coordonnées du spot, 24h avant la prestation.",
      },
    ],
  },
  {
    id: "weather",
    title: "Météo & annulations",
    items: [
      {
        id: "rain",
        q: "Que se passe-t-il s'il pleut ?",
        a: "En cas de prévisions météorologiques défavorables, nous vous contactons la veille avant 18h pour vous proposer un report de date gratuit. Les reports sont valables 3 mois. Pas d'inquiétude — nous surveillons la météo de notre côté et prenons l'initiative de vous alerter.",
      },
      {
        id: "cancellation",
        q: "Quelle est la politique d'annulation ?",
        a: "Annulation à plus de 7 jours : remboursement intégral. Entre 3 et 7 jours : remboursement à 50%. Moins de 48h : aucun remboursement. En cas de météo défavorable à notre initiative : report gratuit sans condition.",
      },
      {
        id: "rain-during",
        q: "Que se passe-t-il si la météo se dégrade pendant la prestation ?",
        a: "Si une averse soudaine survient une fois la prestation commencée, nous ne pouvons malheureusement pas rembourser (la prestation ayant déjà débuté). C'est pourquoi nous recommandons de vérifier les prévisions météo détaillées le matin même.",
      },
    ],
  },
  {
    id: "floating",
    title: "Le Floating Picnic",
    items: [
      {
        id: "floating-what",
        q: "C'est quoi exactement le Floating Picnic ?",
        a: "Le Floating Picnic, c'est un pique-nique sur l'eau. Une embarcation gonflable est aménagée avec une décoration bohème et ancrée dans une crique à environ 30m du rivage. Vous y accédez à bord d'un kayak ou en barque. C'est l'expérience la plus insolite de notre gamme.",
      },
      {
        id: "floating-swim",
        q: "Faut-il savoir nager pour le Floating Picnic ?",
        a: "Des gilets de sauvetage sont fournis et obligatoires. Cependant, nous déconseillons cette expérience aux personnes ne sachant pas du tout nager ou sujettes au mal de mer. L'eau peut atteindre 1 à 2 mètres de profondeur selon les zones.",
      },
      {
        id: "floating-season",
        q: "Le Floating Picnic est-il disponible toute l'année ?",
        a: "Le Floating Picnic est disponible de mai à octobre, selon les conditions météorologiques marines. En dehors de cette période, les températures de l'eau et les conditions de mer ne permettent pas de garantir une expérience optimale.",
      },
      {
        id: "floating-bath",
        q: "Peut-on se baigner pendant le Floating Picnic ?",
        a: "Oui, c'est même prévu ! Masques, tubas, échelle et serviettes sont inclus. C'est l'un des grands avantages du Floating Picnic vs le pique-nique terrestre.",
      },
    ],
  },
  {
    id: "occasions",
    title: "Occasions spéciales",
    items: [
      {
        id: "proposal",
        q: "Proposez-vous des formules pour une demande en mariage ?",
        a: "Absolument. Le package Premium est idéal pour une demande en mariage. Nous pouvons personnaliser la décoration, ajouter des fleurs fraîches sur demande, et vous recommander des photographes partenaires. Contactez-nous à hello@thenicepicnic.com pour organiser votre surprise.",
      },
      {
        id: "evjf",
        q: "Est-ce que The Nice Picnic est adapté pour un EVJF ?",
        a: "Oui, nous accueillons régulièrement des groupes EVJF, surtout pour les packages Medium et Premium. Pour les groupes de plus de 6 personnes, contactez-nous directement pour adapter l'installation.",
      },
      {
        id: "gift-card",
        q: "Peut-on acheter un bon cadeau ?",
        a: "Oui, des bons cadeaux sont disponibles sur notre site pour tous les packages. Ils sont valables 6 mois et disponibles en format digital (envoi immédiat) ou en coffret physique.",
      },
      {
        id: "vegetarian",
        q: "Proposez-vous des options végétariennes ?",
        a: "Oui. Signalez vos préférences alimentaires lors de la réservation et nous adaptons les menus. Nos menus Brunch et Planche Apéro sont naturellement adaptables en version végétarienne.",
      },
      {
        id: "getyourguide",
        q: "Est-ce que The Nice Picnic est disponible sur GetYourGuide ?",
        a: "Oui, vous pouvez retrouver et réserver nos expériences directement sur GetYourGuide. La réservation directe sur notre site (thenicepicnic.com) vous permet de bénéficier des prix sans commission de plateforme.",
      },
    ],
  },
];

const en: FaqCategory[] = [
  {
    id: "packages",
    title: "Packages & pricing",
    items: [
      {
        id: "medium-vs-premium",
        q: "What's the difference between Medium and Premium?",
        a: "Medium (€59/person) is our signature bohemian experience: full setup, Niçoise apéritif, drinks, Bluetooth speaker, 1h30 on site. Premium (€79/person) includes everything above plus richer décor, Moroccan lamps, a small creative canvas with brushes, and an instant photo printer so you leave with printed memories.",
      },
      {
        id: "pricing",
        q: "How much does an organised picnic in Nice cost?",
        a: "Packages start at €39/person for the Wellness Picnic (yoga + brunch). Medium is €59/person, Premium €79/person and Floating Picnic €89/person. All prices are per person, all inclusive (setup, food, drinks, décor).",
      },
      {
        id: "food-included",
        q: "Does the price include food and drinks?",
        a: "Yes, for all packages except the Kit (food optional at +€10/person). Medium, Premium, Wellness and Floating Picnic include Niçoise apéritif and drinks.",
      },
      {
        id: "group-size",
        q: "Can we book for more than 2 people?",
        a: "Yes — land packages (Medium, Premium) welcome up to 8 guests. Floating Picnic is limited to 2 people maximum. For groups over 8 (hen parties, birthdays…), email hello@thenicepicnic.com for a custom quote.",
      },
      {
        id: "deposit",
        q: "Is there a security deposit?",
        a: "Yes — a €200 pre-authorisation is placed on your card at booking. It is not a charge; the amount is held and fully released after your experience once equipment is returned in good condition.",
      },
    ],
  },
  {
    id: "process",
    title: "How it works",
    items: [
      {
        id: "how-it-works",
        q: "What happens on the day?",
        a: "You book online and pay by card. Before you arrive, our team sets up the full picnic on the spot. You come at the agreed time to the meeting point we share with you. You enjoy. We clear everything when your time slot ends.",
      },
      {
        id: "meeting-point",
        q: "Where is the meeting point?",
        a: "Exact spot coordinates are emailed 24 hours before your experience. We don't share them earlier to preserve exclusivity and the surprise of discovering the location.",
      },
      {
        id: "duration",
        q: "How long does the experience last?",
        a: "Medium: 1h30 on site. Premium: 2 hours on site. Floating Picnic: 1h30 on the water. Wellness Picnic: 2 hours (1h yoga + 1h brunch). These durations are guaranteed from your arrival.",
      },
      {
        id: "what-to-bring",
        q: "Do we need to bring anything?",
        a: "No — absolutely nothing. Everything is provided: food, drinks, tableware, décor, Bluetooth speaker. Just bring your phone for photos (charged, ideally!).",
      },
      {
        id: "parking",
        q: "Is there parking near the spots?",
        a: "Yes. Access directions and parking options are sent with spot coordinates, 24 hours before your experience.",
      },
    ],
  },
  {
    id: "weather",
    title: "Weather & cancellations",
    items: [
      {
        id: "rain",
        q: "What if it rains?",
        a: "If the forecast looks unfavourable, we contact you the day before by 6pm to offer a free reschedule. Reschedules are valid for 3 months. We monitor the weather and proactively reach out.",
      },
      {
        id: "cancellation",
        q: "What is the cancellation policy?",
        a: "More than 7 days before: full refund. 3–7 days: 50% refund. Less than 48 hours: no refund. Weather-related reschedule initiated by us: free, no conditions.",
      },
      {
        id: "rain-during",
        q: "What if weather turns bad during the experience?",
        a: "If a sudden shower starts once the experience has begun, we unfortunately cannot refund (the service has already started). We recommend checking the detailed forecast on the morning of your picnic.",
      },
    ],
  },
  {
    id: "floating",
    title: "Floating Picnic",
    items: [
      {
        id: "floating-what",
        q: "What exactly is the Floating Picnic?",
        a: "Floating Picnic is a picnic on the water. An inflatable craft is styled in bohemian décor and anchored in a cove about 30m from shore. You reach it by kayak or small boat. It's the most unusual experience in our range.",
      },
      {
        id: "floating-swim",
        q: "Do you need to know how to swim?",
        a: "Life jackets are provided and mandatory. However, we don't recommend this experience for non-swimmers or those prone to seasickness. Water depth can reach 1–2 metres depending on the area.",
      },
      {
        id: "floating-season",
        q: "Is Floating Picnic available year-round?",
        a: "Floating Picnic runs from May to October, depending on sea conditions. Outside that period, water temperature and sea state don't allow us to guarantee an optimal experience.",
      },
      {
        id: "floating-bath",
        q: "Can you swim during Floating Picnic?",
        a: "Yes — that's part of the fun! Masks, snorkels, ladder and towels are included. It's one of the big advantages vs a land picnic.",
      },
    ],
  },
  {
    id: "occasions",
    title: "Special occasions",
    items: [
      {
        id: "proposal",
        q: "Do you offer marriage proposal packages?",
        a: "Absolutely. Premium is ideal for a proposal. We can personalise décor, add fresh flowers on request, and recommend partner photographers. Email hello@thenicepicnic.com to plan your surprise.",
      },
      {
        id: "evjf",
        q: "Is The Nice Picnic suitable for hen parties?",
        a: "Yes — we regularly host hen parties, especially Medium and Premium. For groups over 6, contact us directly to adapt the setup.",
      },
      {
        id: "gift-card",
        q: "Can I buy a gift voucher?",
        a: "Yes — gift vouchers are available for all packages. Valid 6 months, in digital format (instant email) or physical gift box.",
      },
      {
        id: "vegetarian",
        q: "Do you offer vegetarian options?",
        a: "Yes. Tell us your dietary preferences when booking and we'll adapt menus. Our Brunch and Apéro Platter menus are naturally easy to make vegetarian.",
      },
      {
        id: "getyourguide",
        q: "Can I book on GetYourGuide?",
        a: "Yes — you can find and book our experiences on GetYourGuide. Booking directly on thenicepicnic.com lets you benefit from prices without platform commission.",
      },
    ],
  },
];

/** IDs shown on the homepage FAQ (6 most frequent). */
export const HOME_FAQ_ITEM_IDS = [
  "pricing",
  "medium-vs-premium",
  "how-it-works",
  "rain",
  "floating-what",
  "gift-card",
] as const;

export function getFaqCategories(locale: string): FaqCategory[] {
  return locale === "en" ? en : fr;
}

export function getAllFaqItems(locale: string): FaqItem[] {
  return getFaqCategories(locale).flatMap((c) => c.items);
}

export function getHomeFaqItems(locale: string): FaqItem[] {
  const all = getAllFaqItems(locale);
  const byId = new Map(all.map((item) => [item.id, item]));
  return HOME_FAQ_ITEM_IDS.map((id) => byId.get(id)).filter(
    (item): item is FaqItem => item != null,
  );
}
