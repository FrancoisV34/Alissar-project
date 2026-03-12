import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme, localStorageColorSchemeManager } from '@mantine/core';
import '@mantine/core/styles.css';
import Homepage from './Pages/Homepage.jsx';
import './Style/Main.scss';
import Layout from './Components/Layout.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const colorSchemeManager = localStorageColorSchemeManager({ key: 'alissar-color-scheme' });

const theme = createTheme({
  primaryColor: 'salmon',
  colors: {
    salmon: [
      '#fff0ee',
      '#ffddd9',
      '#ffb8b2',
      '#ff9088',
      '#fa8072',
      '#f76558',
      '#f55a4c',
      '#da4b3d',
      '#c34136',
      '#ab342d',
    ],
  },
  fontFamily: 'Work Sans, sans-serif',
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager} defaultColorScheme="light">
        <Layout>
          <Homepage />
        </Layout>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
