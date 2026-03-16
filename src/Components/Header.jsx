import React, { useState, useEffect, useRef } from 'react';
import '../Style/Header.scss';
import Button from './Button.jsx';
import { useMantineColorScheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore.js';

export default function Header() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleNavClick(e, anchor) {
    if (window.location.pathname !== '/') {
      e.preventDefault();
      window.location.href = `/#${anchor}`;
    }
    setMenuOpen(false);
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close drawer on click outside
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e) {
      if (
        drawerRef.current && !drawerRef.current.contains(e.target) &&
        hamburgerRef.current && !hamburgerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header>
      <div className="header-inner">
        <h1 className="title name">Alissar ATIK Ostéopathe</h1>

        {/* Actions bar — always visible in header */}
        <div className="header-actions">
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
              {['admin', 'alissar'].includes(user?.role) && (
                <>
                  <button className="btn-auth btn-nav-desktop" onClick={() => navigate('/admin')}>
                    Dashboard
                  </button>
                  <button className="btn-auth btn-nav-desktop" onClick={() => navigate('/admin/osteo')}>
                    Logiciel Ostéo
                  </button>
                </>
              )}
              {user?.role === 'patient' && (
                <button className="btn-auth btn-nav-desktop" onClick={() => navigate('/espace-patient')}>
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

          {/* Hamburger button */}
          <button
            ref={hamburgerRef}
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>

        {/* Drawer — nav + RDV */}
        <div
          ref={drawerRef}
          className={`header-drawer ${menuOpen ? 'open' : ''}`}
        >
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

          {/* Auth nav buttons — visible in drawer only on small screens */}
          {isAuthenticated && ['admin', 'alissar'].includes(user?.role) && (
            <div className="drawer-auth">
              <button className="btn-auth btn-nav-drawer" onClick={() => { navigate('/admin'); setMenuOpen(false); }}>
                Dashboard
              </button>
              <button className="btn-auth btn-nav-drawer" onClick={() => { navigate('/admin/osteo'); setMenuOpen(false); }}>
                Logiciel Ostéo
              </button>
            </div>
          )}
          {isAuthenticated && user?.role === 'patient' && (
            <div className="drawer-auth">
              <button className="btn-auth btn-nav-drawer" onClick={() => { navigate('/espace-patient'); setMenuOpen(false); }}>
                Mon espace
              </button>
            </div>
          )}

          <Button />
        </div>
      </div>
    </header>
  );
}
