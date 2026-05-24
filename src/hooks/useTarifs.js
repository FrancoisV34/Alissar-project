import { useQuery } from '@tanstack/react-query';
import { fetchTarifs } from '../api/client.js';

export function useTarifs() {
  return useQuery({ queryKey: ['tarifs'], queryFn: fetchTarifs });
}
