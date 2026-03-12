import React from 'react';
import '../Style/Header.scss';
import Button from './Button.jsx';
import { useMantineColorScheme } from '@mantine/core';

export default function Header() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <header>
      <h1 className="title name">Alissar ATIK Ostéopathe</h1>
      <nav className="navigation-list">
        <ul className="nav-ul">
          <li>
            <a href="#a-propos">A propos</a>
          </li>
          <li>
            <a href="#osteo">L'ostéopathie</a>
          </li>
          <li>
            <a href="#formations">Formations</a>
          </li>
          <li>
            <a href="#tarifs">Tarifs</a>
          </li>
          <li>
            <a href="#contacts">Contacts</a>
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
      <Button />
    </header>
  );
}
