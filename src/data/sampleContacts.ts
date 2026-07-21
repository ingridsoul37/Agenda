import { Contact } from '../types';

export const INITIAL_SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'sample-1',
    name: 'Ana Clara Souza',
    email: 'ana.clara@empresa.com.br',
    phone: '(11) 98765-4321',
    category: 'Trabalho',
    favorite: true,
    notes: 'Gerente de projetos de TI. Horário preferencial: tarde.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'sample-2',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@gmail.com',
    phone: '(21) 99123-8877',
    category: 'Pessoal',
    favorite: true,
    notes: 'Amigo de faculdade.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sample-3',
    name: 'Beatriz Lima',
    email: 'beatriz.lima@outlook.com',
    phone: '(31) 97456-1122',
    category: 'Família',
    favorite: false,
    notes: 'Prima de Belo Horizonte.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-4',
    name: 'Carlos Eduardo Santos',
    email: 'carlos.santos@techsolutions.io',
    phone: '(41) 98822-3344',
    category: 'Trabalho',
    favorite: false,
    notes: 'Desenvolvedor especialista em Banco de Dados e Supabase.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];
