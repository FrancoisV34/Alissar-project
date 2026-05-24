import { useState } from 'react';
import {
  Group, Button, Table, Modal, Stack, TextInput, Textarea, Select, Text,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api.js';
import { Icon, ICON_KEYS } from '../IconSet.jsx';

const ICON_OPTIONS = ICON_KEYS.map((k) => ({ value: k, label: k }));

export default function SpecialtiesTab() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['admin-pec'],
    queryFn: () => apiFetch('/admin/pec'),
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ num: '', title: '', description: '', icon: 'Sparkle', image_alt: '', sort_order: '' });

  function openCreate() {
    setEditing(null);
    setForm({ num: '', title: '', description: '', icon: 'Sparkle', image_alt: '', sort_order: '' });
    setOpen(true);
  }
  function openEdit(it) {
    setEditing(it);
    setForm({
      num: it.num ?? '',
      title: it.title ?? '',
      description: it.description ?? it.content ?? '',
      icon: it.icon ?? 'Sparkle',
      image_alt: it.image_alt ?? '',
      sort_order: String(it.sort_order ?? ''),
    });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: () => {
      const body = {
        num: form.num || null,
        title: form.title,
        description: form.description || null,
        icon: form.icon || null,
        image_alt: form.image_alt || null,
        sort_order: form.sort_order === '' ? undefined : Number(form.sort_order),
      };
      if (editing) return apiFetch(`/admin/pec/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
      return apiFetch('/admin/pec', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pec'] });
      qc.invalidateQueries({ queryKey: ['pec'] });
      setOpen(false);
    },
  });

  const del = useMutation({
    mutationFn: (id) => apiFetch(`/admin/pec/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pec'] });
      qc.invalidateQueries({ queryKey: ['pec'] });
    },
  });

  const PreviewIcon = Icon[form.icon] ?? Icon.Sparkle;

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button size="sm" onClick={openCreate}>+ Ajouter</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ordre</Table.Th>
            <Table.Th>N°</Table.Th>
            <Table.Th>Icône</Table.Th>
            <Table.Th>Titre</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((it) => {
            const I = Icon[it.icon] ?? Icon.Sparkle;
            return (
              <Table.Tr key={it.id}>
                <Table.Td>{it.sort_order}</Table.Td>
                <Table.Td>{it.num ?? '—'}</Table.Td>
                <Table.Td><span style={{ display: 'inline-flex', color: 'var(--accent, #e87265)' }}><I /></span></Table.Td>
                <Table.Td>{it.title}</Table.Td>
                <Table.Td><Text size="sm" lineClamp={2}>{it.description ?? it.content ?? '—'}</Text></Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="light" onClick={() => openEdit(it)}>Modifier</Button>
                    <Button size="xs" color="red" variant="light" onClick={() => del.mutate(it.id)}>Supprimer</Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      <Modal centered opened={open} onClose={() => setOpen(false)} title={editing ? 'Modifier la spécialité' : 'Nouvelle spécialité'}>
        <Stack gap="sm">
          <TextInput label="Numéro (ex: 01)" value={form.num} onChange={(e) => setForm({ ...form, num: e.currentTarget.value })} />
          <TextInput label="Titre" required value={form.title} onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
          <Textarea label="Description" autosize minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
          <Group align="flex-end">
            <Select label="Icône" data={ICON_OPTIONS} value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} style={{ flex: 1 }} />
            <Group gap={4} style={{ paddingBottom: 8, color: 'var(--accent, #e87265)' }}><PreviewIcon /></Group>
          </Group>
          <TextInput label="Texte alternatif image (SEO + accessibilité)" value={form.image_alt} onChange={(e) => setForm({ ...form, image_alt: e.currentTarget.value })} />
          <TextInput label="Ordre" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.currentTarget.value })} />
          <Button onClick={() => save.mutate()} loading={save.isPending}>Enregistrer</Button>
        </Stack>
      </Modal>
    </>
  );
}
