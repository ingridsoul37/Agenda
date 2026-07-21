import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Contact, SupabaseConfig } from '../types';

const LOCAL_STORAGE_KEY_CONFIG = 'supabase_contacts_config';
const LOCAL_STORAGE_KEY_CONTACTS = 'supabase_contacts_data';

// Default initial config checking VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from env or localStorage
export function loadSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const savedConfig = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        tableName: parsed.tableName || 'contacts',
        isConnected: false, // Will be verified on init
        lastSync: parsed.lastSync || null,
      };
    } catch {
      // Fallback below
    }
  }

  return {
    url: envUrl,
    anonKey: envKey,
    tableName: 'contacts',
    isConnected: false,
    lastSync: null,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(config: SupabaseConfig): SupabaseClient | null {
  if (!config.url || !config.anonKey) {
    supabaseInstance = null;
    return null;
  }
  
  try {
    // Validate URL format
    new URL(config.url);
    if (!supabaseInstance) {
      supabaseInstance = createClient(config.url, config.anonKey);
    }
    return supabaseInstance;
  } catch (err) {
    console.warn('Invalid Supabase configuration URL:', err);
    supabaseInstance = null;
    return null;
  }
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}

// SQL helper script to display to the user in Portuguese
export const SUPABASE_SQL_SCRIPT = `-- Execute este script no SQL Editor do seu projeto Supabase:

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  category TEXT DEFAULT 'Pessoal',
  favorite BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar a segurança em nível de linha (RLS):
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem para evitar erros ao reexecutar o script:
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.contacts;
DROP POLICY IF EXISTS "Permitir inserção para todos" ON public.contacts;
DROP POLICY IF EXISTS "Permitir atualização para todos" ON public.contacts;
DROP POLICY IF EXISTS "Permitir deleção para todos" ON public.contacts;

-- Criar políticas de segurança para acesso público (anônimo) via chave anonKey:
CREATE POLICY "Permitir leitura para todos" ON public.contacts
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção para todos" ON public.contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos" ON public.contacts
  FOR UPDATE USING (true);

CREATE POLICY "Permitir deleção para todos" ON public.contacts
  FOR DELETE USING (true);
`;

/**
 * Tests connection to Supabase table
 */
export async function testConnection(config: SupabaseConfig): Promise<{ success: boolean; error?: string }> {
  if (!config.url || !config.anonKey) {
    return { success: false, error: 'URL do Supabase e Chave Anônima são obrigatórias.' };
  }

  try {
    const client = createClient(config.url, config.anonKey);
    const { data, error } = await client
      .from(config.tableName || 'contacts')
      .select('count', { count: 'exact', head: true });

    if (error) {
      // Check for specific common error codes like 42P01 (relation does not exist)
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { 
          success: false, 
          error: `Tabela '${config.tableName}' não foi encontrada no Supabase. Crie a tabela executando o script SQL.` 
        };
      }
      return { success: false, error: error.message || 'Erro de autenticação ou permissão RLS no Supabase.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Não foi possível conectar à URL do Supabase fornecida.' };
  }
}

/**
 * Loads contacts from Supabase if connected, otherwise from LocalStorage
 */
export async function fetchContacts(config: SupabaseConfig): Promise<{ contacts: Contact[]; isFromCloud: boolean; error?: string }> {
  const client = getSupabaseClient(config);

  if (client && config.isConnected) {
    try {
      const { data, error } = await client
        .from(config.tableName || 'contacts')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const formatted: Contact[] = data.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          email: item.email || '',
          phone: item.phone || '',
          category: item.category || 'Pessoal',
          favorite: Boolean(item.favorite),
          notes: item.notes || '',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || undefined,
        }));

        // Cache to localStorage as backup
        saveLocalContacts(formatted);
        return { contacts: formatted, isFromCloud: true };
      }
    } catch (err: any) {
      console.error('Error fetching from Supabase, falling back to local:', err);
      const local = getLocalContacts();
      return { 
        contacts: local, 
        isFromCloud: false, 
        error: `Falha ao carregar do Supabase (${err.message}). Usando contatos locais.` 
      };
    }
  }

  // Fallback to local storage
  return { contacts: getLocalContacts(), isFromCloud: false };
}

/**
 * Adds a new contact
 */
