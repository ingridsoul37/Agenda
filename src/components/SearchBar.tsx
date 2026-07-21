import React from 'react';
import { Search, Filter, LayoutGrid, List, ArrowUpDown, X, Star } from 'lucide-react';
import { ContactCategory, ViewMode } from '../types';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  sortBy: 'name-asc' | 'name-desc' | 'recent';
  onSortChange: (sort: 'name-asc' | 'name-desc' | 'recent') => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFiltered: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
}) => {
  const categories: { label: string; value: string }[] = [
    { label: 'Todos', value: 'all' },
    { label: '★ Favoritos', value: 'favorites' },
    { label: 'Pessoal', value: 'Pessoal' },
    { label: 'Trabalho', value: 'Trabalho' },
    { label: 'Família', value: 'Família' },
    { label: 'Outro', value: 'Outro' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400 font-medium transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select + View Toggle */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          {/* Order dropdown */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="pl-8 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white appearance-none cursor-pointer transition-all"
            >
              <option value="name-asc">Nome (A - Z)</option>
              <option value="name-desc">Nome (Z - A)</option>
              <option value="recent">Mais Recentes</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Visualização em Grade"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              title="Visualização em Tabela"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 no-scrollbar">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all border text-xs ${
              selectedCategory === cat.value
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}

        <span className="ml-auto text-slate-400 text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap shrink-0">
          {totalFiltered} contato(s)
        </span>
      </div>
    </div>
  );
};
