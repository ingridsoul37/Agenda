import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Tag, Star, FileText, Check, Loader2 } from 'lucide-react';
import { Contact, ContactCategory } from '../types';
import { formatPhoneNumber } from '../utils/formatters';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'created_at'> | Contact) => Promise<void>;
  editingContact: Contact | null;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingContact,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Pessoal');
  const [favorite, setFavorite] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setEmail(editingContact.email || '');
      setPhone(editingContact.phone || '');
      setCategory(editingContact.category || 'Pessoal');
      setFavorite(editingContact.favorite || false);
      setNotes(editingContact.notes || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCategory('Pessoal');
      setFavorite(false);
      setNotes('');
    }
    setErrors({});
  }, [editingContact, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'O nome do contato é obrigatório.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Por favor, insira um e-mail válido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (editingContact) {
        await onSave({
          ...editingContact,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          category,
          favorite,
          notes: notes.trim(),
        });
      } else {
        await onSave({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          category,
          favorite,
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: ContactCategory[] = ['Pessoal', 'Trabalho', 'Família', 'Outro'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome Completo <span className="text-indigo-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="ex: Maria das Dores"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.name
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 font-medium mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Endereço de E-mail
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="ex: maria@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.email
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 font-medium mt-1">{errors.email}</p>}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-mono font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Category & Favorite Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Tag className="w-4 h-4" />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ContactCategory)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Favorito Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destacar / Favorito
                </label>
                <button
                  type="button"
                  onClick={() => setFavorite(!favorite)}
                  className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    favorite
                      ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Star className={`w-4 h-4 ${favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                  <span>{favorite ? 'Favorito' : 'Marcar como Favorito'}</span>
                </button>
              </div>
            </div>

            {/* Notas / Observações */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notas / Observações
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  placeholder="Anotações sobre este contato..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{editingContact ? 'Salvar Alterações' : 'Adicionar Contato'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
