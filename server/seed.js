import db from './db.js';

// Clear existing data
db.exec(`
  DELETE FROM formations;
  DELETE FROM pec_bubbles;
  DELETE FROM tarifs;
  DELETE FROM horaires;
  DELETE FROM site_config;
  DELETE FROM external_links;
  DELETE FROM faqs;
`);

// --- Site Config (defaults Alissar) ---
db.prepare(`
  INSERT INTO site_config (
    id, site_name, practitioner_name, profession, phone, email, address,
    geo_lat, geo_lng, maps_embed_url, logo_url, favicon_url, theme_color,
    meta_description, copyright_name, elfsight_widget_id, avis_note, avis_count,
    palette, font_title, hero_variant, dark_mode,
    hero_title, hero_subtitle, hero_image_url,
    about_title, about_text, about_quote, about_image_url,
    show_formations, show_reviews, show_faq,
    meta_title_template, meta_keywords, canonical_base_url, og_image_url,
    physician_specialties, physician_alumni,
    hero_image_alt, about_image_alt, og_image_alt,
    faq_eyebrow, faq_title, faq_lede
  ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'Alissar Atik',
  'Alissar Atik',
  'Ostéopathe D.O.',
  '06 12 34 56 78',
  'contact@alissar-osteo.fr',
  '17 rue de la Cadoule, 34740 Vendargues',
  43.6573,
  3.9706,
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.482067138589!2d3.9722819!3d43.6589431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12b6a7193b8a1ea5%3A0xf18456d31e8c4d65!2sOst%C3%A9opathe%20D.O%20Vendargues%20Alissar%20ATIK!5e0!3m2!1sfr!2sfr!4v1761640976393',
  '/assets/logo.png',
  '/favicon.png',
  '#e87265',
  "Alissar Atik, ostéopathe D.O. à Vendargues. Santé de la femme, fertilité, grossesse et sport.",
  'Alissar Atik',
  null,
  5,
  155,
  'coral-cream',
  'Instrument Serif',
  'fullbleed',
  0,
  "L'ostéopathie, <em>à votre rythme.</em>",
  "Diplômée D.O. de l'École Supérieure d'Ostéopathie de Paris. Cabinet à Vendargues, spécialisée santé de la femme, fertilité, grossesse et sport.",
  '/assets/FaceCab.jpg',
  "Une ostéopathie <em>à l'écoute</em> de votre corps.",
  "Bienvenue dans mon cabinet d'ostéopathie à Vendargues. J'y mets mes compétences et mon expertise à votre service pour vous aider à retrouver un équilibre entre votre corps et votre esprit.\n\nMon approche est centrée sur la patiente — j'écoute vos besoins spécifiques et j'adapte les traitements en conséquence, qu'il s'agisse de douleurs chroniques, de troubles musculo-squelettiques ou simplement d'un meilleur bien-être.",
  "Chaque corps a son histoire. Mon rôle, c'est de l'écouter avant de la corriger.",
  '/assets/Alissar.jpg',
  1, // show_formations
  1, // show_reviews
  1, // show_faq
  '{practitioner_name} — {profession} à {city}',
  'ostéopathe Vendargues, ostéopathie femme, fertilité, grossesse, post-partum, sport',
  'https://alissar-osteo.fr',
  '/assets/FaceCab.jpg',
  JSON.stringify(['Osteopathic', "Women's health", 'Sports medicine', 'Pediatrics']),
  "École Supérieure d'Ostéopathie de Paris",
  'Façade du cabinet Alissar Atik Ostéopathe à Vendargues',
  'Portrait d\'Alissar Atik, ostéopathe D.O.',
  'Aperçu du site Alissar Atik, ostéopathe D.O. à Vendargues',
  'Foire aux questions',
  'Vos questions, mes <em>réponses</em>.',
  'Tout ce que vous devez savoir avant votre première consultation.'
);

// --- External Links ---
db.prepare('INSERT INTO external_links (type, url, label, sort_order) VALUES (?, ?, ?, ?)')
  .run('booking', 'https://www.doctolib.fr/osteopathe/vendargues/alissar-atik', 'Prendre rendez-vous', 1);

// --- Formations ---
const insertFormation = db.prepare('INSERT INTO formations (title, description, image, sort_order) VALUES (?, ?, ?, ?)');
const formations = [
  { title: "D.O. — École Supérieure d'Ostéopathie, Paris (2021)", description: "Diplôme d'ostéopathie après 5 années de formation, incluant 1 600 heures de pratique clinique.", image: '/assets/ESO-soleil.jpg',  sort_order: 1 },
  { title: 'Sport & posturologie (2021)',                          description: 'Préparation et accompagnement des sportifs, analyse posturale et chaînes musculaires.',                          image: '/assets/posturosport.webp', sort_order: 2 },
  { title: 'Ostéopathie uro-gynécologique (2023)',                 description: 'Spécialisation dans le suivi gynécologique : troubles du cycle, douleurs pelviennes, post-partum.',              image: '/assets/osteopma.jpg',      sort_order: 3 },
  { title: 'Femme & PMA (2023-24)',                                description: 'Accompagnement spécifique fertilité et parcours de procréation médicalement assistée.',                          image: '/assets/grossesse.jpeg',    sort_order: 4 },
];
db.transaction(() => { for (const f of formations) insertFormation.run(f.title, f.description, f.image, f.sort_order); })();

// --- Specialties (pec_bubbles) ---
const insertPec = db.prepare('INSERT INTO pec_bubbles (id, num, title, description, icon, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
const pec = [
  { id: 1, num: '01', title: 'Santé de la femme',          description: 'Troubles du cycle, douleurs pelviennes, accompagnement gynécologique global.',          icon: 'Heart',   image: null, sort_order: 1 },
  { id: 2, num: '02', title: 'Fertilité & PMA',            description: 'Préparation à la conception, accompagnement des parcours PMA (FIV, IAC, IIU).',          icon: 'Sparkle', image: null, sort_order: 2 },
  { id: 3, num: '03', title: 'Grossesse & post-partum',    description: "Suivi pendant la grossesse, préparation à l'accouchement, récupération post-natale.",   icon: 'Sun',     image: null, sort_order: 3 },
  { id: 4, num: '04', title: 'Sport & posturologie',       description: 'Préparation, récupération, posturologie pour sportifs amateurs et confirmés.',          icon: 'Star',    image: null, sort_order: 4 },
];
db.transaction(() => { for (const p of pec) insertPec.run(p.id, p.num, p.title, p.description, p.icon, p.image, p.sort_order); })();

// --- Tarifs ---
const insertTarif = db.prepare('INSERT INTO tarifs (prestation, prix, texte, sort_order) VALUES (?, ?, ?, ?)');
const tarifs = [
  { prestation: 'Consultation adulte',     prix: 60, texte: 'Du lundi au samedi, hors jour férié.',  sort_order: 1 },
  { prestation: 'Consultation jour férié', prix: 80, texte: "Sous réserve d'ouverture du cabinet.", sort_order: 2 },
];
db.transaction(() => { for (const t of tarifs) insertTarif.run(t.prestation, t.prix, t.texte, t.sort_order); })();

// --- Horaires ---
const insertHoraire = db.prepare('INSERT INTO horaires (id, jour, horaires, sort_order) VALUES (?, ?, ?, ?)');
const horaires = [
  { id: 1, jour: 'lundi',    horaires: '10h - 20h', sort_order: 1 },
  { id: 2, jour: 'mardi',    horaires: '10h - 20h', sort_order: 2 },
  { id: 3, jour: 'mercredi', horaires: '10h - 20h', sort_order: 3 },
  { id: 4, jour: 'jeudi',    horaires: '10h - 20h', sort_order: 4 },
  { id: 5, jour: 'vendredi', horaires: '10h - 20h', sort_order: 5 },
  { id: 6, jour: 'samedi',   horaires: '10h - 14h', sort_order: 6 },
];
db.transaction(() => { for (const h of horaires) insertHoraire.run(h.id, h.jour, h.horaires, h.sort_order); })();

// --- FAQ par défaut ---
const insertFaq = db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)');
const faqs = [
  {
    q: "Combien coûte une consultation d'ostéopathie ?",
    a: "Une consultation adulte est à 60 € en semaine (du lundi au samedi, hors jour férié). Les consultations en jour férié sont à 80 €, sous réserve d'ouverture du cabinet. Le paiement se fait en espèces, par carte ou par chèque à la fin de la séance.",
  },
  {
    q: "Comment se déroule une première séance ?",
    a: "Une première séance dure environ 1 heure. Elle commence par une anamnèse complète (motif, antécédents, mode de vie). Suivent des tests ostéopathiques pour identifier les zones de tension, puis le traitement adapté à votre situation. Je termine toujours par des conseils personnalisés.",
  },
  {
    q: "L'ostéopathie pendant la grossesse, c'est sans risque ?",
    a: "Oui, l'ostéopathie est parfaitement sûre pendant la grossesse, à tous les trimestres, à condition d'être pratiquée par un ostéopathe formé. J'utilise des techniques douces et adaptées pour soulager les douleurs lombaires, sciatiques, troubles digestifs ou préparer le bassin à l'accouchement.",
  },
  {
    q: "Faut-il une prescription médicale pour consulter ?",
    a: "Non, l'ostéopathie est en accès direct : vous pouvez consulter sans prescription médicale. Cela dit, si vous avez un doute sur un symptôme, n'hésitez pas à en parler d'abord à votre médecin traitant.",
  },
  {
    q: "L'ostéopathie est-elle remboursée ?",
    a: "L'ostéopathie n'est pas remboursée par la Sécurité sociale. En revanche, la plupart des mutuelles santé prennent en charge tout ou partie des consultations (généralement 2 à 6 séances par an, à hauteur de 25 à 60 € par séance). Renseignez-vous auprès de votre mutuelle.",
  },
  {
    q: "Comment prendre rendez-vous ?",
    a: "Le plus simple est de réserver en ligne via Doctolib (lien sur le site). Vous pouvez aussi me joindre par téléphone aux horaires d'ouverture du cabinet.",
  },
];
db.transaction(() => { faqs.forEach((f, i) => insertFaq.run(f.q, f.a, i + 1)); })();

// --- Image alts par défaut pour pec_bubbles ---
const updatePecAlt = db.prepare('UPDATE pec_bubbles SET image_alt = ? WHERE id = ?');
updatePecAlt.run("Icône santé de la femme", 1);
updatePecAlt.run('Icône fertilité et PMA', 2);
updatePecAlt.run('Icône grossesse et post-partum', 3);
updatePecAlt.run('Icône sport et posturologie', 4);

// --- Image alts par défaut pour formations ---
const formationAlts = [
  "Diplôme d'ostéopathie de l'École Supérieure d'Ostéopathie de Paris",
  'Formation sport et posturologie',
  'Formation ostéopathie uro-gynécologique',
  'Formation femme et PMA',
];
const updateFormationAlt = db.prepare('UPDATE formations SET image_alt = ? WHERE sort_order = ?');
formationAlts.forEach((alt, i) => updateFormationAlt.run(alt, i + 1));

console.log('Seed terminé avec succès.');
