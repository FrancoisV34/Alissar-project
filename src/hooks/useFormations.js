import { useQuery } from '@tanstack/react-query';
import { fetchFormations } from '../api/client.js';

export function useFormations() {
  return useQuery({ queryKey: ['formations'], queryFn: fetchFormations });
}
