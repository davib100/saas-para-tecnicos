import { z } from 'zod';
import { ClientSchema } from '@/lib/validators';

export interface Client extends z.infer<typeof ClientSchema> {
  id: string;
  status: 'Ativo' | 'Inativo';
  dataCadastro: string;
}