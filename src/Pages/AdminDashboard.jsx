import { useState } from 'react';
import {
  Container, Title, Tabs, Table, Button, Modal, TextInput, Textarea,
  PasswordInput, Group, Stack, Text, Select, Badge,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api.js';
import PersonnalisationTab from '../Components/admin/PersonnalisationTab.jsx';
import SpecialtiesTab from '../Components/admin/SpecialtiesTab.jsx';
import SeoTab from '../Components/admin/SeoTab.jsx';
import FaqTab from '../Components/admin/FaqTab.jsx';
import ImageField from '../Components/admin/ImageField.jsx';

// ── Tarifs ──────────────────────────────────────────────────────────────────
function TarifsTab() {
  const qc = useQueryClient();
  const { data: tarifs = [] } = useQuery({ queryKey: ['tarifs'], queryFn: () => apiFetch('/tarifs') });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ prestation: '', prix: '', texte: '' });

  const save = useMutation({
    mutationFn: () => {
      const body = { prestation: form.prestation, prix: Number(form.prix), texte: form.texte || null };
      return editing
        ? apiFetch(`/admin/tarifs/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : apiFetch('/admin/tarifs', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tarifs'] }); setOpen(false); },
  });
  const del = useMutation({
    mutationFn: (id) => apiFetch(`/admin/tarifs/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tarifs'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={() => { setEditing(null); setForm({ prestation: '', prix: '', texte: '' }); setOpen(true); }}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Prestation</Table.Th><Table.Th>Prix</Table.Th><Table.Th>Texte</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {tarifs.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td>{t.prestation}</Table.Td>
              <Table.Td>{t.prix} €</Table.Td>
              <Table.Td>{t.texte ?? '—'}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => { setEditing(t); setForm({ prestation: t.prestation, prix: String(t.prix), texte: t.texte ?? '' }); setOpen(true); }}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => del.mutate(t.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Modal centered opened={open} onClose={() => setOpen(false)} title={editing ? 'Modifier le tarif' : 'Nouveau tarif'}>
        <Stack gap="sm">
          <TextInput label="Prestation" required value={form.prestation} onChange={(e) => setForm({ ...form, prestation: e.currentTarget.value })} />
          <TextInput label="Prix (€)" type="number" required value={form.prix} onChange={(e) => setForm({ ...form, prix: e.currentTarget.value })} />
          <Textarea label="Texte" value={form.texte} onChange={(e) => setForm({ ...form, texte: e.currentTarget.value })} />
          <Button onClick={() => save.mutate()} loading={save.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Horaires ─────────────────────────────────────────────────────────────────
function HorairesTab() {
  const qc = useQueryClient();
  const { data: horaires = [] } = useQuery({ queryKey: ['horaires'], queryFn: () => apiFetch('/horaires') });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ jour: '', horaires: '' });

  const save = useMutation({
    mutationFn: () => editing
      ? apiFetch(`/admin/horaires/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
      : apiFetch('/admin/horaires', { method: 'POST', body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['horaires'] }); setOpen(false); },
  });
  const del = useMutation({
    mutationFn: (id) => apiFetch(`/admin/horaires/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['horaires'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={() => { setEditing(null); setForm({ jour: '', horaires: '' }); setOpen(true); }}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Jour</Table.Th><Table.Th>Horaires</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {horaires.map((h) => (
            <Table.Tr key={h.id}>
              <Table.Td>{h.jour}</Table.Td>
              <Table.Td>{h.horaires}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => { setEditing(h); setForm({ jour: h.jour, horaires: h.horaires }); setOpen(true); }}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => del.mutate(h.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Modal centered opened={open} onClose={() => setOpen(false)} title={editing ? "Modifier l'horaire" : 'Nouvel horaire'}>
        <Stack gap="sm">
          <TextInput label="Jour" required value={form.jour} onChange={(e) => setForm({ ...form, jour: e.currentTarget.value })} />
          <TextInput label="Horaires" placeholder="10h - 20h" required value={form.horaires} onChange={(e) => setForm({ ...form, horaires: e.currentTarget.value })} />
          <Button onClick={() => save.mutate()} loading={save.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Formations ───────────────────────────────────────────────────────────────
function FormationsTab() {
  const qc = useQueryClient();
  const { data: formations = [] } = useQuery({ queryKey: ['formations'], queryFn: () => apiFetch('/formations') });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', image: '', image_alt: '' });

  const save = useMutation({
    mutationFn: () => {
      const body = {
        title: form.title,
        description: form.description || null,
        image: form.image || null,
        image_alt: form.image_alt || null,
      };
      return editing
        ? apiFetch(`/admin/formations/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : apiFetch('/admin/formations', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['formations'] }); setOpen(false); },
  });
  const del = useMutation({
    mutationFn: (id) => apiFetch(`/admin/formations/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formations'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={() => { setEditing(null); setForm({ title: '', description: '', image: '', image_alt: '' }); setOpen(true); }}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Titre</Table.Th><Table.Th>Description</Table.Th><Table.Th>Image</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {formations.map((f) => (
            <Table.Tr key={f.id}>
              <Table.Td>{f.title}</Table.Td>
              <Table.Td><Text size="sm" lineClamp={2}>{f.description ?? '—'}</Text></Table.Td>
              <Table.Td>{f.image ?? '—'}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => { setEditing(f); setForm({ title: f.title, description: f.description ?? '', image: f.image ?? '', image_alt: f.image_alt ?? '' }); setOpen(true); }}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => del.mutate(f.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Modal centered opened={open} onClose={() => setOpen(false)} title={editing ? 'Modifier la formation' : 'Nouvelle formation'}>
        <Stack gap="sm">
          <TextInput label="Titre" required value={form.title} onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
          <Textarea label="Description" autosize minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
          <ImageField label="Image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
          <TextInput label="Texte alternatif image (SEO + accessibilité)" value={form.image_alt} onChange={(e) => setForm({ ...form, image_alt: e.currentTarget.value })} />
          <Button onClick={() => save.mutate()} loading={save.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Utilisateurs ─────────────────────────────────────────────────────────────
function UtilisateursTab() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => apiFetch('/admin/users') });
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', role: 'praticien' });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ nom: '', prenom: '', email: '', password: '', telephone: '', role: 'praticien' });

  const update = useMutation({
    mutationFn: () => apiFetch(`/admin/users/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setEditOpen(false); },
  });
  const create = useMutation({
    mutationFn: () => apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(createForm) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setCreateOpen(false); setCreateForm({ nom: '', prenom: '', email: '', password: '', telephone: '', role: 'praticien' }); },
  });
  const del = useMutation({
    mutationFn: (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const roles = [{ value: 'praticien', label: 'Praticien' }, { value: 'admin', label: 'Admin' }];

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Créer un utilisateur</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Nom</Table.Th><Table.Th>Prénom</Table.Th><Table.Th>Email</Table.Th><Table.Th>Rôle</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.nom ?? '—'}</Table.Td>
              <Table.Td>{u.prenom ?? '—'}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Badge color={u.role === 'admin' ? 'red' : 'blue'} variant="light">{u.role}</Badge>
                  {u.must_change_password ? <Badge color="orange" variant="light">MDP temp.</Badge> : null}
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => { setEditing(u); setForm({ nom: u.nom ?? '', prenom: u.prenom ?? '', telephone: u.telephone ?? '', role: u.role }); setEditOpen(true); }}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" disabled={u.role === 'admin'} onClick={() => del.mutate(u.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal centered opened={createOpen} onClose={() => setCreateOpen(false)} title="Créer un utilisateur">
        <Stack gap="sm">
          <TextInput label="Nom" value={createForm.nom} onChange={(e) => setCreateForm({ ...createForm, nom: e.currentTarget.value })} />
          <TextInput label="Prénom" value={createForm.prenom} onChange={(e) => setCreateForm({ ...createForm, prenom: e.currentTarget.value })} />
          <TextInput label="Email" type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.currentTarget.value })} />
          <PasswordInput label="Mot de passe temporaire" required value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.currentTarget.value })} />
          <TextInput label="Téléphone" value={createForm.telephone} onChange={(e) => setCreateForm({ ...createForm, telephone: e.currentTarget.value })} />
          <Select label="Rôle" data={roles} value={createForm.role} onChange={(v) => setCreateForm({ ...createForm, role: v })} />
          <Button onClick={() => create.mutate()} loading={create.isPending}>Créer</Button>
        </Stack>
      </Modal>

      <Modal centered opened={editOpen} onClose={() => setEditOpen(false)} title="Modifier l'utilisateur">
        <Stack gap="sm">
          <TextInput label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.currentTarget.value })} />
          <TextInput label="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.currentTarget.value })} />
          <TextInput label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.currentTarget.value })} />
          <Select label="Rôle" data={roles} value={form.role} onChange={(v) => setForm({ ...form, role: v })} disabled={editing?.role === 'admin'} />
          <Button onClick={() => update.mutate()} loading={update.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Site Config (champs métadonnées non couverts par Personnalisation) ──────
const SITE_CONFIG_FIELDS = [
  { key: 'site_name', label: 'Nom du site' },
  { key: 'practitioner_name', label: 'Nom du praticien' },
  { key: 'profession', label: 'Profession' },
  { key: 'phone', label: 'Téléphone' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Adresse' },
  { key: 'geo_lat', label: 'Latitude', type: 'number' },
  { key: 'geo_lng', label: 'Longitude', type: 'number' },
  { key: 'maps_embed_url', label: 'URL iframe Google Maps' },
  { key: 'logo_url', label: 'Logo', type: 'image' },
  { key: 'favicon_url', label: 'Favicon', type: 'image' },
  { key: 'theme_color', label: 'Couleur du thème (meta)' },
  { key: 'meta_description', label: 'Meta description' },
  { key: 'copyright_name', label: 'Nom pour le copyright' },
];

function SiteConfigTab() {
  const qc = useQueryClient();
  const { data: config } = useQuery({ queryKey: ['site-config'], queryFn: () => apiFetch('/site-config') });
  const [form, setForm] = useState({});
  const [initialized, setInitialized] = useState(false);

  if (config && !initialized) {
    const initial = {};
    for (const f of SITE_CONFIG_FIELDS) initial[f.key] = config[f.key] ?? '';
    setForm(initial);
    setInitialized(true);
  }

  const save = useMutation({
    mutationFn: () => {
      const body = {};
      for (const f of SITE_CONFIG_FIELDS) {
        const val = form[f.key];
        body[f.key] = f.type === 'number' ? (val === '' ? null : Number(val)) : (val || null);
      }
      return apiFetch('/admin/site-config', { method: 'PUT', body: JSON.stringify(body) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-config'] }),
  });

  if (!initialized) return <Text>Chargement...</Text>;

  return (
    <Stack gap="sm" maw={600}>
      {SITE_CONFIG_FIELDS.map((f) => {
        if (f.type === 'image') {
          return (
            <ImageField
              key={f.key}
              label={f.label}
              value={form[f.key] ?? ''}
              onChange={(v) => setForm({ ...form, [f.key]: v })}
            />
          );
        }
        return (
          <TextInput
            key={f.key}
            label={f.label}
            type={f.type === 'number' ? 'number' : 'text'}
            value={form[f.key] ?? ''}
            onChange={(e) => setForm({ ...form, [f.key]: e.currentTarget.value })}
          />
        );
      })}
      <Button onClick={() => save.mutate()} loading={save.isPending}>Enregistrer</Button>
      {save.isSuccess && <Text c="green" size="sm">Configuration sauvegardée</Text>}
    </Stack>
  );
}

// ── External Links ──────────────────────────────────────────────────────────
function ExternalLinksTab() {
  const qc = useQueryClient();
  const { data: links = [] } = useQuery({ queryKey: ['external-links'], queryFn: () => apiFetch('/admin/external-links') });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: '', url: '', label: '', sort_order: '' });

  const save = useMutation({
    mutationFn: () => {
      const body = {
        type: form.type,
        url: form.url,
        label: form.label || null,
        sort_order: form.sort_order ? Number(form.sort_order) : undefined,
      };
      return editing
        ? apiFetch(`/admin/external-links/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : apiFetch('/admin/external-links', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['external-links'] }); setOpen(false); },
  });
  const del = useMutation({
    mutationFn: (id) => apiFetch(`/admin/external-links/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['external-links'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={() => { setEditing(null); setForm({ type: '', url: '', label: '', sort_order: '' }); setOpen(true); }}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead><Table.Tr><Table.Th>Type</Table.Th><Table.Th>URL</Table.Th><Table.Th>Label</Table.Th><Table.Th>Ordre</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {links.map((l) => (
            <Table.Tr key={l.id}>
              <Table.Td><Badge variant="light">{l.type}</Badge></Table.Td>
              <Table.Td><Text size="sm" truncate="end" maw={320}>{l.url}</Text></Table.Td>
              <Table.Td>{l.label ?? '—'}</Table.Td>
              <Table.Td>{l.sort_order}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => { setEditing(l); setForm({ type: l.type, url: l.url, label: l.label ?? '', sort_order: String(l.sort_order) }); setOpen(true); }}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => del.mutate(l.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Modal centered opened={open} onClose={() => setOpen(false)} title={editing ? 'Modifier le lien' : 'Nouveau lien'}>
        <Stack gap="sm">
          <Select
            label="Type"
            data={[
              { value: 'booking', label: 'Réservation' },
              { value: 'social',  label: 'Réseau social' },
              { value: 'website', label: 'Site web' },
              { value: 'other',   label: 'Autre' },
            ]}
            value={form.type}
            onChange={(v) => setForm({ ...form, type: v })}
            required
          />
          <TextInput label="URL" required value={form.url} onChange={(e) => setForm({ ...form, url: e.currentTarget.value })} />
          <TextInput label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.currentTarget.value })} />
          <TextInput label="Ordre" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.currentTarget.value })} />
          <Button onClick={() => save.mutate()} loading={save.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Dashboard principal ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Dashboard Admin</Title>
        <a href="/" style={{ textDecoration: 'none' }}><Button variant="subtle" size="sm">← Retour au site</Button></a>
      </Group>
      <Tabs defaultValue="personnalisation">
        <Tabs.List mb="lg">
          <Tabs.Tab value="personnalisation">Personnalisation</Tabs.Tab>
          <Tabs.Tab value="specialties">Spécialités</Tabs.Tab>
          <Tabs.Tab value="tarifs">Tarifs</Tabs.Tab>
          <Tabs.Tab value="horaires">Horaires</Tabs.Tab>
          <Tabs.Tab value="formations">Formations</Tabs.Tab>
          <Tabs.Tab value="faq">FAQ</Tabs.Tab>
          <Tabs.Tab value="seo">SEO</Tabs.Tab>
          <Tabs.Tab value="site-config">Configuration générale</Tabs.Tab>
          <Tabs.Tab value="external-links">Liens externes</Tabs.Tab>
          <Tabs.Tab value="utilisateurs">Utilisateurs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="personnalisation"><PersonnalisationTab /></Tabs.Panel>
        <Tabs.Panel value="specialties"><SpecialtiesTab /></Tabs.Panel>
        <Tabs.Panel value="tarifs"><TarifsTab /></Tabs.Panel>
        <Tabs.Panel value="horaires"><HorairesTab /></Tabs.Panel>
        <Tabs.Panel value="formations"><FormationsTab /></Tabs.Panel>
        <Tabs.Panel value="faq"><FaqTab /></Tabs.Panel>
        <Tabs.Panel value="seo"><SeoTab /></Tabs.Panel>
        <Tabs.Panel value="site-config"><SiteConfigTab /></Tabs.Panel>
        <Tabs.Panel value="external-links"><ExternalLinksTab /></Tabs.Panel>
        <Tabs.Panel value="utilisateurs"><UtilisateursTab /></Tabs.Panel>
      </Tabs>
    </Container>
  );
}
