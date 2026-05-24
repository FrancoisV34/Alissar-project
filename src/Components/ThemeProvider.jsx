import { useEffect } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig.js';

const PALETTES = new Set([
  'coral-cream',
  'coral-sage',
  'terracotta-sand',
  'plum-blush',
  'forest-cream',
]);

const FONTS = {
  'Instrument Serif': "'Instrument Serif', Georgia, serif",
  'Fraunces': "'Fraunces', Georgia, serif",
  'DM Serif Display': "'DM Serif Display', Georgia, serif",
  'Cormorant Garamond': "'Cormorant Garamond', Georgia, serif",
};

export default function ThemeProvider({ children }) {
  const { data } = useSiteConfig();

  useEffect(() => {
    const html = document.documentElement;

    const palette = PALETTES.has(data?.palette) ? data.palette : 'coral-cream';
    const dark = !!data?.dark_mode;
    const fontTitle = FONTS[data?.font_title] ?? FONTS['Instrument Serif'];

    Array.from(html.classList)
      .filter((c) => c.startsWith('palette-'))
      .forEach((c) => html.classList.remove(c));
    html.classList.add(`palette-${palette}`);
    html.classList.toggle('theme-dark', dark);
    html.style.setProperty('--font-title', fontTitle);
  }, [data?.palette, data?.dark_mode, data?.font_title]);

  return children;
}
