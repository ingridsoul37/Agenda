import React from 'react';
import { Database, UserPlus, CloudCheck, CloudOff, RefreshCw, Download, Upload } from 'lucide-react';
import { SupabaseConfig } from '../types';

interface NavbarProps {
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onOpenAddModal: () => void;
  onSyncCloud: () => void;
  isSyncing: boolean;
  onExportCSV: () => void;
  onImportClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  supabaseConfig,
  onOpenSupabaseModal,
  onOpenAddModal,
  onSyncCloud,
  isSyncing,
  onExportCSV,
  onImportClick,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 px-4 lg:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 text-white shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">
                ContactFlow
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                Supabase
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Gerenciador de Contatos na Nuvem
            </p>
          </div>
        </div>

        {/* Controls & Connection Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Connection Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              supabaseConfig.isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {supabaseConfig.isConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <CloudCheck className="w-4 h-4 text-emerald-600" />
                <span className="uppercase text-[10px] tracking-wider font-bold">Supabase Conectado</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-amber-600" />
                <span className="uppercase text-[10px] tracking-wider font-bold">Modo Local (Configurar)</span>
              </>
            )}
          </button>

          {/* Sync Button if connected */}
          {supabaseConfig.isConnected && (
            <button
              onClick={onSyncCloud}
              disabled={isSyncing}
              title="Recarregar do Supabase"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}

          {/* Export / Import Dropdown or Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={onExportCSV}
              title="Exportar para CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar</span>
            </button>
            <button
              onClick={onImportClick}
              title="Importar de arquivo CSV/JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar</span>
            </button>
          </div>

          {/* Add Contact Primary Action */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-100 transition-all transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Contato</span>
          </button>
        </div>
      </div>
    </header>
  );
};
