import { useQuery } from '@tanstack/react-query';
import { fetchContact } from '../api/client.js';

export function useContact() {
  return useQuery({ queryKey: ['contact'], queryFn: fetchContact });
}
