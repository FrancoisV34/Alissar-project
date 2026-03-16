import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  Group,
  Stack,
  Text,
  Button,
  Textarea,
  TextInput,
  Divider,
  Table,
  Badge,
  Modal,
  Loader,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api.js';
import EditPatientModal from '../components/EditPatientModal.jsx';

const emptyForm = {
  date: new Date(),
  motif: '',
  anamnese: '',
  antecedents: '',
  examen_clinique: '',
  tests_osteo: '',
  traitement: '',
  conseils: '',
  montant: '',
};

export default function OsteoConsultation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingPatientId, setEditingPatientId] = useState(null);

  // Fetch patient info
  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => apiFetch(`/admin/patients/${patientId}`),
  });

  // Fetch consultation history
  const { data: consultations = [], isLoading: loadingConsults } = useQuery({
    queryKey: ['osteo-consults', patientId],
    queryFn: () => apiFetch(`/admin/osteo/patient/${patientId}`),
  });

  // Pré-remplir les antécédents depuis le profil patient (nouvelle consultation uniquement)
  useEffect(() => {
    if (patient?.antecedents_medicaux && editingId === null) {
      setForm((prev) => ({
        ...prev,
        antecedents: patient.antecedents_medicaux,
      }));
    }
  }, [patient]);

  // Create / update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingId) {
        return apiFetch(`/admin/osteo/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }
      return apiFetch('/admin/osteo', {
        method: 'POST',
        body: JSON.stringify({ ...data, patient_id: patientId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['osteo-consults', patientId] });
      setForm({ ...emptyForm });
      setEditingId(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/admin/osteo/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['osteo-consults', patientId] });
      setDeleteTarget(null);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const dateStr = form.date instanceof Date
      ? form.date.toISOString().slice(0, 10)
      : form.date;
    saveMutation.mutate({
      date: dateStr,
      motif: form.motif,
      anamnese: form.anamnese,
      antecedents: form.antecedents,
      examen_clinique: form.examen_clinique,
      tests_osteo: form.tests_osteo,
      traitement: form.traitement,
      conseils: form.conseils,
      montant: form.montant ? parseFloat(form.montant) : null,
    });
  }

  function startEdit(consult) {
    setEditingId(consult.id);
    setForm({
      date: consult.date ? new Date(consult.date + 'T00:00:00') : new Date(),
      motif: consult.motif ?? '',
      anamnese: consult.anamnese ?? '',
      antecedents: consult.antecedents ?? '',
      examen_clinique: consult.examen_clinique ?? '',
      tests_osteo: consult.tests_osteo ?? '',
      traitement: consult.traitement ?? '',
      conseils: consult.conseils ?? '',
      montant: consult.montant != null ? String(consult.montant) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (loadingPatient) {
    return (
      <Container size="lg" py="xl">
        <Loader />
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container size="lg" py="xl">
        <Text c="red">Patient introuvable</Text>
        <Button variant="subtle" mt="md" onClick={() => navigate('/admin/osteo')}>
          Retour
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Button variant="subtle" mb="md" onClick={() => navigate('/admin/osteo')}>
        ← Retour
      </Button>

      {/* Fiche patient */}
      <Paper withBorder p="md" mb="xl">
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={3}>{patient.nom} {patient.prenom}</Title>
            <Group gap="xs" mt={4}>
              {patient.sexe && <Badge variant="light">{patient.sexe}</Badge>}
              {patient.date_naissance && <Text size="sm" c="dimmed">{patient.date_naissance}</Text>}
              {patient.telephone && <Text size="sm" c="dimmed">{patient.telephone}</Text>}
            </Group>
          </div>
          <div style={{ textAlign: 'right' }}>
            {patient.medecin_traitant && (
              <Text size="sm">Médecin : {patient.medecin_traitant}</Text>
            )}
            {patient.antecedents_medicaux && (
              <Text size="sm" c="dimmed">Antécédents : {patient.antecedents_medicaux}</Text>
            )}
            <Button size="xs" variant="light" mt="xs" onClick={() => setEditingPatientId(patientId)}>
              Modifier
            </Button>
          </div>
        </Group>
      </Paper>

      {/* Formulaire consultation */}
      <Paper withBorder p="md" mb="xl">
        <Title order={4} mb="md">
          {editingId ? 'Modifier la consultation' : 'Nouvelle consultation'}
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <Group grow>
              <DatePickerInput
                label="Date"
                value={form.date}
                onChange={(v) => setField('date', v)}
                valueFormat="DD/MM/YYYY"
                clearable={false}
              />
              <TextInput
                label="Montant (€)"
                type="number"
                step="0.01"
                value={form.montant}
                onChange={(e) => setField('montant', e.target.value)}
              />
            </Group>

            <Textarea
              label="Motif de consultation"
              value={form.motif}
              onChange={(e) => setField('motif', e.target.value)}
              minRows={2}
              autosize
            />
            <Textarea
              label="Anamnèse"
              value={form.anamnese}
              onChange={(e) => setField('anamnese', e.target.value)}
              minRows={2}
              autosize
            />
            <Textarea
              label="Antécédents"
              value={form.antecedents}
              onChange={(e) => setField('antecedents', e.target.value)}
              minRows={2}
              autosize
            />
            <Textarea
              label="Examen clinique"
              value={form.examen_clinique}
              onChange={(e) => setField('examen_clinique', e.target.value)}
              minRows={2}
              autosize
            />
            <Textarea
              label="Tests ostéopathiques"
              value={form.tests_osteo}
              onChange={(e) => setField('tests_osteo', e.target.value)}
              minRows={2}
              autosize
            />
            <Textarea
              label="Traitement"
              value={form.traitement}
              onChange={(e) => setField('traitement', e.target.value)}
              minRows={2}
              autosize
            />
            <Textarea
              label="Conseils"
              value={form.conseils}
              onChange={(e) => setField('conseils', e.target.value)}
              minRows={2}
              autosize
            />

            <Group>
              <Button type="submit" loading={saveMutation.isPending}>
                {editingId ? 'Sauvegarder les modifications' : 'Enregistrer la consultation'}
              </Button>
              {editingId && (
                <Button variant="subtle" onClick={cancelEdit}>Annuler</Button>
              )}
            </Group>
            {saveMutation.isError && (
              <Text c="red" size="sm">{saveMutation.error.message}</Text>
            )}
          </Stack>
        </form>
      </Paper>

      {/* Historique */}
      <Paper withBorder p="md">
        <Title order={4} mb="md">Historique des consultations</Title>
        {loadingConsults ? (
          <Loader size="sm" />
        ) : consultations.length === 0 ? (
          <Text c="dimmed" size="sm">Aucune consultation enregistrée</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Motif</Table.Th>
                <Table.Th>Montant</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {consultations.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td>{formatDate(c.date)}</Table.Td>
                  <Table.Td>{c.motif || '—'}</Table.Td>
                  <Table.Td>{c.montant != null ? `${c.montant} €` : '—'}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="light" onClick={() => startEdit(c)}>
                        Modifier
                      </Button>
                      <Button size="xs" variant="light" color="red" onClick={() => setDeleteTarget(c)}>
                        Supprimer
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <EditPatientModal
        patientId={editingPatientId}
        onClose={() => setEditingPatientId(null)}
        onSuccess={(qc) => qc.invalidateQueries({ queryKey: ['patient', patientId] })}
      />

      {/* Modale suppression */}
      <Modal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmer la suppression"
        centered
      >
        <Text size="sm" mb="md">
          Supprimer la consultation du {deleteTarget && formatDate(deleteTarget.date)} ?
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button
            color="red"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(deleteTarget.id)}
          >
            Supprimer
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
