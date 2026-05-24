import { useEffect, useState } from 'react';
import {
  Stack, Title, Select, SegmentedControl, Switch, Textarea, TextInput,
  Button, Group, Text, ColorSwatch, Box,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api.js';
import ImageField from './ImageField.jsx';

const PALETTES = [
  { value: 'coral-cream',     label: 'Coral / Cream (Alissar)', swatch: '#e87265' },
  { value: 'coral-sage',      label: 'Coral / Sage',            swatch: '#e87265' },
  { value: 'terracotta-sand', label: 'Terracotta / Sand',       swatch: '#c66a4e' },
  { value: 'plum-blush',      label: 'Plum / Blush',            swatch: '#c75c7d' },
  { value: 'forest-cream',    label: 'Forest / Cream',          swatch: '#4d7a5b' },
];

const FONTS = [
  { value: 'Instrument Serif',   label: 'Instrument Serif (défaut)' },
  { value: 'Fraunces',           label: 'Fraunces' },
  { value: 'DM Serif Display',   label: 'DM Serif Display' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
];

const HERO_VARIANTS = [
  { value: 'fullbleed', label: 'Plein cadre' },
  { value: 'editorial', label: 'Éditorial' },
  { value: 'split',     label: 'Split' },
];

export default function PersonnalisationTab() {
  const qc = useQueryClient();
  const { data: cfg } = useQuery({ queryKey: ['site-config'], queryFn: () => apiFetch('/site-config') });

  const [form, setForm] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!cfg || form) return;
    setForm({
      palette:        cfg.palette        ?? 'coral-cream',
      font_title:     cfg.font_title     ?? 'Instrument Serif',
      hero_variant:   cfg.hero_variant   ?? 'fullbleed',
      dark_mode:      !!cfg.dark_mode,
      hero_title:     cfg.hero_title     ?? '',
      hero_subtitle:  cfg.hero_subtitle  ?? '',
      hero_image_url: cfg.hero_image_url ?? '',
      hero_image_alt: cfg.hero_image_alt ?? '',
      about_title:    cfg.about_title    ?? '',
      about_text:     cfg.about_text     ?? '',
      about_quote:    cfg.about_quote    ?? '',
      about_image_url: cfg.about_image_url ?? '',
      about_image_alt: cfg.about_image_alt ?? '',
      show_formations: cfg.show_formations !== 0,
      show_reviews:    cfg.show_reviews !== 0,
      show_faq:        cfg.show_faq !== 0,
      faq_eyebrow:     cfg.faq_eyebrow ?? '',
      faq_title:       cfg.faq_title ?? '',
      faq_lede:        cfg.faq_lede ?? '',
      elfsight_widget_id: cfg.elfsight_widget_id ?? '',
      avis_note:  cfg.avis_note ?? 5,
      avis_count: cfg.avis_count ?? 0,
    });
  }, [cfg, form]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        dark_mode: form.dark_mode ? 1 : 0,
        show_formations: form.show_formations ? 1 : 0,
        show_reviews: form.show_reviews ? 1 : 0,
        show_faq: form.show_faq ? 1 : 0,
      };
      return apiFetch('/admin/site-config', { method: 'PUT', body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-config'] });
      setStatus({ kind: 'success', msg: 'Personnalisation enregistrée' });
      setTimeout(() => setStatus(null), 3000);
    },
    onError: (e) => setStatus({ kind: 'error', msg: e.message }),
  });

  if (!form) return <Text>Chargement...</Text>;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Stack gap="lg" maw={720}>
      <Title order={3}>Apparence</Title>

      <Select
        label="Palette de couleurs"
        data={PALETTES.map((p) => ({ value: p.value, label: p.label }))}
        value={form.palette}
        onChange={(v) => update('palette', v)}
        leftSection={<ColorSwatch color={PALETTES.find((p) => p.value === form.palette)?.swatch ?? '#888'} size={16} />}
      />

      <Select
        label="Police des titres"
        data={FONTS}
        value={form.font_title}
        onChange={(v) => update('font_title', v)}
      />

      <Box>
        <Text size="sm" fw={500} mb={6}>Variante du Hero</Text>
        <SegmentedControl
          fullWidth
          data={HERO_VARIANTS}
          value={form.hero_variant}
          onChange={(v) => update('hero_variant', v)}
        />
      </Box>

      <Switch
        label="Mode sombre"
        checked={form.dark_mode}
        onChange={(e) => update('dark_mode', e.currentTarget.checked)}
      />

      <Title order={3} mt="md">Hero</Title>

      <TextInput
        label="Titre du Hero (HTML autorisé — utilisez <em>...</em> pour l'italique accent)"
        value={form.hero_title}
        onChange={(e) => update('hero_title', e.currentTarget.value)}
      />
      <Textarea
        label="Sous-titre du Hero"
        value={form.hero_subtitle}
        onChange={(e) => update('hero_subtitle', e.currentTarget.value)}
        autosize minRows={2}
      />
      <ImageField
        label="Image Hero"
        value={form.hero_image_url}
        onChange={(v) => update('hero_image_url', v)}
      />
      <TextInput
        label="Texte alternatif de l'image Hero (SEO + accessibilité)"
        value={form.hero_image_alt}
        onChange={(e) => update('hero_image_alt', e.currentTarget.value)}
      />

      <Title order={3} mt="md">À propos</Title>

      <TextInput
        label="Titre de la section À propos (HTML autorisé)"
        value={form.about_title}
        onChange={(e) => update('about_title', e.currentTarget.value)}
      />
      <Textarea
        label="Texte (séparer les paragraphes avec une ligne vide)"
        value={form.about_text}
        onChange={(e) => update('about_text', e.currentTarget.value)}
        autosize minRows={4}
      />
      <TextInput
        label="Citation"
        value={form.about_quote}
        onChange={(e) => update('about_quote', e.currentTarget.value)}
      />
      <ImageField
        label="Portrait À propos"
        value={form.about_image_url}
        onChange={(v) => update('about_image_url', v)}
      />
      <TextInput
        label="Texte alternatif du portrait À propos (SEO + accessibilité)"
        value={form.about_image_alt}
        onChange={(e) => update('about_image_alt', e.currentTarget.value)}
      />

      <Title order={3} mt="md">Avis Google</Title>

      <TextInput
        label="Elfsight Widget ID"
        placeholder="ex: 73273fa4-..."
        value={form.elfsight_widget_id}
        onChange={(e) => update('elfsight_widget_id', e.currentTarget.value)}
      />
      <Group grow>
        <TextInput
          label="Note moyenne"
          type="number" step="0.1"
          value={form.avis_note}
          onChange={(e) => update('avis_note', Number(e.currentTarget.value))}
        />
        <TextInput
          label="Nombre d'avis"
          type="number"
          value={form.avis_count}
          onChange={(e) => update('avis_count', Number(e.currentTarget.value))}
        />
      </Group>

      <Title order={3} mt="md">Sections affichées</Title>

      <Switch
        label="Afficher la section Formations"
        checked={form.show_formations}
        onChange={(e) => update('show_formations', e.currentTarget.checked)}
      />
      <Switch
        label="Afficher la section Avis Google"
        checked={form.show_reviews}
        onChange={(e) => update('show_reviews', e.currentTarget.checked)}
      />
      <Switch
        label="Afficher la section FAQ"
        checked={form.show_faq}
        onChange={(e) => update('show_faq', e.currentTarget.checked)}
      />

      <Title order={3} mt="md">Section FAQ — titres</Title>
      <TextInput
        label="Eyebrow (petit label au-dessus du titre)"
        value={form.faq_eyebrow}
        onChange={(e) => update('faq_eyebrow', e.currentTarget.value)}
      />
      <TextInput
        label="Titre de la section FAQ (HTML autorisé)"
        value={form.faq_title}
        onChange={(e) => update('faq_title', e.currentTarget.value)}
      />
      <Textarea
        label="Sous-titre"
        autosize minRows={2}
        value={form.faq_lede}
        onChange={(e) => update('faq_lede', e.currentTarget.value)}
      />

      <Group mt="lg">
        <Button onClick={() => save.mutate()} loading={save.isPending}>Enregistrer</Button>
        {status?.kind === 'success' && <Text c="green" size="sm">{status.msg}</Text>}
        {status?.kind === 'error'   && <Text c="red"   size="sm">{status.msg}</Text>}
      </Group>
    </Stack>
  );
}
