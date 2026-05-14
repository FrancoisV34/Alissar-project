import { useState } from 'react';
import { Stack, Group, TextInput, FileInput, Button, Text, Image, Box } from '@mantine/core';

async function uploadImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  const token = localStorage.getItem('mb-token');
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) throw new Error('Upload échoué');
  return res.json();
}

/**
 * ImageField — champ image admin réutilisable.
 *
 * Props :
 *   - label : label du champ
 *   - value : URL actuelle (string)
 *   - onChange(url) : appelé avec la nouvelle URL après upload ou saisie manuelle
 *   - accept : ex 'image/*' (par défaut)
 *   - previewHeight : hauteur max preview (defaut 80)
 *   - description : texte d'aide
 *   - allowManualUrl : si true (défaut), affiche aussi le champ texte URL pour saisie/copie
 */
export default function ImageField({
  label,
  value,
  onChange,
  accept = 'image/*',
  previewHeight = 80,
  description,
  allowManualUrl = true,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Stack gap={6}>
      {label && <Text size="sm" fw={500}>{label}</Text>}
      {description && <Text size="xs" c="dimmed">{description}</Text>}

      {value && (
        <Group gap="sm" align="center">
          <Image src={value} alt="" h={previewHeight} w="auto" fit="contain" radius="sm" style={{ border: '1px solid var(--mantine-color-gray-3)' }} />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" c="dimmed" truncate>{value}</Text>
          </Box>
          <Button size="xs" variant="subtle" color="red" onClick={() => onChange('')}>Retirer</Button>
        </Group>
      )}

      <FileInput
        accept={accept}
        placeholder={value ? 'Remplacer l\'image…' : 'Choisir une image…'}
        onChange={handleFile}
        clearable={false}
        disabled={uploading}
      />

      {allowManualUrl && (
        <TextInput
          size="xs"
          placeholder="Ou coller une URL directement"
          value={value ?? ''}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      )}

      {uploading && <Text size="xs" c="dimmed">Upload en cours…</Text>}
      {error && <Text size="xs" c="red">{error}</Text>}
    </Stack>
  );
}
