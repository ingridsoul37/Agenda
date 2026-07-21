import React from 'react';
import { Users, Star, Database, Tag } from 'lucide-react';
import { Contact, SupabaseConfig } from '../types';

interface StatsBarProps {
  contacts: Contact[];
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  activeCategory: string;
  onSelectCategoryFilter: (category: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  contacts,
  supabaseConfig,
  onOpenSupabaseModal,
  activeCategory,
  onSelectCategoryFilter,
}) => {
  const total = contacts.length;
  const favoritesCount = contacts.filter((c) => c.favorite).length;

  const categoriesCount = contacts.reduce((acc, c) => {
    const cat = c.category || 'Pessoal';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {/* Total Contatos */}
      <div
        onClick={() => onSelectCategoryFilter('all')}
        className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
          activeCategory === 'all'
            ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total de Contatos</span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-800">{total}</div>
        <span className="text-[11px] text-slate-500 font-medium">Cadastrados no sistema</span>
      </div>

      {/* Favoritos */}
      <div
        onClick={() => onSelectCategoryFilter('favorites')}
        className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
          activeCategory === 'favorites'
            ? 'bg-white border-amber-500 ring-2 ring-amber-500/10 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Favoritos</span>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-800">{favoritesCount}</div>
        <span className="text-[11px] text-slate-500 font-medium">Acesso rápido</span>
      </div>

      {/* Trabalho */}
      <div
        onClick={() => onSelectCategoryFilter('Trabalho')}
        className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
          activeCategory === 'Trabalho'
            ? 'bg-white border-purple-500 ring-2 ring-purple-500/10 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trabalho</span>
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-800">{categoriesCount['Trabalho'] || 0}</div>
        <span className="text-[11px] text-slate-500 font-medium">Contatos profissionais</span>
      </div>

      {/* Supabase Cloud Status */}
      <div
        onClick={onOpenSupabaseModal}
        className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
          supabaseConfig.isConnected
            ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
            : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Armazenamento</span>
          <div
            className={`p-2 rounded-xl ${
              supabaseConfig.isConnected
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Database className="w-4 h-4" />
          </div>
        </div>
        <div className="text-sm font-bold text-slate-800 truncate">
          {supabaseConfig.isConnected ? 'Nuvem Supabase' : 'Local (Navegador)'}
        </div>
        <span className="text-[11px] text-emerald-700 font-semibold hover:underline">
          {supabaseConfig.isConnected ? 'Sincronizado' : 'Clique para conectar'}
        </span>
      </div>
    </div>
  );
};
