import { useQuery } from '@tanstack/react-query';

async function fetchExternalLinks(type) {
  const url = type ? `/api/external-links?type=${type}` : '/api/external-links';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function useExternalLinks(type) {
  return useQuery({
    queryKey: ['external-links', type ?? 'all'],
    queryFn: () => fetchExternalLinks(type),
  });
}
