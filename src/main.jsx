import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme, localStorageColorSchemeManager } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import Homepage from './Pages/Homepage.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import PatientSpace from './Pages/PatientSpace.jsx';
import ChangePasswordPage from './Pages/ChangePasswordPage.jsx';
import OsteoSoftware from './Pages/OsteoSoftware.jsx';
import OsteoConsultation from './Pages/OsteoConsultation.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import './Style/Main.scss';
import './Style/DarkMode.scss';
import Layout from './Components/Layout.jsx';

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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Homepage /></Layout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>
            <Route element={<ProtectedRoute role={['admin', 'praticien']} />}>
              <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
              <Route path="/admin/osteo" element={<Layout><OsteoSoftware /></Layout>} />
              <Route path="/admin/osteo/consultation/:patientId" element={<Layout><OsteoConsultation /></Layout>} />
            </Route>
            <Route element={<ProtectedRoute role="patient" />}>
              <Route path="/espace-patient" element={<Layout><PatientSpace /></Layout>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
