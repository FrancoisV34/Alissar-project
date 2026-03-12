import db from './db.js';

// Clear existing data
db.exec(`
  DELETE FROM section_paragraphs;
  DELETE FROM sections;
  DELETE FROM formations;
  DELETE FROM pec_bubbles;
  DELETE FROM tarifs;
  DELETE FROM horaires;
  DELETE FROM contact_info;
  DELETE FROM avis_summary;
`);

// --- Sections (ids 1-3 from data.json) ---
const insertSection = db.prepare(
  'INSERT INTO sections (id, title, idlink, image, sort_order) VALUES (?, ?, ?, ?, ?)'
);
const insertParagraph = db.prepare(
  'INSERT INTO section_paragraphs (section_id, sort_order, text) VALUES (?, ?, ?)'
);

const sections = [
  {
    id: 1,
    title: "Bienvenue à mon cabinet d'ostéopathie à Vendargues",
    idlink: null,
    image: '/assets/Alissar.jpg',
    paragraphs: [
      "Bienvenue sur le site de mon cabinet d'ostéopathie à Vendargues !"
    ]
  },
  {
    id: 2,
    title: 'À propos de  moi',
    idlink: 'a-propos',
    image: '/assets/Cab.jpg',
    paragraphs: [
      "Je suis ravie de vous accueillir dans mon cabinet d'ostéopathie à Vendargues, où je vous propose des soins personnalisés et adaptés à vos besoins spécifiques. Diplômée de l'École Supérieure d'Ostéopathie (ESO) de Paris en 2021, j'ai acquis une solide formation qui me permet de traiter une large variété de pathologies et de troubles fonctionnels.",
      "Mon approche de l'ostéopathie est centrée sur le patient. Je prends le temps d'écouter vos préoccupations et de comprendre votre historique médical pour vous offrir un traitement sur mesure. Que vous souffriez de douleurs chroniques, de blessures sportives, ou que vous cherchiez simplement à améliorer votre bien-être général, je suis là pour vous aider."
    ]
  },
  {
    id: 3,
    title: "L'ostéopathie",
    idlink: 'osteo',
    image: '/assets/Visitcard.jpg',
    paragraphs: [
      "Pour prendre rendez-vous avec moi, vous pouvez utiliser la plateforme Doctolib, où vous trouverez mes disponibilités en temps réel et pourrez réserver votre consultation en quelques clics. C'est simple, rapide et sécurisé.",
      'Vous pouvez également me contacter directement par téléphone au 06 52 45 12 34. Je serai ravie de répondre à vos questions et de vous aider à trouver le créneau qui vous convient le mieux.',
      "Je suis impatiente de vous aider à améliorer votre santé et votre bien-être."
    ]
  }
];

const seedSections = db.transaction(() => {
  for (const s of sections) {
    insertSection.run(s.id, s.title, s.idlink, s.image, s.id);
    s.paragraphs.forEach((text, i) => insertParagraph.run(s.id, i + 1, text));
  }
});
seedSections();

// --- Formations (id 4 from data.json) ---
const insertFormation = db.prepare(
  'INSERT INTO formations (title, description, image, sort_order) VALUES (?, ?, ?, ?)'
);

const formations = [
  {
    title: "École Supérieure d'Ostéopathie (ESO) 2021 - Paris",
    description: "Diplômée de l'École Supérieure d'Ostéopathie (ESO) de Paris en 2021, j'ai acquis une formation complète et rigoureuse dans le domaine de l'ostéopathie. Cette école reconnue m'a permis de développer des compétences solides pour traiter efficacement mes patients.",
    image: '/assets/ESO-soleil.jpg',
    sort_order: 1
  },
  {
    title: 'Ostéopathie du sport et posturologie 2021',
    description: "Je me suis également formée en Ostéopathie du sport et posturologie en 2021. Cette spécialisation me permet de mieux comprendre et traiter les blessures sportives, ainsi que les problèmes de posture qui peuvent affecter les performances sportives et la vie quotidienne.",
    image: '/assets/posturosport.webp',
    sort_order: 2
  },
  {
    title: 'Santé de la femme et parcours PMA 2023-2024',
    description: "En 2023 et 2024 j'ai décidé de me perfectionner dans la prise en charge de la femme en me formant dans la santé de la femme et le suivi du parcours PMA (Procréation Médicalement Assistée). Je suis donc en mesure de vous accompagner tout au long de votre parcours PMA, de la stimulation ovarienne à la grossesse.",
    image: '/assets/osteopma.jpg',
    sort_order: 3
  },
  {
    title: 'Ostéopathie uro-gynécologique 2023',
    description: "Je suis également formée en ostéopathie uro-gynécologique, ce qui me permet de prendre en charge les troubles urinaires et gynécologiques tels que les douleurs pelviennes, les troubles menstruels, et les problèmes liés à la ménopause.",
    image: '/assets/grossesse.jpeg',
    sort_order: 4
  }
];

