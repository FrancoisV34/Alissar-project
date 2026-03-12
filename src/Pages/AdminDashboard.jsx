import { useState } from 'react';
import {
  Container,
  Title,
  Tabs,
  Table,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  PasswordInput,
  Group,
  Stack,
  ActionIcon,
  Text,
  Select,
  Badge,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE_URL = '/api';

function authHeaders() {
  const token = localStorage.getItem('alissar-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
  return data;
}

// ── Tarifs ──────────────────────────────────────────────────────────────────

function TarifsTab() {
  const qc = useQueryClient();
  const { data: tarifs = [] } = useQuery({
    queryKey: ['tarifs'],
    queryFn: () => apiFetch('/tarifs'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ prestation: '', prix: '', texte: '' });

  function openCreate() {
    setEditing(null);
    setForm({ prestation: '', prix: '', texte: '' });
    setModalOpen(true);
  }

  function openEdit(tarif) {
    setEditing(tarif);
    setForm({ prestation: tarif.prestation, prix: String(tarif.prix), texte: tarif.texte ?? '' });
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = { prestation: form.prestation, prix: Number(form.prix), texte: form.texte || null };
      if (editing) {
        return apiFetch(`/admin/tarifs/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      return apiFetch('/admin/tarifs', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tarifs'] }); setModalOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/tarifs/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tarifs'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={openCreate}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Prestation</Table.Th>
            <Table.Th>Prix (€)</Table.Th>
            <Table.Th>Texte</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tarifs.map((t) => (
            <Table.Tr key={t.id}>
              <Table.Td>{t.prestation}</Table.Td>
              <Table.Td>{t.prix}</Table.Td>
              <Table.Td>{t.texte ?? '—'}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => openEdit(t)}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => deleteMutation.mutate(t.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal centered opened={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le tarif' : 'Nouveau tarif'}>
        <Stack gap="sm">
          <TextInput label="Prestation" value={form.prestation} onChange={(e) => setForm({ ...form, prestation: e.target.value })} required />
          <TextInput label="Prix (€)" type="number" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} required />
          <Textarea label="Texte (optionnel)" value={form.texte} onChange={(e) => setForm({ ...form, texte: e.target.value })} />
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Horaires ─────────────────────────────────────────────────────────────────

function HorairesTab() {
  const qc = useQueryClient();
  const { data: horaires = [] } = useQuery({
    queryKey: ['horaires'],
    queryFn: () => apiFetch('/horaires'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ jour: '', horaires: '' });

  function openCreate() {
    setEditing(null);
    setForm({ jour: '', horaires: '' });
    setModalOpen(true);
  }

  function openEdit(h) {
    setEditing(h);
    setForm({ jour: h.jour, horaires: h.horaires });
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editing) {
        return apiFetch(`/admin/horaires/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
      }
      return apiFetch('/admin/horaires', { method: 'POST', body: JSON.stringify(form) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['horaires'] }); setModalOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/horaires/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['horaires'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={openCreate}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Jour</Table.Th>
            <Table.Th>Horaires</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {horaires.map((h) => (
            <Table.Tr key={h.id}>
              <Table.Td>{h.jour}</Table.Td>
              <Table.Td>{h.horaires}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => openEdit(h)}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => deleteMutation.mutate(h.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal centered opened={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier l\'horaire' : 'Nouvel horaire'}>
        <Stack gap="sm">
          <TextInput label="Jour" value={form.jour} onChange={(e) => setForm({ ...form, jour: e.target.value })} required />
          <TextInput label="Horaires" placeholder="9h - 18h" value={form.horaires} onChange={(e) => setForm({ ...form, horaires: e.target.value })} required />
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Formations ───────────────────────────────────────────────────────────────

function FormationsTab() {
  const qc = useQueryClient();
  const { data: formations = [] } = useQuery({
    queryKey: ['formations'],
    queryFn: () => apiFetch('/formations'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', image: '' });

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '', image: '' });
    setModalOpen(true);
  }

  function openEdit(f) {
    setEditing(f);
    setForm({ title: f.title, description: f.description ?? '', image: f.image ?? '' });
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = { title: form.title, description: form.description || null, image: form.image || null };
      if (editing) {
        return apiFetch(`/admin/formations/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      return apiFetch('/admin/formations', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['formations'] }); setModalOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/formations/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formations'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={openCreate}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Titre</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {formations.map((f) => (
            <Table.Tr key={f.id}>
              <Table.Td>{f.title}</Table.Td>
              <Table.Td>{f.description ?? '—'}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => openEdit(f)}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => deleteMutation.mutate(f.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal centered opened={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la formation' : 'Nouvelle formation'}>
        <Stack gap="sm">
          <TextInput label="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextInput label="Image (nom du fichier)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Utilisateurs ─────────────────────────────────────────────────────────────

function UtilisateursTab() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiFetch('/admin/users'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', role: 'patient' });

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ nom: '', prenom: '', email: '', password: '', telephone: '', role: 'patient' });

  function openEdit(u) {
    setEditing(u);
    setForm({ nom: u.nom ?? '', prenom: u.prenom ?? '', telephone: u.telephone ?? '', role: u.role });
    setModalOpen(true);
  }

  const updateMutation = useMutation({
    mutationFn: () => apiFetch(`/admin/users/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setModalOpen(false); },
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(createForm) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setCreateOpen(false);
      setCreateForm({ nom: '', prenom: '', email: '', password: '', telephone: '', role: 'patient' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={() => setCreateOpen(true)}>+ Créer un utilisateur</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nom</Table.Th>
            <Table.Th>Prénom</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Téléphone</Table.Th>
            <Table.Th>Rôle</Table.Th>
            <Table.Th>Inscrit le</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.nom ?? '—'}</Table.Td>
              <Table.Td>{u.prenom ?? '—'}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>{u.telephone ?? '—'}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Badge color={u.role === 'admin' ? 'red' : 'blue'} variant="light">{u.role}</Badge>
                  {u.must_change_password ? <Badge color="orange" variant="light">MDP temp.</Badge> : null}
                </Group>
              </Table.Td>
              <Table.Td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => openEdit(u)}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" disabled={u.role === 'admin'} onClick={() => deleteMutation.mutate(u.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal centered opened={createOpen} onClose={() => setCreateOpen(false)} title="Créer un utilisateur">
        <Stack gap="sm">
          <TextInput label="Nom" value={createForm.nom} onChange={(e) => setCreateForm({ ...createForm, nom: e.target.value })} />
          <TextInput label="Prénom" value={createForm.prenom} onChange={(e) => setCreateForm({ ...createForm, prenom: e.target.value })} />
          <TextInput label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
          <PasswordInput label="Mot de passe temporaire" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
          <TextInput label="Téléphone" value={createForm.telephone} onChange={(e) => setCreateForm({ ...createForm, telephone: e.target.value })} />
          <Select
            label="Rôle"
            data={[{ value: 'patient', label: 'Patient' }, { value: 'admin', label: 'Admin' }]}
            value={createForm.role}
            onChange={(v) => setCreateForm({ ...createForm, role: v })}
          />
          <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Créer</Button>
        </Stack>
      </Modal>

      <Modal centered opened={modalOpen} onClose={() => setModalOpen(false)} title="Modifier l'utilisateur">
        <Stack gap="sm">
          <TextInput label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          <TextInput label="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
          <TextInput label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <Select
            label="Rôle"
            data={[{ value: 'patient', label: 'Patient' }, { value: 'admin', label: 'Admin' }]}
            value={form.role}
            onChange={(v) => setForm({ ...form, role: v })}
            disabled={editing?.role === 'admin'}
          />
          <Button onClick={() => updateMutation.mutate()} loading={updateMutation.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Dashboard Admin</Title>
      <Tabs defaultValue="tarifs">
        <Tabs.List mb="lg">
          <Tabs.Tab value="tarifs">Tarifs</Tabs.Tab>
          <Tabs.Tab value="horaires">Horaires</Tabs.Tab>
          <Tabs.Tab value="formations">Formations</Tabs.Tab>
          <Tabs.Tab value="utilisateurs">Utilisateurs</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tarifs"><TarifsTab /></Tabs.Panel>
        <Tabs.Panel value="horaires"><HorairesTab /></Tabs.Panel>
        <Tabs.Panel value="formations"><FormationsTab /></Tabs.Panel>
        <Tabs.Panel value="utilisateurs"><UtilisateursTab /></Tabs.Panel>
      </Tabs>
    </Container>
  );
}
