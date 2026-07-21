import React from 'react';
import { Star, Mail, Phone, MessageSquare, Edit2, Trash2, Tag, Copy } from 'lucide-react';
import { Contact } from '../types';
import { getInitials, getAvatarColor, cleanPhoneDigits } from '../utils/formatters';

interface ContactTableProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (contact: Contact) => void;
  onSelectContact: (contact: Contact) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ContactTable: React.FC<ContactTableProps> = ({
  contacts,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectContact,
  onCopyText,
}) => {
  const categoryBadges = {
    Pessoal: 'bg-blue-50 border-blue-200 text-blue-700',
    Trabalho: 'bg-purple-50 border-purple-200 text-purple-700',
    Família: 'bg-rose-50 border-rose-200 text-rose-700',
    Outro: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-400 uppercase tracking-widest font-bold">
            <tr>
              <th className="py-3.5 px-4 w-10 text-center">★</th>
              <th className="py-3.5 px-4">Nome</th>
              <th className="py-3.5 px-4">E-mail</th>
              <th className="py-3.5 px-4">Telefone</th>
              <th className="py-3.5 px-4">Categoria</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((contact) => {
              const avatarBg = getAvatarColor(contact.name);
              const initials = getInitials(contact.name);
              const cleanPhone = cleanPhoneDigits(contact.phone);

              return (
                <tr
                  key={contact.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Favorite */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleFavorite(contact)}
                      className={`p-1 rounded-lg transition-colors ${
                        contact.favorite
                          ? 'text-amber-500'
                          : 'text-slate-300 hover:text-amber-500'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${contact.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </td>

                  {/* Name + Avatar */}
                  <td className="py-3.5 px-4">
                    <div
                      onClick={() => onSelectContact(contact)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${avatarBg}`}
                      >
                        {initials}
                      </div>
                      <div className="font-bold text-slate-800 hover:text-indigo-600 transition-colors">
                        {contact.name}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4">
                    {contact.email ? (
                      <div className="flex items-center gap-2 group/item">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:text-indigo-600 transition-colors font-medium truncate max-w-[200px]"
                        >
                          {contact.email}
                        </a>
                        <button
                          onClick={() => onCopyText(contact.email, 'E-mail')}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">-</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 font-mono text-xs">
                    {contact.phone ? (
                      <div className="flex items-center gap-2 group/item">
                        <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <a href={`tel:${contact.phone}`} className="hover:text-indigo-600 font-semibold transition-colors">
                          {contact.phone}
                        </a>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onCopyText(contact.phone, 'Telefone')}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">-</span>
                    )}
                  </td>

                  {/* Categoria */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        categoryBadges[contact.category || 'Pessoal']
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {contact.category || 'Pessoal'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(contact)}
                        title="Editar"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(contact.id)}
                        title="Excluir"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
