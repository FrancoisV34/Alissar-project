import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore.js';
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
  SegmentedControl,
  ColorSwatch,
  Popover,
  ColorPicker,
  FileInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import 'dayjs/locale/fr';
import { apiFetch } from '../utils/api.js';

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

// ── Stats (CA) ──────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { label: 'Année', value: 'year' },
  { label: 'Mois', value: 'month' },
  { label: 'Semaine', value: 'week' },
  { label: 'Jour', value: 'day' },
];

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function StatsTab() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const now = new Date();
  const [period, setPeriod] = useState('month');
  const [navYear, setNavYear] = useState(now.getFullYear());
  const [navMonth, setNavMonth] = useState(now.getMonth() + 1);
  const [barColor, setBarColor] = useState(() => localStorage.getItem('mb-chart-color') || '#228be6');

  function handleColorChange(color) {
    setBarColor(color);
    localStorage.setItem('mb-chart-color', color);
  }

  // Build query params
  const queryParams = new URLSearchParams({ period });
  if (period !== 'year') queryParams.set('year', navYear);
  if (period === 'day') queryParams.set('month', navMonth);

  const { data: chartData = [] } = useQuery({
    queryKey: ['stats-revenue', period, navYear, navMonth],
    queryFn: () => apiFetch(`/admin/stats/revenue?${queryParams}`),
  });

  // Navigation label
  let navLabel = '';
  if (period === 'month' || period === 'week') navLabel = String(navYear);
  if (period === 'day') navLabel = `${MONTH_NAMES[navMonth - 1]} ${navYear}`;

  function navPrev() {
    if (period === 'day') {
      if (navMonth === 1) { setNavMonth(12); setNavYear(y => y - 1); }
      else setNavMonth(m => m - 1);
    } else {
      setNavYear(y => y - 1);
    }
  }

  function navNext() {
    if (period === 'day') {
      if (navMonth === 12) { setNavMonth(1); setNavYear(y => y + 1); }
      else setNavMonth(m => m + 1);
    } else {
      setNavYear(y => y + 1);
    }
  }

  // Consultation CRUD
  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => apiFetch('/admin/consultations'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date: null, patient_nom: '', prestation: '', montant: '', notes: '' });

  function openCreate() {
    setEditing(null);
    setForm({ date: null, patient_nom: '', prestation: '', montant: '', notes: '' });
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      date: c.date ? new Date(c.date) : null,
      patient_nom: c.patient_nom ?? '',
      prestation: c.prestation,
      montant: String(c.montant),
      notes: c.notes ?? '',
    });
    setModalOpen(true);
  }

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ['consultations'] });
    qc.invalidateQueries({ queryKey: ['stats-revenue'] });
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const dateStr = form.date instanceof Date
        ? form.date.toISOString().slice(0, 10)
        : form.date;
      const body = {
        date: dateStr,
        patient_nom: form.patient_nom || null,
        prestation: form.prestation,
        montant: Number(form.montant),
        notes: form.notes || null,
      };
      if (editing) {
        return apiFetch(`/admin/consultations/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      return apiFetch('/admin/consultations', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => { invalidateAll(); setModalOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/consultations/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateAll(),
  });

  const euroFormatter = (value) => `${Number(value).toLocaleString('fr-FR')} €`;

  return (
    <>
      {/* Period selector + color picker */}
      <Group justify="space-between" mb="md">
        <SegmentedControl
          data={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
        />
        <Popover position="bottom-end" shadow="md">
          <Popover.Target>
            <ActionIcon variant="subtle" size="lg" title="Couleur du graphique">
              <ColorSwatch color={barColor} size={20} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <ColorPicker
              value={barColor}
              onChange={handleColorChange}
              swatches={['#228be6','#fa5252','#40c057','#fab005','#7950f2','#fd7e14','#20c997','#e64980','#be4bdb','#15aabf']}
            />
          </Popover.Dropdown>
        </Popover>
      </Group>

      {/* Navigation */}
      {period !== 'year' && (
        <Group justify="center" mb="md">
          <Button variant="subtle" size="sm" onClick={navPrev}>&#8592;</Button>
          <Text fw={600}>{navLabel}</Text>
          <Button variant="subtle" size="sm" onClick={navNext}>&#8594;</Button>
        </Group>
      )}

      {/* Chart */}
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={euroFormatter} />
            <Tooltip formatter={(value) => euroFormatter(value)} labelFormatter={(l) => `Période : ${l}`} />
            <Bar dataKey="total" fill={barColor} radius={[4, 4, 0, 0]} name="CA" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Consultations list */}
      <Group justify="space-between" mt="xl" mb="md">
        <Title order={4}>Consultations</Title>
        <Button size="sm" onClick={openCreate}>+ Ajouter une consultation</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Patient</Table.Th>
            <Table.Th>Prestation</Table.Th>
            <Table.Th>Montant</Table.Th>
            <Table.Th>Notes</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {consultations.map((c) => (
            <Table.Tr key={`${c.source}-${c.id}`}>
              <Table.Td>{new Date(c.date).toLocaleDateString('fr-FR')}</Table.Td>
              <Table.Td>{c.patient_nom ?? '—'}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {c.source === 'osteo' && <Badge size="xs" variant="light" color="teal">Ostéo</Badge>}
                  {c.prestation}
                </Group>
              </Table.Td>
              <Table.Td>{Number(c.montant).toLocaleString('fr-FR')} €</Table.Td>
              <Table.Td>{c.notes ?? '—'}</Table.Td>
              <Table.Td>
                {c.source === 'admin' ? (
                  <Group gap="xs">
                    <Button size="xs" variant="light" onClick={() => openEdit(c)}>Modifier</Button>
                    <Button size="xs" color="red" variant="light" onClick={() => deleteMutation.mutate(c.id)}>Supprimer</Button>
                  </Group>
                ) : (
                  <Button size="xs" variant="subtle" color="teal" onClick={() => navigate(`/admin/osteo/consultation/${c.patient_id}`)}>
                    Voir dans Ostéo →
                  </Button>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Modal CRUD */}
      <Modal centered opened={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la consultation' : 'Nouvelle consultation'}>
        <Stack gap="sm">
          <DatePickerInput
            label="Date"
            value={form.date}
            onChange={(d) => setForm({ ...form, date: d })}
            locale="fr"
            valueFormat="DD/MM/YYYY"
            required
          />
          <TextInput label="Prestation" value={form.prestation} onChange={(e) => setForm({ ...form, prestation: e.target.value })} required />
          <TextInput label="Montant (€)" type="number" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} required />
          <TextInput label="Patient (optionnel)" value={form.patient_nom} onChange={(e) => setForm({ ...form, patient_nom: e.target.value })} />
          <Textarea label="Notes (optionnel)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────

function toIdlink(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function apiFetchMultipart(path, method, formData) {
  const token = localStorage.getItem('mb-token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`/api${path}`, { method, headers, body: formData });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);
  return data;
}

function SectionsTab() {
  const qc = useQueryClient();
  const { data: sections = [] } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: () => apiFetch('/admin/sections'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', sort_order: '', imageFile: null, localParagraphs: [] });
  const [newParagraph, setNewParagraph] = useState('');
  const [editingParagraph, setEditingParagraph] = useState(null); // { id, text }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', sort_order: '', imageFile: null, localParagraphs: [] });
    setNewParagraph('');
    setEditingParagraph(null);
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditing(s);
    setForm({ title: s.title, sort_order: String(s.sort_order), imageFile: null, localParagraphs: [] });
    setNewParagraph('');
    setEditingParagraph(null);
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('sort_order', form.sort_order);
      if (form.imageFile) fd.append('image', form.imageFile);
      if (editing) {
        return apiFetchMultipart(`/admin/sections/${editing.id}`, 'PUT', fd);
      }
      const section = await apiFetchMultipart('/admin/sections', 'POST', fd);
      for (const text of form.localParagraphs) {
        await apiFetch(`/admin/sections/${section.id}/paragraphs`, { method: 'POST', body: JSON.stringify({ text }) });
      }
      return section;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-sections'] }); setModalOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/sections/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sections'] }),
  });

  const addParagraphMutation = useMutation({
    mutationFn: ({ sectionId, text }) =>
      apiFetch(`/admin/sections/${sectionId}/paragraphs`, { method: 'POST', body: JSON.stringify({ text }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sections'] });
      setNewParagraph('');
    },
  });

  const updateParagraphMutation = useMutation({
    mutationFn: ({ sectionId, pid, text }) =>
      apiFetch(`/admin/sections/${sectionId}/paragraphs/${pid}`, { method: 'PUT', body: JSON.stringify({ text }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sections'] });
      setEditingParagraph(null);
    },
  });

  const deleteParagraphMutation = useMutation({
    mutationFn: ({ sectionId, pid }) =>
      apiFetch(`/admin/sections/${sectionId}/paragraphs/${pid}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sections'] }),
  });

  // Use the editing section's paragraphs from fresh query data
  const editingSection = editing ? sections.find((s) => s.id === editing.id) : null;

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={openCreate}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ordre</Table.Th>
            <Table.Th>Titre</Table.Th>
            <Table.Th>idlink</Table.Th>
            <Table.Th>Image</Table.Th>
            <Table.Th>Paragraphes</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sections.map((s) => (
            <Table.Tr key={s.id}>
              <Table.Td>{s.sort_order}</Table.Td>
              <Table.Td>{s.title}</Table.Td>
              <Table.Td><Text size="xs" c="dimmed">{s.idlink}</Text></Table.Td>
              <Table.Td>
                {s.image
                  ? <img src={`/uploads/${s.image}`} alt="" style={{ maxHeight: 40, borderRadius: 4 }} />
                  : '—'}
              </Table.Td>
              <Table.Td>{s.paragraphs?.length ?? 0}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => openEdit(s)}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => deleteMutation.mutate(s.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        centered
        size="lg"
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier la section' : 'Nouvelle section'}
      >
        <Stack gap="sm">
          <TextInput
            label="Titre"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          {form.title && (
            <Text size="xs" c="dimmed">idlink : {toIdlink(form.title)}</Text>
          )}
          <TextInput
            label="Ordre d'affichage"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
          {editing?.image && !form.imageFile && (
            <img src={`/uploads/${editing.image}`} alt="" style={{ maxHeight: 80, borderRadius: 8 }} />
          )}
          <FileInput
            label="Image"
            accept="image/*"
            placeholder="Choisir une image"
            value={form.imageFile}
            onChange={(file) => setForm({ ...form, imageFile: file })}
          />

          <>
            <Title order={5} mt="sm">Paragraphes</Title>

            {/* Mode édition : paragraphes persistés, CRUD direct API */}
            {editing && (editingSection?.paragraphs ?? []).map((p) => (
              <Stack key={p.id} gap={4}>
                {editingParagraph?.id === p.id ? (
                  <Group align="flex-end" gap="xs">
                    <Textarea
                      style={{ flex: 1 }}
                      value={editingParagraph.text}
                      onChange={(e) => setEditingParagraph({ ...editingParagraph, text: e.target.value })}
                      autosize
                      minRows={2}
                    />
                    <Stack gap={4}>
                      <Button
                        size="xs"
                        loading={updateParagraphMutation.isPending}
                        onClick={() => updateParagraphMutation.mutate({ sectionId: editing.id, pid: p.id, text: editingParagraph.text })}
                      >
                        OK
                      </Button>
                      <Button size="xs" variant="subtle" onClick={() => setEditingParagraph(null)}>Annuler</Button>
                    </Stack>
                  </Group>
                ) : (
                  <Group gap="xs" align="flex-start">
                    <Text size="sm" style={{ flex: 1 }}>{p.text}</Text>
                    <Button size="xs" variant="light" onClick={() => setEditingParagraph({ id: p.id, text: p.text })}>Modifier</Button>
                    <Button
                      size="xs"
                      color="red"
                      variant="light"
                      loading={deleteParagraphMutation.isPending}
                      onClick={() => deleteParagraphMutation.mutate({ sectionId: editing.id, pid: p.id })}
                    >
                      Supprimer
                    </Button>
                  </Group>
                )}
              </Stack>
            ))}

            {/* Mode création : paragraphes locaux, envoyés au submit */}
            {!editing && form.localParagraphs.map((text, i) => (
              <Group key={i} gap="xs" align="flex-start">
                <Text size="sm" style={{ flex: 1 }}>{text}</Text>
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  onClick={() => setForm({ ...form, localParagraphs: form.localParagraphs.filter((_, j) => j !== i) })}
                >
                  Supprimer
                </Button>
              </Group>
            ))}

            <Group align="flex-end" gap="xs" mt="xs">
              <Textarea
                style={{ flex: 1 }}
                placeholder="Nouveau paragraphe..."
                value={newParagraph}
                onChange={(e) => setNewParagraph(e.target.value)}
                autosize
                minRows={2}
              />
              <Button
                size="sm"
                disabled={!newParagraph.trim()}
                loading={editing ? addParagraphMutation.isPending : false}
                onClick={() => {
                  if (editing) {
                    addParagraphMutation.mutate({ sectionId: editing.id, text: newParagraph.trim() });
                  } else {
                    setForm({ ...form, localParagraphs: [...form.localParagraphs, newParagraph.trim()] });
                    setNewParagraph('');
                  }
                }}
              >
                Ajouter
              </Button>
            </Group>
          </>

          <Button mt="sm" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
            Enregistrer
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Site Config ──────────────────────────────────────────────────────────────

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
  { key: 'logo_url', label: 'URL du logo' },
  { key: 'favicon_url', label: 'URL du favicon' },
  { key: 'theme_color', label: 'Couleur du thème' },
  { key: 'meta_description', label: 'Meta description' },
  { key: 'copyright_name', label: 'Nom pour le copyright' },
  { key: 'elfsight_widget_id', label: 'Elfsight Widget ID' },
  { key: 'avis_note', label: 'Note avis', type: 'number' },
  { key: 'avis_count', label: 'Nombre d\'avis', type: 'number' },
];

function SiteConfigTab() {
  const qc = useQueryClient();
  const { data: config } = useQuery({
    queryKey: ['site-config'],
    queryFn: () => apiFetch('/site-config'),
  });

  const [form, setForm] = useState({});
  const [initialized, setInitialized] = useState(false);

  if (config && !initialized) {
    const initial = {};
    for (const f of SITE_CONFIG_FIELDS) {
      initial[f.key] = config[f.key] ?? '';
    }
    setForm(initial);
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = {};
      for (const f of SITE_CONFIG_FIELDS) {
        const val = form[f.key];
        if (f.type === 'number') {
          body[f.key] = val === '' ? null : Number(val);
        } else {
          body[f.key] = val || null;
        }
      }
      return apiFetch('/admin/site-config', { method: 'PUT', body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-config'] });
      qc.invalidateQueries({ queryKey: ['contact'] });
    },
  });

  if (!initialized) return <Text>Chargement...</Text>;

  return (
    <Stack gap="sm" maw={600}>
      {SITE_CONFIG_FIELDS.map((f) => (
        <TextInput
          key={f.key}
          label={f.label}
          type={f.type === 'number' ? 'number' : 'text'}
          value={form[f.key] ?? ''}
          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
        />
      ))}
      <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
        Enregistrer
      </Button>
      {saveMutation.isSuccess && <Text c="green" size="sm">Configuration sauvegardée</Text>}
    </Stack>
  );
}

// ── External Links ──────────────────────────────────────────────────────────

function ExternalLinksTab() {
  const qc = useQueryClient();
  const { data: links = [] } = useQuery({
    queryKey: ['external-links'],
    queryFn: () => apiFetch('/admin/external-links'),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: '', url: '', label: '', sort_order: '' });

  function openCreate() {
    setEditing(null);
    setForm({ type: '', url: '', label: '', sort_order: '' });
    setModalOpen(true);
  }

  function openEdit(link) {
    setEditing(link);
    setForm({ type: link.type, url: link.url, label: link.label ?? '', sort_order: String(link.sort_order) });
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = {
        type: form.type,
        url: form.url,
        label: form.label || null,
        sort_order: form.sort_order ? Number(form.sort_order) : undefined,
      };
      if (editing) {
        return apiFetch(`/admin/external-links/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      return apiFetch('/admin/external-links', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['external-links'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/external-links/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['external-links'] }),
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={openCreate}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Type</Table.Th>
            <Table.Th>URL</Table.Th>
            <Table.Th>Label</Table.Th>
            <Table.Th>Ordre</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {links.map((l) => (
            <Table.Tr key={l.id}>
              <Table.Td><Badge variant="light">{l.type}</Badge></Table.Td>
              <Table.Td><Text size="sm" truncate="end" maw={300}>{l.url}</Text></Table.Td>
              <Table.Td>{l.label ?? '—'}</Table.Td>
              <Table.Td>{l.sort_order}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => openEdit(l)}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => deleteMutation.mutate(l.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal centered opened={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le lien' : 'Nouveau lien'}>
        <Stack gap="sm">
          <Select
            label="Type"
            data={[
              { value: 'booking', label: 'Réservation' },
              { value: 'social', label: 'Réseau social' },
              { value: 'website', label: 'Site web' },
              { value: 'other', label: 'Autre' },
            ]}
            value={form.type}
            onChange={(v) => setForm({ ...form, type: v })}
            searchable
            creatable
            getCreateLabel={(q) => `+ Créer "${q}"`}
            onCreate={(q) => { setForm({ ...form, type: q }); return q; }}
            required
          />
          <TextInput label="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
          <TextInput label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <TextInput label="Ordre" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useStore();

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Dashboard Admin</Title>
      <Tabs defaultValue="tarifs">
        <Tabs.List mb="lg">
          <Tabs.Tab value="tarifs">Tarifs</Tabs.Tab>
          <Tabs.Tab value="horaires">Horaires</Tabs.Tab>
          <Tabs.Tab value="formations">Formations</Tabs.Tab>
          <Tabs.Tab value="sections">Sections</Tabs.Tab>
          <Tabs.Tab value="utilisateurs">Utilisateurs</Tabs.Tab>
          {['admin', 'praticien'].includes(user?.role) && (
            <Tabs.Tab value="stats">Stats</Tabs.Tab>
          )}
          <Tabs.Tab value="site-config">Configuration</Tabs.Tab>
          <Tabs.Tab value="external-links">Liens externes</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tarifs"><TarifsTab /></Tabs.Panel>
        <Tabs.Panel value="horaires"><HorairesTab /></Tabs.Panel>
        <Tabs.Panel value="formations"><FormationsTab /></Tabs.Panel>
        <Tabs.Panel value="sections"><SectionsTab /></Tabs.Panel>
        <Tabs.Panel value="utilisateurs"><UtilisateursTab /></Tabs.Panel>
        <Tabs.Panel value="stats"><StatsTab /></Tabs.Panel>
        <Tabs.Panel value="site-config"><SiteConfigTab /></Tabs.Panel>
        <Tabs.Panel value="external-links"><ExternalLinksTab /></Tabs.Panel>
      </Tabs>
    </Container>
  );
}
