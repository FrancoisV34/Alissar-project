const BASE_URL = '/api';

async function postJSON(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `API error ${res.status}`);
  return data;
}

async function fetchJSONAuth(path, options = {}) {
  const token = localStorage.getItem('mb-token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `API error ${res.status}`);
  return data;
}

export const postLogin = (email, password) =>
  postJSON('/auth/login', { email, password });

export const postRegister = (email, password, role = 'patient') =>
  postJSON('/auth/register', { email, password, role });

export const getMe = () => fetchJSONAuth('/auth/me');

export const postChangePassword = (currentPassword, newPassword) =>
  fetchJSONAuth('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
