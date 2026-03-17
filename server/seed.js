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
  DELETE FROM site_config;
  DELETE FROM external_links;
`);

// --- Site Config ---
db.prepare(`
  INSERT INTO site_config (id, site_name, practitioner_name, profession, phone, email, address, geo_lat, geo_lng, maps_embed_url, logo_url, favicon_url, theme_color, meta_description, copyright_name, elfsight_widget_id, avis_note, avis_count)
  VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'Mon Cabinet',
  'Dr. Dupont',
  'Praticien',
  '01 23 45 67 89',
  'contact@moncabinet.fr',
  '1 Rue Exemple, 75001 Paris',
  48.8566,
  2.3522,
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.3522!3d48.8566',
  '/assets/logo.png',
  '/favicon.png',
  '#fa8072',
  'Cabinet de praticien. Consultations personnalisees. Prise de rendez-vous en ligne.',
  'Mon Cabinet',
  null,
  5,
  0
);

// --- External Links ---
const insertLink = db.prepare(
  'INSERT INTO external_links (type, url, label, sort_order) VALUES (?, ?, ?, ?)'
);
insertLink.run('booking', 'https://www.doctolib.fr', 'Prendre rendez-vous', 1);

// --- Sections ---
const insertSection = db.prepare(
  'INSERT INTO sections (id, title, idlink, image, sort_order) VALUES (?, ?, ?, ?, ?)'
);
const insertParagraph = db.prepare(
  'INSERT INTO section_paragraphs (section_id, sort_order, text) VALUES (?, ?, ?)'
);

const sections = [
  {
    id: 1,
    title: 'Bienvenue dans notre cabinet',
    idlink: null,
    image: '/assets/practitioner.jpg',
    paragraphs: [
      'Bienvenue sur le site de notre cabinet. Nous vous proposons des soins personnalises et adaptes a vos besoins.'
    ]
  },
  {
    id: 2,
    title: 'A propos',
    idlink: 'a-propos',
    image: '/assets/Cab.jpg',
    paragraphs: [
      'Notre praticien vous accueille dans un cadre chaleureux et professionnel. Diplome et experimente, il vous propose des soins adaptes a vos besoins specifiques.',
      'Notre approche est centree sur le patient. Nous prenons le temps d\'ecouter vos preoccupations et de comprendre votre historique medical pour vous offrir un traitement sur mesure.'
    ]
  },
  {
    id: 3,
    title: 'Nos services',
    idlink: 'osteo',
    image: '/assets/Visitcard.jpg',
    paragraphs: [
      'Pour prendre rendez-vous, vous pouvez utiliser notre plateforme de reservation en ligne, ou vous trouverez nos disponibilites en temps reel.',
      'Vous pouvez egalement nous contacter directement par telephone. Nous serons ravis de repondre a vos questions et de vous aider a trouver le creneau qui vous convient le mieux.',
      'Nous sommes impatients de vous aider a ameliorer votre sante et votre bien-etre.'
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

// --- Formations ---
const insertFormation = db.prepare(
  'INSERT INTO formations (title, description, image, sort_order) VALUES (?, ?, ?, ?)'
);

const formations = [
  {
    title: 'Formation professionnelle 2021',
    description: 'Formation initiale complete dans le domaine de la sante. Cette formation reconnue a permis de developper des competences solides.',
    image: '/assets/ESO-soleil.jpg',
    sort_order: 1
  },
  {
    title: 'Specialisation 2022',
    description: 'Formation complementaire permettant de mieux comprendre et traiter des pathologies specifiques.',
    image: '/assets/posturosport.webp',
    sort_order: 2
  }
];

const seedFormations = db.transaction(() => {
  for (const f of formations) {
    insertFormation.run(f.title, f.description, f.image, f.sort_order);
  }
});
seedFormations();

// --- PEC Bubbles ---
const insertPec = db.prepare(
  'INSERT INTO pec_bubbles (id, title, content, image, sort_order) VALUES (?, ?, ?, ?, ?)'
);

const pecBubbles = [
  { id: 1, title: 'Experience professionnelle', content: 'Praticien diplome et experimente', image: '/assets/logo.png', sort_order: 1 },
  { id: 2, title: 'Specialisations', content: 'Prise en charge adaptee a chaque patient', image: '/assets/practitioner.jpg', sort_order: 2 },
  { id: 3, title: 'Prise de rendez-vous facile', content: 'Reservez vos consultations en ligne ou par telephone', image: '/assets/Docto.png', sort_order: 3 }
];

const seedPec = db.transaction(() => {
  for (const p of pecBubbles) {
    insertPec.run(p.id, p.title, p.content, p.image, p.sort_order);
  }
});
seedPec();

// --- Tarifs ---
const insertTarif = db.prepare(
  'INSERT INTO tarifs (prestation, prix, texte, sort_order) VALUES (?, ?, ?, ?)'
);

const tarifs = [
  { prestation: 'Consultation adulte', prix: 60, texte: 'Prix des consultations en semaine du lundi au samedi hors jour ferie.', sort_order: 1 },
  { prestation: 'Consultation jour ferie', prix: 80, texte: 'Prix des consultations jour ferie (sous reserve d\'ouverture).', sort_order: 2 }
];

const seedTarifs = db.transaction(() => {
  for (const t of tarifs) {
    insertTarif.run(t.prestation, t.prix, t.texte, t.sort_order);
  }
});
seedTarifs();

// --- Horaires ---
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

// --- Legacy tables (kept for backward compat, seeded from site_config) ---
const config = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
const bookingLink = db.prepare("SELECT url FROM external_links WHERE type = 'booking' ORDER BY sort_order LIMIT 1").get();

db.prepare(
  'INSERT INTO contact_info (id, phone, address, doctolib_url) VALUES (?, ?, ?, ?)'
).run(1, config.phone, config.address, bookingLink?.url ?? 'https://www.doctolib.fr');

db.prepare(
  'INSERT INTO avis_summary (id, note, nb_avis) VALUES (?, ?, ?)'
).run(1, config.avis_note ?? 5, config.avis_count ?? 0);

console.log('Seed termine avec succes.');
