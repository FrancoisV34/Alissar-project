const BASE_URL = '/api';

export function authHeaders() {
  const token = localStorage.getItem('mb-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = data.details?.map((d) => `${d.field} : ${d.message}`).join(' ; ');
    throw new Error(details ? `${data.error} (${details})` : (data.error ?? `Erreur ${res.status}`));
  }
  return data;
}
