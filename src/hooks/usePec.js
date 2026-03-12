import { useQuery } from '@tanstack/react-query';
import { fetchPec } from '../api/client.js';

export function usePec() {
  return useQuery({ queryKey: ['pec'], queryFn: fetchPec });
}
