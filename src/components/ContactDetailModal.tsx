import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, MessageSquare, Star, Edit2, Trash2, Calendar, FileText, Tag, Copy, ExternalLink } from 'lucide-react';
import { Contact } from '../types';
import { getInitials, getAvatarColor, cleanPhoneDigits } from '../utils/formatters';

interface ContactDetailModalProps {
  contact: Contact | null;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (contact: Contact) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopyText,
}) => {
  if (!contact) return null;

  const avatarBg = getAvatarColor(contact.name);
  const initials = getInitials(contact.name);
  const cleanPhone = cleanPhoneDigits(contact.phone);

  const categoryBadges = {
    Pessoal: 'bg-blue-50 border-blue-200 text-blue-700',
    Trabalho: 'bg-purple-50 border-purple-200 text-purple-700',
    Família: 'bg-rose-50 border-rose-200 text-rose-700',
    Outro: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-800"
        >
          {/* Header Banner */}
          <div className="relative h-28 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 border-b border-indigo-200 p-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-xl bg-black/20 backdrop-blur-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Card Body */}
          <div className="px-6 pb-6 pt-0 relative">
            {/* Avatar & Basic Info Header */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl border-4 border-white shadow-md ${avatarBg}`}
              >
                {initials}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleFavorite(contact)}
                  className={`p-2 rounded-xl border transition-colors ${
                    contact.favorite
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Star className={`w-4 h-4 ${contact.favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(contact);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider border border-indigo-500 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>

            {/* Title & Badge */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight mb-1">{contact.name}</h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                  categoryBadges[contact.category || 'Pessoal']
                }`}
              >
                <Tag className="w-3 h-3" />
                {contact.category || 'Pessoal'}
              </span>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {contact.phone && cleanPhone ? (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center gap-2 text-xs italic">
                  Sem WhatsApp
                </div>
              )}

              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-800 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Enviar E-mail</span>
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center gap-2 text-xs italic">
                  Sem E-mail
                </div>
              )}
            </div>

            {/* Detailed Info List */}
            <div className="space-y-3 text-xs mb-6">
              {/* E-mail row */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">E-mail</div>
                    <div className="text-slate-800 font-medium">
                      {contact.email || 'Não informado'}
                    </div>
                  </div>
                </div>
                {contact.email && (
                  <button
                    onClick={() => onCopyText(contact.email, 'E-mail')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Phone row */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Telefone</div>
                    <div className="text-slate-800 font-mono font-semibold">
                      {contact.phone || 'Não informado'}
                    </div>
                  </div>
                </div>
                {contact.phone && (
                  <button
                    onClick={() => onCopyText(contact.phone, 'Telefone')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Notes row */}
              {contact.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Observações / Notas</span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium px-1 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Cadastrado em {new Date(contact.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Bottom Delete button */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  onClose();
                  onDelete(contact.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Contato</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
