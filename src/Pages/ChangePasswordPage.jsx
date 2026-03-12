import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Title,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Text,
} from '@mantine/core';
import { postChangePassword } from '../api/auth.js';
import useStore from '../store/useStore.js';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useStore();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const data = await postChangePassword(current, next);
      updateUser(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size={420} py={60}>
      <Paper radius="md" p="xl" withBorder>
        <Title order={3} mb="xs">Changement de mot de passe</Title>
        <Text size="sm" c="dimmed" mb="lg">
          Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer.
        </Text>
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}
            <PasswordInput
              label="Mot de passe actuel"
              placeholder="••••••••"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
            <PasswordInput
              label="Nouveau mot de passe"
              placeholder="••••••••"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
            <PasswordInput
              label="Confirmer le nouveau mot de passe"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} fullWidth mt="md">
              Changer le mot de passe
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