const seedFormations = db.transaction(() => {
  for (const f of formations) {
    insertFormation.run(f.title, f.description, f.image, f.sort_order);
  }
});
seedFormations();

// --- PEC Bubbles (textePEC.json) ---
const insertPec = db.prepare(
  'INSERT INTO pec_bubbles (id, title, content, image, sort_order) VALUES (?, ?, ?, ?, ?)'
);

const pecBubbles = [
  { id: 1, title: "4 années d'expérience", content: "Ostéopathe agréée D.O depuis 2021", image: '/assets/AlissarLogo.PNG', sort_order: 1 },
  { id: 2, title: "Spécialisations", content: "Ostéopathie de la femme, fertilité et PMA, ostéopathie uro-gynécologique, ostéopathie du sport et posturologie", image: '/assets/Alissar.jpg', sort_order: 2 },
  { id: 3, title: "Prise de rendez-vous facile", content: "Réservez vos consultations en ligne via Doctolib ou par téléphone au 06 50 34 88 73", image: '/assets/Docto.png', sort_order: 3 }
];

const seedPec = db.transaction(() => {
  for (const p of pecBubbles) {
    insertPec.run(p.id, p.title, p.content, p.image, p.sort_order);
  }
});
seedPec();

// --- Tarifs (tarifs.json — fix duplicate id) ---
const insertTarif = db.prepare(
  'INSERT INTO tarifs (prestation, prix, texte, sort_order) VALUES (?, ?, ?, ?)'
);

const tarifs = [
  { prestation: 'Consultation adulte', prix: 60, texte: 'Ceci est le prix des consultations en semaine du lundi au samedi hors jour férié.', sort_order: 1 },
  { prestation: 'Consultation jour férié', prix: 80, texte: 'Ceci est le prix des consultations jour férié (sous réserve d\'ouverture).', sort_order: 2 }
];

const seedTarifs = db.transaction(() => {
  for (const t of tarifs) {
    insertTarif.run(t.prestation, t.prix, t.texte, t.sort_order);
  }
});
seedTarifs();

// --- Horaires (horaires.json) ---
const insertHoraire = db.prepare(
  'INSERT INTO horaires (id, jour, horaires, sort_order) VALUES (?, ?, ?, ?)'
);

const horaires = [
  { id: 1, jour: 'lundi', horaires: '10h-20h', sort_order: 1 },
  { id: 2, jour: 'mardi', horaires: '10h-20h', sort_order: 2 },
  { id: 3, jour: 'mercredi', horaires: '10h-20h', sort_order: 3 },
  { id: 4, jour: 'jeudi', horaires: '10h-20h', sort_order: 4 },
  { id: 5, jour: 'vendredi', horaires: '10h-20h', sort_order: 5 },
  { id: 6, jour: 'samedi', horaires: '10h-14h', sort_order: 6 }
];

const seedHoraires = db.transaction(() => {
  for (const h of horaires) {
    insertHoraire.run(h.id, h.jour, h.horaires, h.sort_order);
  }
});
seedHoraires();

// --- Contact Info ---
db.prepare(
  'INSERT INTO contact_info (id, phone, address, doctolib_url) VALUES (?, ?, ?, ?)'
).run(
  1,
  '06 50 34 88 73',
  'Maison Cadoule, 17 Rue de la Cadoule, 34740 Vendargues',
  'https://www.doctolib.fr/osteopathe/vendargues/alissar-atik'
);

// --- Avis Summary ---
db.prepare(
  'INSERT INTO avis_summary (id, note, nb_avis) VALUES (?, ?, ?)'
).run(1, 5, 155);

console.log('✅ Seed terminé avec succès.');
