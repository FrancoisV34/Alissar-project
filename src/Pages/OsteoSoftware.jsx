import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Group,
  Stack,
  Text,
  Paper,
  Loader,
  Divider,
  Table,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api.js';
import EditPatientModal from '../components/EditPatientModal.jsx';

function PatientModal({ opened, onClose }) {
  const navigate = useNavigate();
  const [view, setView] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const timerRef = useRef(null);

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    date_naissance: '', sexe: '', adresse: '',
    medecin_traitant: '', antecedents_medicaux: '',
  });

  // Debounce search
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timerRef.current);
  }, [searchQuery]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['patient-search', debouncedQuery],
    queryFn: () => apiFetch(`/admin/patients/search?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length >= 2,
  });

  function resetModal() {
    setView('search');
    setSearchQuery('');
    setDebouncedQuery('');
    setCreateError('');
    setForm({ nom: '', prenom: '', email: '', telephone: '', date_naissance: '', sexe: '', adresse: '', medecin_traitant: '', antecedents_medicaux: '' });
  }

  function handleClose() {
    resetModal();
    onClose();
  }

  function selectPatient(patientId) {
    handleClose();
    navigate(`/admin/osteo/consultation/${patientId}`);
  }

  async function handleCreate() {
    if (!form.nom || !form.prenom || !form.email) {
      setCreateError('Nom, prénom et email sont requis');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      const patient = await apiFetch('/admin/patients', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      handleClose();
      navigate(`/admin/osteo/consultation/${patient.id}`);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal centered opened={opened} onClose={handleClose} title={view === 'search' ? 'Sélectionner un patient' : 'Nouveau patient'} size="lg">
      {view === 'search' ? (
        <Stack gap="md">
          <TextInput
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          {isFetching && <Loader size="sm" />}

          {!isFetching && debouncedQuery.length >= 2 && results.length === 0 && (
            <Text c="dimmed" size="sm">Aucun patient trouvé</Text>
          )}

          {results.map((p) => (
            <Paper key={p.id} withBorder p="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>{p.nom} {p.prenom}</Text>
                  <Text size="sm" c="dimmed">{p.email}{p.telephone ? ` — ${p.telephone}` : ''}</Text>
                </div>
                <Button size="xs" variant="light" onClick={() => selectPatient(p.id)}>
                  Sélectionner
                </Button>
              </Group>
            </Paper>
          ))}

          <Divider />
          <Text size="sm" c="dimmed">Patient introuvable ?</Text>
          <Button variant="outline" onClick={() => setView('create')}>
            Créer un nouveau patient
          </Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          <Button variant="subtle" size="xs" onClick={() => setView('search')} style={{ alignSelf: 'flex-start' }}>
            ← Retour recherche
          </Button>

          <Group grow>
            <TextInput label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            <TextInput label="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required />
          </Group>
          <Group grow>
            <TextInput label="Date de naissance" placeholder="JJ/MM/AAAA" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
            <Select
              label="Sexe"
              data={[{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }, { value: 'Autre', label: 'Autre' }]}
              value={form.sexe}
              onChange={(v) => setForm({ ...form, sexe: v })}
              clearable
            />
          </Group>
          <Group grow>
            <TextInput label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            <TextInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Group>
          <TextInput label="Adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          <TextInput label="Médecin traitant" value={form.medecin_traitant} onChange={(e) => setForm({ ...form, medecin_traitant: e.target.value })} />
          <Textarea label="Antécédents médicaux" value={form.antecedents_medicaux} onChange={(e) => setForm({ ...form, antecedents_medicaux: e.target.value })} minRows={3} />

          {createError && <Text c="red" size="sm">{createError}</Text>}

          <Button onClick={handleCreate} loading={creating}>
            Créer et commencer la consultation
          </Button>
        </Stack>
      )}
    </Modal>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function OsteoSoftware() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const navigate = useNavigate();

  const { data: recent = [], isLoading } = useQuery({
    queryKey: ['osteo-recent'],
    queryFn: () => apiFetch('/admin/osteo/recent'),
  });

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Logiciel Ostéo</Title>
        <Button onClick={() => setModalOpen(true)}>+ Nouvelle consultation</Button>
      </Group>

      <Paper withBorder p="md">
        <Title order={4} mb="md">Consultations récentes</Title>
        {isLoading ? (
          <Loader size="sm" />
        ) : recent.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">Aucune consultation récente</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Patient</Table.Th>
                <Table.Th>Motif</Table.Th>
                <Table.Th>Montant</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recent.map((c) => (
                <Table.Tr
                  key={c.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/osteo/consultation/${c.patient_id}`)}
                >
                  <Table.Td>{formatDate(c.date)}</Table.Td>
                  <Table.Td>{c.nom} {c.prenom}</Table.Td>
                  <Table.Td>{c.motif || '—'}</Table.Td>
                  <Table.Td>{c.montant != null ? `${c.montant} €` : '—'}</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="light" onClick={(e) => { e.stopPropagation(); setEditingPatientId(c.patient_id); }}>
                      Modifier
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <PatientModal opened={modalOpen} onClose={() => setModalOpen(false)} />

      <EditPatientModal
        patientId={editingPatientId}
        onClose={() => setEditingPatientId(null)}
        onSuccess={(qc) => qc.invalidateQueries({ queryKey: ['osteo-recent'] })}
      />
    </Container>
  );
}
