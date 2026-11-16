import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme, localStorageColorSchemeManager } from '@mantine/core';
import '@mantine/core/styles.css';
import Homepage from './Pages/Homepage.jsx';
// Pages privées chargées à la demande : les visiteurs ne téléchargent pas le code de l'administration.
const LoginPage = lazy(() => import('./Pages/LoginPage.jsx'));
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard.jsx'));
const ChangePasswordPage = lazy(() => import('./Pages/ChangePasswordPage.jsx'));
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import ThemeProvider from './Components/ThemeProvider.jsx';
import VitrineLayout from './Components/VitrineLayout.jsx';
import './Style/Main.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const colorSchemeManager = localStorageColorSchemeManager({ key: 'mb-color-scheme' });

const theme = createTheme({
  primaryColor: 'salmon',
  colors: {
    salmon: [
      '#fff0ee', '#ffddd9', '#ffb8b2', '#ff9088', '#fa8072',
      '#f76558', '#f55a4c', '#da4b3d', '#c34136', '#ab342d',
    ],
  },
  // Nuance 8 : texte blanc sur bouton à 5,1:1 (la nuance 6 par défaut donnait 3,25:1).
  primaryShade: 8,
  fontFamily: 'Inter, sans-serif',
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager} defaultColorScheme="light">
        <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<VitrineLayout><Homepage /></VitrineLayout>} />
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/change-password" element={<ChangePasswordPage />} />
              </Route>
              <Route element={<ProtectedRoute role={['admin', 'praticien']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
