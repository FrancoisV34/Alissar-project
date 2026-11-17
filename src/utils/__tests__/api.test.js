import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiFetch, authHeaders } from '../api.js';

const mockFetch = (status, body) => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  status, ok: status < 400, json: () => (body === undefined ? Promise.reject(new Error('vide')) : Promise.resolve(body)),
}));
afterEach(() => vi.unstubAllGlobals());

describe('apiFetch', () => {
  it('ajoute le jeton de session s\'il existe', () => {
    expect(authHeaders()).not.toHaveProperty('Authorization');
    localStorage.setItem('mb-token', 'abc');
    expect(authHeaders().Authorization).toBe('Bearer abc');
  });

  it('renvoie le JSON en cas de succès et null pour une 204', async () => {
    mockFetch(200, { ok: 1 });
    expect(await apiFetch('/x')).toEqual({ ok: 1 });
    mockFetch(204);
    expect(await apiFetch('/x')).toBeNull();
  });

  it('affiche le détail des champs refusés par la validation', async () => {
    mockFetch(400, { error: 'Données invalides', details: [{ field: 'prix', message: 'nombre attendu' }] });
    await expect(apiFetch('/x')).rejects.toThrow('Données invalides (prix : nombre attendu)');
  });

  it('gère une réponse d\'erreur sans corps JSON', async () => {
    mockFetch(502);
    await expect(apiFetch('/x')).rejects.toThrow('Erreur 502');
  });
});
