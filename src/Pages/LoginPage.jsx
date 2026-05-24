import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, TextInput, PasswordInput, Button, Stack, Alert, Title, Text } from '@mantine/core';
import { postLogin } from '../api/auth.js';
import useStore from '../store/useStore.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, user } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.must_change_password) navigate('/change-password');
      else navigate('/admin');
    }
  }, [isAuthenticated, navigate, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await postLogin(email, password);
      login(data.user, data.token);
      if (data.user.must_change_password) navigate('/change-password');
      else navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size={420} py={60}>
      <Paper radius="md" p="xl" withBorder>
        <Title order={3} mb="lg" ta="center">Espace praticien</Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            {error && <Alert color="red" variant="light">{error}</Alert>}
            <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <PasswordInput label="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" loading={loading} fullWidth mt="md">Se connecter</Button>
            <Text size="xs" c="dimmed" ta="center" mt="xs">
              Seuls les comptes admin et praticien peuvent se connecter.
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
