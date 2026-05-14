import { useEffect, useMemo, useState } from 'react';
import {
  Stack, Title, TextInput, Textarea, Button, Group, Text,
  TagsInput, Box, Paper, Divider, List, Anchor, Card,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api.js';
import ImageField from './ImageField.jsx';

function applyTemplate(template, vars) {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export default function SeoTab() {
  const qc = useQueryClient();
  const { data: cfg } = useQuery({ queryKey: ['site-config'], queryFn: () => apiFetch('/site-config') });
  const { data: faqs = [] } = useQuery({ queryKey: ['faqs'], queryFn: () => apiFetch('/faqs') });

  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!cfg || form) return;
    let specs = [];
    try { specs = JSON.parse(cfg.physician_specialties ?? '[]'); } catch { /* empty */ }
    setForm({
      meta_title:            cfg.meta_title ?? '',
      meta_title_template:   cfg.meta_title_template ?? '',
      meta_description:      cfg.meta_description ?? '',
      meta_keywords:         cfg.meta_keywords ?? '',
      canonical_base_url:    cfg.canonical_base_url ?? '',
      og_image_url:          cfg.og_image_url ?? '',
      og_image_alt:          cfg.og_image_alt ?? '',
      physician_specialties: Array.isArray(specs) ? specs : [],
      physician_alumni:      cfg.physician_alumni ?? '',
      gsc_verification:      cfg.gsc_verification ?? '',
      bing_verification:     cfg.bing_verification ?? '',
      ga_measurement_id:     cfg.ga_measurement_id ?? '',
      google_business_url:   cfg.google_business_url ?? '',
    });
  }, [cfg, form]);

  const titlePreview = useMemo(() => {
    if (!form || !cfg) return '';
    const city = (cfg.address ?? '').split(',').pop()?.replace(/\d/g, '').trim() ?? '';
    const vars = {
      site_name: cfg.site_name ?? '',
      practitioner_name: cfg.practitioner_name ?? '',
      profession: cfg.profession ?? '',
      city,
    };
    return form.meta_title?.trim() || applyTemplate(form.meta_title_template, vars) || cfg.site_name;
  }, [form, cfg]);

  const titleLen  = titlePreview.length;
  const descLen   = (form?.meta_description ?? '').length;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        physician_specialties: JSON.stringify(form.physician_specialties ?? []),
      };
      return apiFetch('/admin/site-config', { method: 'PUT', body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-config'] });
      setStatus({ kind: 'success', msg: 'SEO enregistré' });
      setTimeout(() => setStatus(null), 3000);
    },
    onError: (e) => setStatus({ kind: 'error', msg: e.message }),
  });

  if (!form) return <Text>Chargement...</Text>;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canonicalSample = (form.canonical_base_url || 'https://votre-domaine.fr').replace(/\/$/, '');

  return (
    <Stack gap="xl" maw={780}>
      {/* SECTION 1 — Référencement Google */}
      <Stack gap="sm">
        <Title order={3}>Référencement Google</Title>
        <Text c="dimmed" size="sm">Ces champs définissent comment votre site apparaît dans les résultats Google.</Text>

        <TextInput
          label="Titre direct (override)"
          description="Si renseigné, prioritaire sur le template. 50–60 caractères idéal."
          placeholder="Laisser vide pour utiliser le template"
          value={form.meta_title}
          onChange={(e) => update('meta_title', e.currentTarget.value)}
        />
        <TextInput
          label="Template de titre"
          description="Tokens disponibles : {site_name} {practitioner_name} {profession} {city}"
          value={form.meta_title_template}
          onChange={(e) => update('meta_title_template', e.currentTarget.value)}
        />
        <Textarea
          label="Meta description"
          description={`${descLen} caractères — viser 140–160 incluant profession + ville.`}
          autosize minRows={2}
          value={form.meta_description}
          onChange={(e) => update('meta_description', e.currentTarget.value)}
        />
        <TextInput
          label="Mots-clés"
          description="Séparés par des virgules. Peu d'impact direct sur Google mais utile pour Bing."
          value={form.meta_keywords}
          onChange={(e) => update('meta_keywords', e.currentTarget.value)}
        />
        <TextInput
          label="URL canonique du site"
          description="Sans slash final, ex: https://alissar-osteo.fr. Indispensable pour Open Graph + sitemap."
          value={form.canonical_base_url}
          onChange={(e) => update('canonical_base_url', e.currentTarget.value)}
        />
      </Stack>

      <Divider />

      {/* SECTION 2 — Aperçu Google */}
      <Stack gap="sm">
        <Title order={3}>Aperçu Google (SERP)</Title>
        <Paper withBorder p="md" radius="md" style={{ background: '#fff', fontFamily: 'Arial, sans-serif' }}>
          <Text size="xs" c="dimmed">{canonicalSample.replace(/^https?:\/\//, '')}</Text>
          <Text style={{ color: '#1a0dab', fontSize: 20, lineHeight: 1.3 }} mt={2}>{titlePreview} ({titleLen}c)</Text>
          <Text size="sm" mt={4} style={{ color: '#4d5156', lineHeight: 1.4 }}>
            {form.meta_description?.slice(0, 165)}{form.meta_description?.length > 165 ? '…' : ''}
          </Text>
        </Paper>
      </Stack>

      <Divider />

      {/* SECTION 3 — Réseaux sociaux (Open Graph) */}
      <Stack gap="sm">
        <Title order={3}>Réseaux sociaux (Open Graph)</Title>
        <Text c="dimmed" size="sm">Image qui apparaît quand le site est partagé sur Facebook, LinkedIn, WhatsApp, etc. Format recommandé : 1200×630 px.</Text>
        <ImageField
          label="Image Open Graph"
          value={form.og_image_url}
          onChange={(v) => update('og_image_url', v)}
          previewHeight={120}
        />
        <TextInput
          label="Texte alternatif de l'image OG"
          value={form.og_image_alt}
          onChange={(e) => update('og_image_alt', e.currentTarget.value)}
        />
      </Stack>

      <Divider />

      {/* SECTION 4 — Données structurées (Schema Physician) */}
      <Stack gap="sm">
        <Title order={3}>Données structurées (Schema.org Physician)</Title>
        <Text c="dimmed" size="sm">Ces champs alimentent le JSON-LD lu par Google pour faire apparaître votre cabinet dans le pack local et les AI Overviews.</Text>
        <TagsInput
          label="Spécialités médicales"
          description="Recommandé en anglais (Google les comprend) : Osteopathic, Women's health, Sports medicine, Pediatrics, Pregnancy…"
          value={form.physician_specialties}
          onChange={(v) => update('physician_specialties', v)}
          data={['Osteopathic', "Women's health", 'Sports medicine', 'Pediatrics', 'Pregnancy', 'Geriatric', 'Pain management']}
          clearable
        />
        <TextInput
          label="Diplôme / établissement de formation"
          description="ex: École Supérieure d'Ostéopathie de Paris"
          value={form.physician_alumni}
          onChange={(e) => update('physician_alumni', e.currentTarget.value)}
        />
      </Stack>

      <Divider />

      {/* SECTION 5 — Vérifications + Analytics */}
      <Stack gap="sm">
        <Title order={3}>Vérifications &amp; Analytics</Title>
        <TextInput
          label="Code de vérification Google Search Console"
          description={<>Obtenu sur <Anchor href="https://search.google.com/search-console" target="_blank">Search Console</Anchor> → balise HTML.</>}
          value={form.gsc_verification}
          onChange={(e) => update('gsc_verification', e.currentTarget.value)}
        />
        <TextInput
          label="Code de vérification Bing Webmaster"
          value={form.bing_verification}
          onChange={(e) => update('bing_verification', e.currentTarget.value)}
        />
        <TextInput
          label="Google Analytics 4 Measurement ID"
          description="Format G-XXXXXXXXXX. Un bandeau cookies sera affiché aux visiteurs."
          placeholder="G-XXXXXXXXXX"
          value={form.ga_measurement_id}
          onChange={(e) => update('ga_measurement_id', e.currentTarget.value)}
        />
        <TextInput
          label="URL de votre fiche Google Business"
          description="Lien Google Maps de votre cabinet. Utilisé pour relier votre fiche à votre site."
          placeholder="https://maps.google.com/?cid=..."
          value={form.google_business_url}
          onChange={(e) => update('google_business_url', e.currentTarget.value)}
        />
      </Stack>

      <Divider />

      {/* SECTION 6 — Outils de validation */}
      <Stack gap="sm">
        <Title order={3}>Outils de validation</Title>
        <List spacing="xs" size="sm">
          <List.Item><Anchor href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(canonicalSample)}`} target="_blank">Tester avec Google Rich Results Test →</Anchor></List.Item>
          <List.Item><Anchor href={`https://validator.schema.org/#url=${encodeURIComponent(canonicalSample)}`} target="_blank">Schema Markup Validator →</Anchor></List.Item>
          <List.Item><Anchor href="https://search.google.com/search-console" target="_blank">Google Search Console →</Anchor></List.Item>
          <List.Item><Anchor href="https://pagespeed.web.dev/" target="_blank">Google PageSpeed Insights →</Anchor></List.Item>
        </List>
      </Stack>

      <Divider />

      {/* SECTION 7 — Checklist */}
      <Card withBorder radius="md" p="md">
        <Title order={4} mb="sm">Checklist SEO</Title>
        <List spacing={6} size="sm">
          <List.Item c={cfg?.meta_description ? 'green' : 'orange'}>
            {cfg?.meta_description ? '✓' : '○'} Meta description renseignée (140–160 caractères)
          </List.Item>
          <List.Item c={cfg?.canonical_base_url ? 'green' : 'orange'}>
            {cfg?.canonical_base_url ? '✓' : '○'} URL canonique configurée
          </List.Item>
          <List.Item c={cfg?.og_image_url ? 'green' : 'orange'}>
            {cfg?.og_image_url ? '✓' : '○'} Image Open Graph uploadée
          </List.Item>
          <List.Item c={cfg?.google_business_url ? 'green' : 'orange'}>
            {cfg?.google_business_url ? '✓' : '○'} Fiche Google Business liée
          </List.Item>
          <List.Item c={cfg?.gsc_verification ? 'green' : 'orange'}>
            {cfg?.gsc_verification ? '✓' : '○'} Vérification Google Search Console
          </List.Item>
          <List.Item c={cfg?.ga_measurement_id ? 'green' : 'orange'}>
            {cfg?.ga_measurement_id ? '✓' : '○'} Google Analytics 4 configuré
          </List.Item>
          <List.Item c={faqs.length >= 3 ? 'green' : 'orange'}>
            {faqs.length >= 3 ? '✓' : '○'} Au moins 3 FAQ ({faqs.length} actuellement)
          </List.Item>
        </List>
      </Card>

      <Box pos="sticky" bottom={0} bg="var(--mantine-color-body)" py="sm" style={{ zIndex: 5 }}>
        <Group>
          <Button size="md" onClick={() => save.mutate()} loading={save.isPending}>Enregistrer le SEO</Button>
          {status?.kind === 'success' && <Text c="green" size="sm">{status.msg}</Text>}
          {status?.kind === 'error'   && <Text c="red"   size="sm">{status.msg}</Text>}
        </Group>
      </Box>
    </Stack>
  );
}
