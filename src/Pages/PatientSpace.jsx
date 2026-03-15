import { Container, Title, Tabs, Text } from '@mantine/core';

export default function PatientSpace() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Mon espace</Title>
      <Tabs defaultValue="factures">
        <Tabs.List mb="lg">
          <Tabs.Tab value="factures">Mes factures</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="factures">
          <Text c="dimmed">En cours de développement</Text>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
