import { useState } from 'react';
import { Group, Button, Table, Modal, Stack, TextInput, Textarea, Text } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api.js';

export default function FaqTab() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => apiFetch('/admin/faqs'),
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', sort_order: '' });

  function openCreate() {
    setEditing(null);
    setForm({ question: '', answer: '', sort_order: '' });
    setOpen(true);
  }
  function openEdit(it) {
    setEditing(it);
    setForm({ question: it.question, answer: it.answer, sort_order: String(it.sort_order ?? '') });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: () => {
      const body = {
        question: form.question,
        answer: form.answer,
        sort_order: form.sort_order === '' ? undefined : Number(form.sort_order),
      };
      return editing
        ? apiFetch(`/admin/faqs/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
        : apiFetch('/admin/faqs', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-faqs'] });
      qc.invalidateQueries({ queryKey: ['faqs'] });
      setOpen(false);
    },
  });

  const del = useMutation({
    mutationFn: (id) => apiFetch(`/admin/faqs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-faqs'] });
      qc.invalidateQueries({ queryKey: ['faqs'] });
    },
  });

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text c="dimmed" size="sm">Les questions/réponses apparaissent en bas du site et alimentent le schema FAQ pour Google.</Text>
        <Button size="sm" onClick={openCreate}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ordre</Table.Th>
            <Table.Th>Question</Table.Th>
            <Table.Th>Réponse</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((it) => (
            <Table.Tr key={it.id}>
              <Table.Td>{it.sort_order}</Table.Td>
              <Table.Td><Text fw={500}>{it.question}</Text></Table.Td>
              <Table.Td><Text size="sm" lineClamp={2}>{it.answer}</Text></Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" onClick={() => openEdit(it)}>Modifier</Button>
                  <Button size="xs" color="red" variant="light" onClick={() => del.mutate(it.id)}>Supprimer</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal centered size="lg" opened={open} onClose={() => setOpen(false)} title={editing ? 'Modifier la FAQ' : 'Nouvelle FAQ'}>
        <Stack gap="sm">
          <TextInput label="Question" required value={form.question} onChange={(e) => setForm({ ...form, question: e.currentTarget.value })} />
          <Textarea label="Réponse" required autosize minRows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.currentTarget.value })} />
          <TextInput label="Ordre d'affichage" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.currentTarget.value })} />
          <Button onClick={() => save.mutate()} loading={save.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}
