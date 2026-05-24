import { useQuery } from '@tanstack/react-query';

async function fetchSiteConfig() {
  const res = await fetch('/api/site-config');
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function useSiteConfig() {
  return useQuery({ queryKey: ['site-config'], queryFn: fetchSiteConfig });
}
