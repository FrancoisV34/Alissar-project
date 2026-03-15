import React from 'react';
import '../Style/Header.scss';
import Button from './Button.jsx';
import { useMantineColorScheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore.js';

export default function Header() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useStore();

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleNavClick(e, anchor) {
    if (window.location.pathname !== '/') {
      e.preventDefault();
      window.location.href = `/#${anchor}`;
    }
  }

  return (
    <header>
      <h1 className="title name">Alissar ATIK Ostéopathe</h1>
      <nav className="navigation-list">
        <ul className="nav-ul">
          <li>
            <a href="/#a-propos" onClick={(e) => handleNavClick(e, 'a-propos')}>A propos</a>
          </li>
          <li>
            <a href="/#osteo" onClick={(e) => handleNavClick(e, 'osteo')}>L'ostéopathie</a>
          </li>
          <li>
            <a href="/#formations" onClick={(e) => handleNavClick(e, 'formations')}>Formations</a>
          </li>
          <li>
            <a href="/#tarifs" onClick={(e) => handleNavClick(e, 'tarifs')}>Tarifs</a>
          </li>
          <li>
            <a href="/#contacts" onClick={(e) => handleNavClick(e, 'contacts')}>Contacts</a>
          </li>
        </ul>
      </nav>
      <button
        className="dark-mode-toggle"
        onClick={toggleColorScheme}
        aria-label={colorScheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        title={colorScheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      >
        {colorScheme === 'dark' ? '☀️' : '🌙'}
      </button>
      {isAuthenticated ? (
        <div className="auth-section">
          <span className="auth-email">{user?.email}</span>
          {['admin', 'alissar'].includes(user?.role) && (
            <button className="btn-auth" onClick={() => navigate('/admin')}>
              Dashboard
            </button>
          )}
          {user?.role === 'patient' && (
            <button className="btn-auth" onClick={() => navigate('/espace-patient')}>
              Mon espace
            </button>
          )}
          <button className="btn-auth btn-logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      ) : (
        <button className="btn-auth btn-login" onClick={() => navigate('/login')}>
          Connexion
        </button>
      )}
      <Button />
    </header>
  );
}
