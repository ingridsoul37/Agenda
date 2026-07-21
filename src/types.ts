export type ContactCategory = 'Pessoal' | 'Trabalho' | 'Família' | 'Outro';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: ContactCategory;
  favorite: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  isConnected: boolean;
  lastSync?: string | null;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export type ViewMode = 'grid' | 'table';
