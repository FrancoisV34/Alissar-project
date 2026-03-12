import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Tabs,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Alert,
} from '@mantine/core';
import { postLogin, postRegister } from '../api/auth.js';
import useStore from '../store/useStore.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, user } = useStore();
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.must_change_password) {
        navigate('/change-password');
      } else {
        navigate(user?.role === 'admin' ? '/admin' : '/');
      }
    }
  }, [isAuthenticated, navigate, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let data;
      if (activeTab === 'login') {
        data = await postLogin(email, password);
      } else {
        data = await postRegister(email, password, role);
      }
      login(data.user, data.token);
      if (data.user.must_change_password) {
        navigate('/change-password');
      } else {
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size={420} py={60}>
      <Paper radius="md" p="xl" withBorder>
        <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
          <Tabs.List>
            <Tabs.Tab value="login">Connexion</Tabs.Tab>
            <Tabs.Tab value="register">Créer un compte</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <TextInput
              label="Email"
              placeholder="votre@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {activeTab === 'register' && (
              <Tabs value={role} onChange={setRole}>
                <Tabs.List>
                  <Tabs.Tab value="patient">Patient</Tabs.Tab>
                  <Tabs.Tab value="admin">Admin</Tabs.Tab>
                </Tabs.List>
              </Tabs>
            )}

            <Button type="submit" loading={loading} fullWidth mt="md">
              {activeTab === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </Button>

            <Text size="xs" c="dimmed" ta="center">
              {activeTab === 'login' ? (
                <>
                  Pas encore de compte ?{' '}
                  <Text
                    component="span"
                    size="xs"
                    c="salmon"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveTab('register')}
                  >
                    Créer un compte
                  </Text>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <Text
                    component="span"
                    size="xs"
                    c="salmon"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveTab('login')}
                  >
                    Se connecter
                  </Text>
                </>
              )}
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
