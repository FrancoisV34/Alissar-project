import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SafeHtml from '../SafeHtml.jsx';
import { sanitize } from '../../utils/sanitize.js';

describe('SafeHtml (US-06, défense XSS côté affichage)', () => {
  it('affiche le HTML autorisé', () => {
    const { container } = render(<SafeHtml html="L'ostéopathie, <em>à votre rythme.</em>" />);
    expect(container.querySelector('em')).toHaveTextContent('à votre rythme.');
  });

  it('supprime scripts, gestionnaires d\'événements et balises non autorisées', () => {
    const { container } = render(<SafeHtml html={'Titre<img src=x onerror="alert(1)"><script>alert(2)</script><iframe src="https://x"></iframe>'} />);
    expect(container.innerHTML).toBe('<span>Titre</span>');
  });

  it('retire les liens javascript:', () => {
    expect(sanitize('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
  });

  it('accepte une valeur vide ou nulle', () => {
    expect(render(<SafeHtml html={null} />).container.innerHTML).toBe('<span></span>');
  });

  it('transmet les attributs (className…)', () => {
    const { container } = render(<SafeHtml html="t" className="hero-title" />);
    expect(container.firstChild).toHaveClass('hero-title');
  });
});
