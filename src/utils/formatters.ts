import { Contact } from '../types';

/**
 * Formats phone string into Brazilian standard (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Gets clean digits for WhatsApp URL or tel link
 */
export function cleanPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`; // Add Brazil country code if missing
  }
  return digits;
}

/**
 * Extracts initials from contact name (e.g., "Maria Silva" -> "MS")
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates a consistent background color class for avatars based on name
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-emerald-500 text-white',
    'bg-blue-500 text-white',
    'bg-indigo-500 text-white',
    'bg-violet-500 text-white',
    'bg-purple-500 text-white',
    'bg-rose-500 text-white',
    'bg-amber-500 text-white',
    'bg-teal-500 text-white',
    'bg-cyan-500 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Exports contacts to CSV file download
 */
export function exportToCSV(contacts: Contact[]) {
  const headers = ['Nome', 'Email', 'Telefone', 'Categoria', 'Favorito', 'Notas', 'Criado_em'];
  const rows = contacts.map(c => [
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${c.category || 'Pessoal'}"`,
    c.favorite ? 'Sim' : 'Não',
    `"${(c.notes || '').replace(/"/g, '""')}"`,
    `"${c.created_at || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `contatos_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports contacts to JSON file download
 */
export function exportToJSON(contacts: Contact[]) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(contacts, null, 2)
  )}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `contatos_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
