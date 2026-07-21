import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { SearchBar } from './components/SearchBar';
import { ContactCard } from './components/ContactCard';
import { ContactTable } from './components/ContactTable';
import { ContactFormModal } from './components/ContactFormModal';
import { SupabaseModal } from './components/SupabaseModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastContainer } from './components/ToastContainer';
import { Contact, SupabaseConfig, ToastNotification, ViewMode } from './types';
import {
  loadSupabaseConfig,
  fetchContacts,
  insertContact,
  updateContact,
  deleteContact,
  getLocalContacts,
  saveLocalContacts,
  testConnection,
} from './lib/supabase';
import { INITIAL_SAMPLE_CONTACTS } from './data/sampleContacts';
import { exportToCSV, exportToJSON, formatPhoneNumber } from './utils/formatters';
import { UserPlus, Users, Database, Sparkles, Upload, FileSpreadsheet } from 'lucide-react';

export default function App() {
  // Supabase Configuration State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(loadSupabaseConfig());
  
  // Contacts State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'recent'>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals & UI State
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContactDetail, setSelectedContactDetail] = useState<Contact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addToast = (type: ToastNotification['type'], title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load & Supabase Verification
  useEffect(() => {
    async function init() {
      setIsLoading(true);

      // Check if we have local contacts or seed sample ones
      let currentLocal = getLocalContacts();
      if (currentLocal.length === 0) {
        currentLocal = INITIAL_SAMPLE_CONTACTS;
        saveLocalContacts(currentLocal);
      }
      setContacts(currentLocal);

      // Verify Supabase connection if URL & Key exist
      const config = loadSupabaseConfig();
      if (config.url && config.anonKey) {
        const testRes = await testConnection(config);
        const verifiedConfig = { ...config, isConnected: testRes.success };
        setSupabaseConfig(verifiedConfig);

        if (testRes.success) {
          // Fetch contacts from cloud
          const res = await fetchContacts(verifiedConfig);
          if (res.isFromCloud) {
            setContacts(res.contacts);
            addToast('success', 'Conectado ao Supabase', `${res.contacts.length} contatos sincronizados da nuvem.`);
          } else if (res.error) {
            addToast('warning', 'Modo Local Ativo', res.error);
          }
        }
      } else {
        addToast('info', 'Armazenamento Local', 'Seus contatos estão salvos no navegador. Configure o Supabase para sincronizar.');
      }

      setIsLoading(false);
    }

    init();
  }, []);

  // Reload contacts from cloud or local
  const handleRefreshCloud = async () => {
    setIsSyncing(true);
    const res = await fetchContacts(supabaseConfig);
    setIsSyncing(false);

    if (res.isFromCloud) {
      setContacts(res.contacts);
      addToast('success', 'Dados Atualizados', 'Lista de contatos recarregada do Supabase.');
    } else {
      addToast('error', 'Falha na Atualização', res.error || 'Não foi possível buscar dados da nuvem.');
    }
  };

  // Add or Edit Contact
  const handleSaveContact = async (data: Omit<Contact, 'id' | 'created_at'> | Contact) => {
    if ('id' in data && data.id) {
      // Edit existing
      const res = await updateContact(data as Contact, supabaseConfig);
      setContacts((prev) => prev.map((c) => (c.id === res.updated.id ? res.updated : c)));

      if (res.savedInCloud) {
        addToast('success', 'Contato Atualizado', `"${res.updated.name}" foi salvo no Supabase.`);
      } else {
        addToast('info', 'Contato Atualizado', `"${res.updated.name}" atualizado localmente.`);
      }
    } else {
      // Add new
      const res = await insertContact(data, supabaseConfig);
      setContacts((prev) => [res.contact, ...prev]);

      if (res.savedInCloud) {
        addToast('success', 'Contato Criado!', `"${res.contact.name}" foi salvo com sucesso no Supabase.`);
      } else {
        addToast('info', 'Contato Criado (Local)', `"${res.contact.name}" foi salvo no armazenamento local.`);
      }
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (contact: Contact) => {
    const updated = { ...contact, favorite: !contact.favorite };
    setContacts((prev) => prev.map((c) => (c.id === contact.id ? updated : c)));

    await updateContact(updated, supabaseConfig);
    addToast(
      'info',
      updated.favorite ? 'Adicionado aos Favoritos' : 'Removido dos Favoritos',
      contact.name
    );
  };

  // Delete Contact
  const handleDeleteConfirm = async () => {
    if (!deletingContactId) return;

    const target = contacts.find((c) => c.id === deletingContactId);
    setContacts((prev) => prev.filter((c) => c.id !== deletingContactId));

    await deleteContact(deletingContactId, supabaseConfig);
    setDeletingContactId(null);

    addToast('success', 'Contato Excluído', target ? `"${target.name}" foi removido.` : undefined);
  };

  // Copy text to clipboard helper
  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast('success', `${label} Copiado!`, text);
  };

  // File Import handler (CSV or JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        let importedContacts: Contact[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            importedContacts = parsed.map((item: any, idx) => ({
              id: item.id || `import-${Date.now()}-${idx}`,
              name: item.name || item.nome || 'Contato Sem Nome',
              email: item.email || '',
              phone: formatPhoneNumber(item.phone || item.telefone || ''),
              category: item.category || item.categoria || 'Pessoal',
              favorite: Boolean(item.favorite || item.favorito),
              notes: item.notes || item.notas || '',
              created_at: item.created_at || new Date().toISOString(),
            }));
          }
        } else {
          // Parse CSV lines
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            // skip header
            for (let i = 1; i < lines.length; i++) {
              const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
              if (parts[0]) {
                importedContacts.push({
                  id: `import-${Date.now()}-${i}`,
                  name: parts[0],
                  email: parts[1] || '',
                  phone: formatPhoneNumber(parts[2] || ''),
                  category: (parts[3] as any) || 'Pessoal',
                  favorite: parts[4] === 'Sim' || parts[4] === 'true',
                  notes: parts[5] || '',
                  created_at: new Date().toISOString(),
                });
              }
            }
          }
        }

        if (importedContacts.length > 0) {
          const merged = [...importedContacts, ...contacts];
          setContacts(merged);
          saveLocalContacts(merged);
          addToast(
            'success',
            'Importação Concluída!',
            `${importedContacts.length} contatos foram importados com sucesso.`
          );
        } else {
          addToast('warning', 'Nenhum contato encontrado no arquivo.');
        }
      } catch (err: any) {
        addToast('error', 'Erro ao Importar', 'Verifique a formatação do arquivo CSV/JSON.');
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter & Search Logic
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        // Category Filter
        if (selectedCategory === 'favorites') {
          if (!c.favorite) return false;
        } else if (selectedCategory !== 'all') {
          if (c.category !== selectedCategory) return false;
        }

        // Search Term Filter
        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase().trim();
        const matchName = (c.name || '').toLowerCase().includes(term);
        const matchEmail = (c.email || '').toLowerCase().includes(term);
        const matchPhone = (c.phone || '').replace(/\D/g, '').includes(term.replace(/\D/g, ''));
        const matchNotes = (c.notes || '').toLowerCase().includes(term);

        return matchName || matchEmail || matchPhone || matchNotes;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name, 'pt-BR');
        }
        if (sortBy === 'name-desc') {
          return b.name.localeCompare(a.name, 'pt-BR');
        }
        if (sortBy === 'recent') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
  }, [contacts, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Hidden File Input for CSV/JSON Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv, .json, text/csv, application/json"
        className="hidden"
      />

      {/* Navigation Header */}
      <Navbar
        supabaseConfig={supabaseConfig}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAddModal={() => {
          setEditingContact(null);
          setIsFormModalOpen(true);
        }}
        onSyncCloud={handleRefreshCloud}
        isSyncing={isSyncing}
        onExportCSV={() => {
          exportToCSV(contacts);
          addToast('info', 'Exportação CSV', 'Download iniciado do arquivo CSV de contatos.');
        }}
        onImportClick={() => fileInputRef.current?.click()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Metric Summary Bar */}
        <StatsBar
          contacts={contacts}
          supabaseConfig={supabaseConfig}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          activeCategory={selectedCategory}
          onSelectCategoryFilter={(cat) => setSelectedCategory(cat)}
        />

        {/* Search & Filter Control Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiltered={filteredContacts.length}
        />

        {/* Loading Spinner State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold uppercase tracking-wider">Carregando contatos...</span>
          </div>
        ) : filteredContacts.length > 0 ? (
          /* Contact List / Grid */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={(c) => {
                    setEditingContact(c);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(id) => setDeletingContactId(id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectContact={(c) => setSelectedContactDetail(c)}
                  onCopyText={handleCopyText}
                />
              ))}
            </div>
          ) : (
            <ContactTable
              contacts={filteredContacts}
              onEdit={(c) => {
                setEditingContact(c);
                setIsFormModalOpen(true);
              }}
              onDelete={(id) => setDeletingContactId(id)}
              onToggleFavorite={handleToggleFavorite}
              onSelectContact={(c) => setSelectedContactDetail(c)}
              onCopyText={handleCopyText}
            />
          )
        ) : (
          /* Empty State */
          <div className="py-16 px-6 bg-white border border-slate-200 rounded-2xl text-center max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight mb-1.5">
              Nenhum contato encontrado
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto mb-6 leading-relaxed">
              {searchTerm || selectedCategory !== 'all'
                ? 'Tente ajustar sua busca ou filtro de categoria.'
                : 'Você ainda não cadastrou nenhum contato. Clique abaixo para adicionar o primeiro.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {searchTerm || selectedCategory !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 border border-slate-200 transition-colors"
                >
                  Limpar Filtros
                </button>
              ) : null}
              <button
                onClick={() => {
                  setEditingContact(null);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Adicionar Contato</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Sistema de Salvamento de Contatos com Supabase</span>
          </div>
          <div>
            Campos: Nome, E-mail e Telefone • Integração com Banco PostgreSQL Supabase
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveContact}
        editingContact={editingContact}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onSaveConfig={(newConfig) => {
          setSupabaseConfig(newConfig);
          if (newConfig.isConnected) {
            handleRefreshCloud();
          }
        }}
        localContacts={contacts}
        onContactsSynced={handleRefreshCloud}
      />

      <ContactDetailModal
        contact={selectedContactDetail}
        onClose={() => setSelectedContactDetail(null)}
        onEdit={(c) => {
          setEditingContact(c);
          setIsFormModalOpen(true);
        }}
        onDelete={(id) => setDeletingContactId(id)}
        onToggleFavorite={handleToggleFavorite}
        onCopyText={handleCopyText}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingContactId)}
        title="Excluir Contato?"
        message="Esta ação irá remover o contato permanentemente do seu banco de dados."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingContactId(null)}
        isDanger={true}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
