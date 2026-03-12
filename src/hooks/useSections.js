import { useQuery } from '@tanstack/react-query';
import { fetchSections } from '../api/client.js';

export function useSections() {
  return useQuery({ queryKey: ['sections'], queryFn: fetchSections });
}
