import { useState, useEffect } from 'react';
import { Modal, Stack, Group, TextInput, Select, Textarea, Button, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api.js';

const emptyForm = {
  nom: '', prenom: '', email: '', telephone: '',
  date_naissance: '', sexe: '', adresse: '',
  medecin_traitant: '', antecedents_medicaux: '',
};

export default function EditPatientModal({ patientId, onClose, onSuccess }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    apiFetch(`/admin/patients/${patientId}`)
      .then((p) => setForm({
        nom: p.nom ?? '',
        prenom: p.prenom ?? '',
        email: p.email ?? '',
        telephone: p.telephone ?? '',
        date_naissance: p.date_naissance ?? '',
        sexe: p.sexe ?? '',
        adresse: p.adresse ?? '',
        medecin_traitant: p.medecin_traitant ?? '',
        antecedents_medicaux: p.antecedents_medicaux ?? '',
      }))
      .finally(() => setLoading(false));
  }, [patientId]);

  const mutation = useMutation({
    mutationFn: (data) =>
      apiFetch(`/admin/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      onSuccess(qc);
      onClose();
    },
  });

  return (
    <Modal
      centered
      opened={!!patientId}
      onClose={onClose}
      title="Modifier le patient"
      size="lg"
    >
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}>
        <Stack gap="sm">
          <Group grow>
            <TextInput label="Nom" required value={form.nom}
              onChange={(e) => setForm(p => ({ ...p, nom: e.target.value }))} />
            <TextInput label="Prénom" required value={form.prenom}
              onChange={(e) => setForm(p => ({ ...p, prenom: e.target.value }))} />
          </Group>
          <Group grow>
            <TextInput label="Date de naissance" placeholder="JJ/MM/AAAA" value={form.date_naissance}
              onChange={(e) => setForm(p => ({ ...p, date_naissance: e.target.value }))} />
            <Select label="Sexe" data={['M', 'F', 'Autre']} clearable value={form.sexe}
              onChange={(v) => setForm(p => ({ ...p, sexe: v ?? '' }))} />
          </Group>
          <Group grow>
            <TextInput label="Téléphone" value={form.telephone}
              onChange={(e) => setForm(p => ({ ...p, telephone: e.target.value }))} />
            <TextInput label="Email" type="email" required value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
          </Group>
          <TextInput label="Adresse" value={form.adresse}
            onChange={(e) => setForm(p => ({ ...p, adresse: e.target.value }))} />
          <TextInput label="Médecin traitant" value={form.medecin_traitant}
            onChange={(e) => setForm(p => ({ ...p, medecin_traitant: e.target.value }))} />
          <Textarea label="Antécédents médicaux" minRows={3} value={form.antecedents_medicaux}
            onChange={(e) => setForm(p => ({ ...p, antecedents_medicaux: e.target.value }))} />
          {mutation.isError && <Text c="red" size="sm">{mutation.error.message}</Text>}
          <Button type="submit" loading={mutation.isPending || loading}>
            Enregistrer les modifications
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
