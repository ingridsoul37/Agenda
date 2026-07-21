import React from 'react';
import { Star, Mail, Phone, MessageSquare, Copy, Edit2, Trash2, Tag, Calendar } from 'lucide-react';
import { Contact } from '../types';
import { getInitials, getAvatarColor, cleanPhoneDigits } from '../utils/formatters';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (contact: Contact) => void;
  onSelectContact: (contact: Contact) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectContact,
  onCopyText,
}) => {
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
    <div className="group relative bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between hover:shadow-md">
      <div>
        {/* Top Header: Avatar + Name + Favorite Button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={() => onSelectContact(contact)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs shrink-0 cursor-pointer ${avatarBg}`}
            >
              {initials}
            </div>
            <div className="min-w-0 cursor-pointer" onClick={() => onSelectContact(contact)}>
              <h3 className="text-base font-bold text-slate-800 truncate hover:text-indigo-600 transition-colors">
                {contact.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border mt-1 ${
                  categoryBadges[contact.category || 'Pessoal']
                }`}
              >
                <Tag className="w-3 h-3" />
                {contact.category || 'Pessoal'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite(contact)}
            title={contact.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`p-1.5 rounded-xl transition-all ${
              contact.favorite
                ? 'bg-amber-50 text-amber-500 border border-amber-200'
                : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-4 h-4 ${contact.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>

        {/* Contact Details List */}
        <div className="space-y-2.5 text-xs text-slate-600 mb-4">
          {/* Email */}
          {contact.email ? (
            <div className="flex items-center justify-between group/item p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="truncate text-slate-700 font-medium hover:text-indigo-600 transition-colors"
                >
                  {contact.email}
                </a>
              </div>
              <button
                onClick={() => onCopyText(contact.email, 'E-mail')}
                title="Copiar e-mail"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 italic">
              Sem e-mail cadastrado
            </div>
          )}

          {/* Phone */}
          {contact.phone ? (
            <div className="flex items-center justify-between group/item p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <a
                  href={`tel:${contact.phone}`}
                  className="truncate text-slate-700 font-semibold font-mono hover:text-indigo-600 transition-colors"
                >
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-1">
                {cleanPhone && (
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir no WhatsApp"
                    className="p-1 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => onCopyText(contact.phone, 'Telefone')}
                  title="Copiar telefone"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 opacity-0 group-hover/item:opacity-100 transition-opacity"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 italic">
              Sem telefone cadastrado
            </div>
          )}

          {/* Notes preview if exists */}
          {contact.notes && (
            <p className="text-[11px] text-slate-500 line-clamp-2 px-1 pt-1 italic">
              "{contact.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Footer Quick Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(contact.created_at).toLocaleDateString('pt-BR')}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(contact)}
            title="Editar contato"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            title="Excluir contato"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
