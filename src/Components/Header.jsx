import React from 'react';
import '../Style/Header.scss';
import Button from './Button.jsx';

export default function Header() {
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
      <Button />
    </header>
  );
}
