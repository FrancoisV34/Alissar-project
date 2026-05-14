const BASE_URL = '/api';

async function fetchJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const fetchFormations = () => fetchJSON('/formations');
export const fetchPec = () => fetchJSON('/pec');
export const fetchTarifs = () => fetchJSON('/tarifs');
export const fetchHoraires = () => fetchJSON('/horaires');
export const fetchSiteConfig = () => fetchJSON('/site-config');
export const fetchExternalLinks = (type) => fetchJSON(type ? `/external-links?type=${type}` : '/external-links');
