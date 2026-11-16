import { z } from 'zod';
import { sanitizeRichText } from './sanitize.js';

/* ---------- Building blocks ---------- */

const text = (max) => z.string().trim().max(max);
const requiredText = (max) => z.string().trim().min(1, 'champ obligatoire').max(max);
const optionalText = (max) => text(max).nullable().optional();
const richText = (max) => text(max).transform(sanitizeRichText);
const flag = z.union([z.literal(0), z.literal(1)]);
const sortOrder = z.number().int().min(0).max(10_000);
const id = z.coerce.number().int().positive();

/** Only absolute http(s) URLs: blocks `javascript:` and `data:` links. */
const httpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => {
    try {
      return ['http:', 'https:'].includes(new URL(v).protocol);
    } catch {
      return false;
    }
  }, 'URL http(s) attendue');

/** Path to an uploaded file or an absolute http(s) URL. */
const imageRef = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || (/^\/[\w./-]+$/.test(v) && !v.includes('..')) || httpUrl.safeParse(v).success, 'chemin ou URL d\'image invalide')
  .nullable()
  .optional();

export const PASSWORD_MIN_LENGTH = 12;
const password = z.string().min(PASSWORD_MIN_LENGTH, `au moins ${PASSWORD_MIN_LENGTH} caractères`).max(128);
const email = z.string().trim().toLowerCase().email().max(254);

/** Roles that can be given through the API. `admin` is never assignable. */
export const ASSIGNABLE_ROLES = ['praticien'];

/* ---------- Schemas ---------- */

export const schemas = {
  idParam: z.object({ id }),

  login: z.object({ email: z.string().max(254), password: z.string().max(128) }),
  changePassword: z.object({ currentPassword: z.string().max(128), newPassword: password }),

  userCreate: z.object({
    email,
    password,
    nom: optionalText(100),
    prenom: optionalText(100),
    telephone: optionalText(30),
    role: z.enum(ASSIGNABLE_ROLES).default('praticien'),
  }),
  userUpdate: z.object({
    nom: optionalText(100),
    prenom: optionalText(100),
    telephone: optionalText(30),
    // 'admin' is accepted here only so that editing an admin's profile works;
    // the route refuses to promote anyone to admin.
    role: z.enum([...ASSIGNABLE_ROLES, 'admin']).optional(),
  }),

  tarif: z.object({
    prestation: requiredText(200),
    prix: z.number().int().min(0).max(10_000),
    texte: optionalText(2000),
  }),
  horaire: z.object({ jour: requiredText(50), horaires: requiredText(200) }),
  formation: z.object({
    title: requiredText(200),
    description: optionalText(5000),
    image: imageRef,
    image_alt: optionalText(300),
  }),
  faq: z.object({
    question: requiredText(500),
    answer: richText(5000).pipe(z.string().min(1, 'champ obligatoire')),
    sort_order: sortOrder.optional(),
  }),
  pec: z.object({
    num: optionalText(10),
    title: requiredText(200),
    description: optionalText(5000),
    icon: optionalText(50),
    image: imageRef,
    image_alt: optionalText(300),
    sort_order: sortOrder.optional(),
  }),
  externalLink: z.object({
    type: requiredText(30),
    url: httpUrl,
    label: optionalText(200),
    sort_order: sortOrder.optional(),
  }),

  siteConfig: z
    .object({
      site_name: text(200), practitioner_name: text(200), profession: text(200),
      phone: text(30), email: text(254), address: text(300),
      geo_lat: z.number().min(-90).max(90).nullable(), geo_lng: z.number().min(-180).max(180).nullable(),
      maps_embed_url: httpUrl.nullable().or(z.literal('')),
      logo_url: imageRef, favicon_url: imageRef,
      theme_color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).nullable(),
      meta_description: text(500).nullable(), copyright_name: text(200).nullable(),
      elfsight_widget_id: text(100).nullable(),
      avis_note: z.number().min(0).max(5).nullable(), avis_count: z.number().int().min(0).max(1_000_000).nullable(),
      palette: text(40), font_title: text(60), hero_variant: z.enum(['fullbleed', 'editorial', 'split']),
      dark_mode: flag,
      hero_title: richText(500).nullable(), hero_subtitle: richText(1000).nullable(),
      hero_image_url: imageRef, hero_image_alt: text(300).nullable(),
      about_title: richText(300).nullable(), about_text: richText(10_000).nullable(), about_quote: richText(1000).nullable(),
      about_image_url: imageRef, about_image_alt: text(300).nullable(),
      show_formations: flag, show_reviews: flag, show_faq: flag,
      meta_title: text(200).nullable(), meta_title_template: text(200).nullable(), meta_keywords: text(500).nullable(),
      canonical_base_url: httpUrl.nullable().or(z.literal('')),
      og_image_url: imageRef, og_image_alt: text(300).nullable(),
      gsc_verification: text(200).nullable(), bing_verification: text(200).nullable(),
      ga_measurement_id: z.string().regex(/^$|^G-[A-Z0-9]{4,20}$/).nullable(),
      google_business_url: httpUrl.nullable().or(z.literal('')),
      physician_specialties: text(1000).nullable(), physician_alumni: text(300).nullable(),
      faq_eyebrow: text(100).nullable(), faq_title: richText(300).nullable(), faq_lede: richText(1000).nullable(),
    })
    .partial(),
};

/**
 * Express middleware: validates `req.body` (or `req.params`) against a Zod
 * schema. On success the parsed, normalised value replaces the original; on
 * failure a 400 response lists the invalid fields without echoing the input.
 *
 * @param {z.ZodType} schema
 * @param {'body' | 'params'} [source='body']
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {}); // eslint-disable-line security/detect-object-injection -- source est 'body' ou 'params'
    if (!result.success) {
      return res.status(400).json({
        error: 'Données invalides',
        details: result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    if (source === 'body') req.body = result.data;
    else req.validParams = result.data;
    next();
  };
}
