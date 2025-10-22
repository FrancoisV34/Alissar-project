import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Homepage from './Pages/Homepage.jsx';
import './Style/Main.scss';
import Layout from './Components/Layout.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Layout>
      <Homepage />
    </Layout>
  </StrictMode>
);
