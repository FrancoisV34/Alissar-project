import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute.jsx';
import useStore from '../../store/useStore.js';

function renderAt(path = '/admin') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<p>Accueil</p>} />
        <Route path="/login" element={<p>Connexion</p>} />
        <Route path="/change-password" element={<p>Changer le mot de passe</p>} />
        <Route element={<ProtectedRoute role={['admin', 'praticien']} />}>
          <Route path="/admin" element={<p>Tableau de bord</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}
const loginAs = (user) => useStore.setState({ user, token: 't', isAuthenticated: true });

describe('ProtectedRoute (US-10, US-11)', () => {
  beforeEach(() => useStore.setState({ user: null, token: null, isAuthenticated: false }));

  it('redirige vers la connexion sans session', () => {
    renderAt();
    expect(screen.getByText('Connexion')).toBeInTheDocument();
  });

  it('affiche la page pour un rôle autorisé', () => {
    loginAs({ role: 'praticien', must_change_password: 0 });
    renderAt();
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
  });

  it('renvoie à l\'accueil un rôle non autorisé', () => {
    loginAs({ role: 'visiteur', must_change_password: 0 });
    renderAt();
    expect(screen.getByText('Accueil')).toBeInTheDocument();
  });

  it('impose le changement d\'un mot de passe provisoire', () => {
    loginAs({ role: 'praticien', must_change_password: 1 });
    renderAt();
    expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
  });
});
