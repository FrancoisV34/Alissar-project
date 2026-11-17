import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import ThemeProvider from '../ThemeProvider.jsx';

vi.mock('../../hooks/useSiteConfig.js', () => ({ useSiteConfig: () => ({ data: globalThis.__cfg }) }));
const html = document.documentElement;

describe('ThemeProvider (US-14)', () => {
  beforeEach(() => { html.className = ''; html.removeAttribute('style'); });

  it('applique la palette, le mode sombre et la police choisis', () => {
    globalThis.__cfg = { palette: 'forest-cream', dark_mode: 1, font_title: 'Fraunces' };
    render(<ThemeProvider><p>x</p></ThemeProvider>);
    expect(html).toHaveClass('palette-forest-cream', 'theme-dark');
    expect(html.style.getPropertyValue('--font-title')).toContain('Fraunces');
  });

  it('ignore une palette ou une police hors liste (pas d\'injection de classe ou de CSS)', () => {
    globalThis.__cfg = { palette: 'x" onload="alert(1)', font_title: 'Comic; } body { display:none' };
    render(<ThemeProvider><p>x</p></ThemeProvider>);
    expect([...html.classList]).toEqual(['palette-coral-cream']);
    expect(html.style.getPropertyValue('--font-title')).toContain('Instrument Serif');
  });

  it('ne garde qu\'une seule classe de palette', () => {
    html.classList.add('palette-plum-blush');
    globalThis.__cfg = { palette: 'coral-sage' };
    render(<ThemeProvider><p>x</p></ThemeProvider>);
    expect([...html.classList].filter((c) => c.startsWith('palette-'))).toEqual(['palette-coral-sage']);
  });
});
