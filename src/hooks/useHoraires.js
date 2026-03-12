import { useQuery } from '@tanstack/react-query';
import { fetchHoraires } from '../api/client.js';

export function useHoraires() {
  return useQuery({ queryKey: ['horaires'], queryFn: fetchHoraires });
}
