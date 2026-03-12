import { Container, Title, Text, Paper } from '@mantine/core';
import useStore from '../store/useStore.js';

export default function PatientSpace() {
  const { user } = useStore();

  return (
    <Container size="md" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} mb="md">Espace Patient</Title>
        <Text c="dimmed">Bienvenue, {user?.email}</Text>
        <Text mt="md">
          Votre espace personnel sera disponible prochainement.
        </Text>
      </Paper>
    </Container>
  );
}
