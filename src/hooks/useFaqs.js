import { useQuery } from '@tanstack/react-query';

async function fetchFaqs() {
  const res = await fetch('/api/faqs');
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function useFaqs() {
  return useQuery({ queryKey: ['faqs'], queryFn: fetchFaqs });
}