export async function insertContact(
  contactData: Omit<Contact, 'id' | 'created_at'>,
  config: SupabaseConfig
): Promise<{ contact: Contact; savedInCloud: boolean; error?: string }> {
  const newContact: Contact = {
    ...contactData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    created_at: new Date().toISOString(),
  };

  const client = getSupabaseClient(config);

  if (client && config.isConnected) {
    try {
      const payload = {
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone,
        category: newContact.category,
        favorite: newContact.favorite,
        notes: newContact.notes || '',
      };

      const { data, error } = await client
        .from(config.tableName || 'contacts')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const savedContact: Contact = {
          id: data.id,
          name: data.name,
          email: data.email || '',
          phone: data.phone || '',
          category: data.category || 'Pessoal',
          favorite: Boolean(data.favorite),
          notes: data.notes || '',
          created_at: data.created_at || newContact.created_at,
        };

        // Sync local cache
        const currentLocal = getLocalContacts();
        saveLocalContacts([savedContact, ...currentLocal]);

        return { contact: savedContact, savedInCloud: true };
      }
    } catch (err: any) {
      console.error('Failed to save to Supabase:', err);
      // Save locally as fallback
      const currentLocal = getLocalContacts();
      saveLocalContacts([newContact, ...currentLocal]);
      return {
        contact: newContact,
        savedInCloud: false,
        error: `Erro ao salvar no Supabase (${err.message}). O contato foi salvo no armazenamento local.`
      };
    }
  }

  // Save in local storage
  const currentLocal = getLocalContacts();
  saveLocalContacts([newContact, ...currentLocal]);
  return { contact: newContact, savedInCloud: false };
}

/**
 * Updates an existing contact
 */
export async function updateContact(
  contact: Contact,
  config: SupabaseConfig
): Promise<{ updated: Contact; savedInCloud: boolean; error?: string }> {
  const updatedContact = {
    ...contact,
    updated_at: new Date().toISOString(),
  };

  const client = getSupabaseClient(config);

  if (client && config.isConnected) {
    try {
      const { error } = await client
        .from(config.tableName || 'contacts')
        .update({
          name: updatedContact.name,
          email: updatedContact.email,
          phone: updatedContact.phone,
          category: updatedContact.category,
          favorite: updatedContact.favorite,
          notes: updatedContact.notes || '',
          updated_at: updatedContact.updated_at,
        })
        .eq('id', updatedContact.id);

      if (error) throw error;

      // Update local storage
      const currentLocal = getLocalContacts().map(c => c.id === updatedContact.id ? updatedContact : c);
      saveLocalContacts(currentLocal);

      return { updated: updatedContact, savedInCloud: true };
    } catch (err: any) {
      console.error('Failed to update in Supabase:', err);
      const currentLocal = getLocalContacts().map(c => c.id === updatedContact.id ? updatedContact : c);
      saveLocalContacts(currentLocal);

      return {
        updated: updatedContact,
        savedInCloud: false,
        error: `Atualizado localmente. Erro no Supabase: ${err.message}`
      };
    }
  }

  const currentLocal = getLocalContacts().map(c => c.id === updatedContact.id ? updatedContact : c);
  saveLocalContacts(currentLocal);
  return { updated: updatedContact, savedInCloud: false };
}

/**
 * Deletes a contact by ID
 */
export async function deleteContact(
  id: string,
  config: SupabaseConfig
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient(config);

  if (client && config.isConnected) {
    try {
      const { error } = await client
        .from(config.tableName || 'contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Failed to delete from Supabase:', err);
      // Remove locally anyway
      const updatedLocal = getLocalContacts().filter(c => c.id !== id);
      saveLocalContacts(updatedLocal);
      return {
        success: false,
        error: `Excluído localmente. Erro no Supabase: ${err.message}`
      };
    }
  }

  const updatedLocal = getLocalContacts().filter(c => c.id !== id);
  saveLocalContacts(updatedLocal);
  return { success: true };
}

/**
 * Synchronizes local contacts to Supabase
 */
export async function pushLocalToSupabase(
  localContacts: Contact[],
  config: SupabaseConfig
): Promise<{ syncedCount: number; error?: string }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { syncedCount: 0, error: 'Supabase não está configurado.' };
  }

  if (localContacts.length === 0) {
    return { syncedCount: 0 };
  }

  try {
    const payload = localContacts.map(c => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      category: c.category || 'Pessoal',
      favorite: c.favorite || false,
      notes: c.notes || '',
    }));

    const { data, error } = await client
      .from(config.tableName || 'contacts')
      .insert(payload)
      .select();

    if (error) throw error;

    return { syncedCount: data ? data.length : localContacts.length };
  } catch (err: any) {
    return { syncedCount: 0, error: err.message };
  }
}

// LocalStorage helpers
export function getLocalContacts(): Contact[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_CONTACTS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveLocalContacts(contacts: Contact[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
}
