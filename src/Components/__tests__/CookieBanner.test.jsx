import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CookieBanner from '../CookieBanner.jsx';
import { getConsent } from '../../utils/consent.js';

vi.mock('../../hooks/useSiteConfig.js', () => ({ useSiteConfig: () => ({ data: globalThis.__cfg }) }));

describe('CookieBanner (US-07, RGPD)', () => {
  it('ne s\'affiche pas si Google Analytics n\'est pas configuré', () => {
    globalThis.__cfg = { ga_measurement_id: null };
    render(<CookieBanner />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('s\'affiche à la première visite, sans consentement donné par défaut', () => {
    globalThis.__cfg = { ga_measurement_id: 'G-TEST1234' };
    render(<CookieBanner />);
    expect(screen.getByRole('dialog', { name: 'Bandeau cookies' })).toBeInTheDocument();
    expect(getConsent()).toBe('unset');
  });

  it.each([['Accepter', 'granted'], ['Refuser', 'denied']])('« %s » mémorise le choix et prévient la mesure d\'audience', async (label, value) => {
    globalThis.__cfg = { ga_measurement_id: 'G-TEST1234' };
    const listener = vi.fn();
    window.addEventListener('mb-consent-change', listener);
    render(<CookieBanner />);
    await userEvent.click(screen.getByRole('button', { name: label }));
    expect(getConsent()).toBe(value);
    expect(listener.mock.calls[0][0].detail).toBe(value);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    window.removeEventListener('mb-consent-change', listener);
  });

  it('ne se réaffiche pas une fois le choix fait', () => {
    globalThis.__cfg = { ga_measurement_id: 'G-TEST1234' };
    localStorage.setItem('mb-consent', 'denied');
    render(<CookieBanner />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
