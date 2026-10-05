import { Contact } from '../types';

/**
 * Generates a standard vCard (.vcf) formatted string for a Contact
 */
export function generateVCard(contact: Contact): string {
  const name = contact.conta_name || 'איש קשר';
  const nameParts = name.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : name;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${name}`,
  ];

  if (contact.company_name) {
    lines.push(`ORG:${contact.company_name}`);
  }

  if (contact.job_title) {
    lines.push(`TITLE:${contact.job_title}`);
  }

  if (contact.conta_phone) {
    const cleanPhone = contact.conta_phone.replace(/\D/g, '');
    lines.push(`TEL;TYPE=CELL,VOICE:${contact.conta_phone}`);
  }

  if (contact.work_phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${contact.work_phone}`);
  }

  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${contact.email}`);
  }

  if (contact.mh_crm_city || contact.mh_crm_street) {
    lines.push(`ADR;TYPE=WORK:;;${contact.mh_crm_street || ''};${contact.mh_crm_city || ''};;;Israel`);
  }

  if (contact.website) {
    lines.push(`URL:${contact.website}`);
  }

  if (contact.notes) {
    lines.push(`NOTE:${contact.notes.replace(/\n/g, '\\n')}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Triggers native download of a .vcf file in the browser or mobile webview
 */
export function downloadVCard(contact: Contact): void {
  const vcardText = generateVCard(contact);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `${(contact.conta_name || 'contact').replace(/\s+/g, '_')}.vcf`;
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
