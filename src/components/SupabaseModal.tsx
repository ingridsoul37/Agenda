import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Check, Copy, AlertCircle, Eye, EyeOff, Terminal, Zap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { SupabaseConfig, Contact } from '../types';
import { SUPABASE_SQL_SCRIPT, testConnection, saveSupabaseConfig, pushLocalToSupabase } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSaveConfig: (newConfig: SupabaseConfig) => void;
  localContacts: Contact[];
  onContactsSynced: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  localContacts,
  onContactsSynced,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [tableName, setTableName] = useState(config.tableName || 'contacts');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const targetConfig: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'contacts',
      isConnected: false,
    };

    const res = await testConnection(targetConfig);
    setIsTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: 'Conexão estabelecida com sucesso! A tabela está pronta para uso.',
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Não foi possível conectar ao Supabase.',
      });
    }
  };

  const handleSave = async () => {
    setIsTesting(true);
    const targetConfig: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'contacts',
      isConnected: false,
    };

    if (targetConfig.url && targetConfig.anonKey) {
      const res = await testConnection(targetConfig);
      targetConfig.isConnected = res.success;
      if (!res.success) {
        setTestResult({
          success: false,
          message: `Salvo com avisos: ${res.error}`,
        });
      }
    }

    saveSupabaseConfig(targetConfig);
    onSaveConfig(targetConfig);
    setIsTesting(false);
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handlePushLocal = async () => {
    if (!url || !anonKey) {
      setSyncMessage('Configure a URL e a Chave Anônima antes de sincronizar.');
      return;
    }

    setIsSyncingLocal(true);
    setSyncMessage(null);

    const targetConfig: SupabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'contacts',
      isConnected: true,
    };

    const res = await pushLocalToSupabase(localContacts, targetConfig);
    setIsSyncingLocal(false);

    if (res.error) {
      setSyncMessage(`Erro ao sincronizar: ${res.error}`);
    } else {
      setSyncMessage(`Sucesso! ${res.syncedCount} contatos enviados para o Supabase.`);
      onContactsSynced();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Configurar Conexão Supabase</h3>
                <p className="text-xs font-semibold text-slate-400">Conecte sua tabela 'contacts' para salvar contatos na nuvem</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
            <button
              onClick={() => setActiveTab('config')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'config'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Credenciais da API
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'sql'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Script SQL de Criação de Tabela
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {activeTab === 'config' ? (
              <>
                {/* Status Callout */}
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-medium ${
                    config.isConnected
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold uppercase tracking-wider block mb-0.5 text-[11px]">
                      {config.isConnected ? 'Status: Conectado e ativo' : 'Status: Usando Armazenamento Local'}
                    </strong>
                    {config.isConnected
                      ? 'Seus contatos estão sendo gravados e sincronizados na sua tabela Supabase.'
                      : 'Preencha as credenciais do seu projeto Supabase abaixo para salvar na nuvem.'}
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      URL do Projeto Supabase (Project URL) <span className="text-indigo-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyzxyz.supabase.co"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Encontre no painel do Supabase em: Project Settings &gt; API &gt; Project URL
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Chave Anônima Pública (anon / public key) <span className="text-indigo-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={anonKey}
                        onChange={(e) => setAnonKey(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-mono text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nome da Tabela
                    </label>
                    <input
                      type="text"
                      placeholder="contacts"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {/* Test Connection Button & Result */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !url || !anonKey}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Database className="w-4 h-4 text-indigo-600" />}
                    <span>Testar Conexão com a Tabela</span>
                  </button>

                  {testResult && (
                    <div
                      className={`mt-3 p-3.5 rounded-xl text-xs font-medium border flex items-start gap-2 ${
                        testResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {testResult.success ? (
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      )}
                      <div>{testResult.message}</div>
                    </div>
                  )}
                </div>

                {/* Local Contacts Sync Banner */}
                {localContacts.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <strong className="text-slate-800 block font-bold uppercase tracking-wider text-[11px]">Sincronizar dados locais</strong>
                      <span className="text-slate-500 font-medium">
                        Você possui {localContacts.length} contato(s) salvo(s) localmente neste navegador.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePushLocal}
                      disabled={isSyncingLocal || !url || !anonKey}
                      className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50 shadow-xs"
                    >
                      {isSyncingLocal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      Enviar para Supabase
                    </button>
                  </div>
                )}
                {syncMessage && (
                  <p className="text-xs text-amber-800 font-medium bg-amber-50 p-3 rounded-xl border border-amber-200">
                    {syncMessage}
                  </p>
                )}
              </>
            ) : (
              /* SQL Script Tab */
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Copie o código SQL abaixo e cole no <strong>SQL Editor</strong> dentro do seu projeto Supabase para criar a estrutura exata da tabela <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 border border-slate-200 font-mono font-bold">contacts</code> e liberar as permissões de acesso:
                </p>

                <div className="relative">
                  <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
                    {SUPABASE_SQL_SCRIPT}
                  </pre>
                  <button
                    onClick={handleCopySql}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-slate-700 shadow-md transition-colors"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Copiar SQL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-md shadow-indigo-100"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Salvar Configuração</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
