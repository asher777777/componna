import {
  GreenApiState,
  GreenApiInstanceSettings,
  GreenApiDeviceInfo,
  GreenApiChatMessage,
  GreenApiChat,
  GreenApiGroupData,
  GreenApiQueueItem,
  GreenApiContactInfo,
  GreenApiTextStatusPayload,
  GreenApiMediaStatusPayload,
  GreenApiStatusStatisticItem,
} from '../types';

export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string;
}

export class GreenApiService {
  private host: string;
  private idInstance: string;
  private token: string;

  constructor(creds: GreenApiCredentials) {
    this.idInstance = (creds.idInstance || '').trim();
    this.token = (creds.apiTokenInstance || '').trim();

    // Directly connect to the specific cluster host to prevent 301 gateway redirects that cause CORS / "Failed to fetch" in browsers
    if (creds.apiUrl && !creds.apiUrl.includes('api.green-api.com') && creds.apiUrl.trim().length > 0) {
      this.host = creds.apiUrl.replace(/\/+$/, '');
    } else if (this.idInstance && this.idInstance.length >= 4) {
      const cluster = this.idInstance.slice(0, 4);
      this.host = `https://${cluster}.api.greenapi.com`;
    } else {
      this.host = 'https://api.green-api.com';
    }
  }

  public get baseUrl(): string {
    return `${this.host}/waInstance${this.idInstance}`;
  }

  public isConfigured(): boolean {
    return !!(this.idInstance && this.token);
  }

  private getCandidateHosts(): string[] {
    const list: string[] = [];
    if (this.host) list.push(this.host);
    if (this.idInstance && this.idInstance.length >= 4) {
      list.push(`https://${this.idInstance.slice(0, 4)}.api.greenapi.com`);
    }
    list.push('https://api.green-api.com');
    list.push('https://media.green-api.com');
    return Array.from(new Set(list));
  }

  // --- ACCOUNT & AUTH ---

  public async getStateInstance(): Promise<{ stateInstance: GreenApiState; raw?: any }> {
    if (!this.isConfigured()) return { stateInstance: 'notAuthorized' };
    const hosts = this.getCandidateHosts();
    let lastError = '';

    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/getStateInstance/${this.token}`);
        if (res.ok) {
          const data = await res.json();
          this.host = h; // save working host
          return { stateInstance: data.stateInstance || 'unknown', raw: data };
        }
      } catch (e: any) {
        lastError = e.message;
      }
    }
    return { stateInstance: 'notAuthorized', raw: { error: lastError } };
  }

  public async getSettings(): Promise<GreenApiInstanceSettings | null> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${this.baseUrl}/getSettings/${this.token}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Error fetching settings:', e);
      return null;
    }
  }

  public async setSettings(settings: GreenApiInstanceSettings): Promise<{ saveStatus?: boolean; error?: string }> {
    if (!this.isConfigured()) return { error: 'חסרים פרטי התחברות ל-Green-API' };
    try {
      const res = await fetch(`${this.baseUrl}/setSettings/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (e: any) {
      return { error: e.message || 'שגיאה בעדכון הגדרות' };
    }
  }

  public async getQrCode(): Promise<{ type: string; message: string }> {
    if (!this.isConfigured()) throw new Error('חסרים פרטי התחברות (Instance ID / Token) ל-Green-API');
    const hosts = this.getCandidateHosts();
    let lastError: any = null;

    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/qr/${this.token}`);
        if (res.ok) {
          this.host = h;
          return await res.json();
        }
      } catch (e) {
        lastError = e;
      }
    }
    throw new Error(lastError?.message || 'שגיאה בטעינת קוד QR מהשרת');
  }

  public async getAuthorizationCode(phoneNumber: string): Promise<{ status: boolean; code?: string; message?: string }> {
    if (!this.isConfigured()) {
      throw new Error('פרטי מופע GREEN-API אינם מוגדרים. יש להזין Instance ID ו-Token ברכיב הסנכרון.');
    }
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 8) {
      throw new Error('מספר טלפון לא תקין. נא להזין מספר בינלאומי מלא.');
    }

    const hosts = this.getCandidateHosts();
    let lastError: any = null;

    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/getAuthorizationCode/${this.token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: Number(cleaned) }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          this.host = h;
          return data;
        } else {
          throw new Error(data.message || `Green-API Error (${res.status})`);
        }
      } catch (e: any) {
        lastError = e;
      }
    }
    throw new Error(lastError?.message || 'שגיאת חיבור לשרת GREEN-API');
  }

  public async sendAuthorizationPassword(password: string): Promise<{ status: boolean; message?: string }> {
    if (!this.isConfigured()) throw new Error('חסרים פרטי התחברות ל-Green-API');
    const hosts = this.getCandidateHosts();
    let lastError: any = null;

    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/sendAuthorizationPassword/${this.token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        if (res.ok) {
          this.host = h;
          return await res.json();
        }
      } catch (e) {
        lastError = e;
      }
    }
    throw new Error(lastError?.message || 'שגיאה באימות סיסמת 2FA');
  }

  public async logout(): Promise<{ isLogout?: boolean }> {
    if (!this.isConfigured()) return { isLogout: false };
    const res = await fetch(`${this.baseUrl}/logout/${this.token}`, { method: 'GET' });
    return await res.json().catch(() => ({ isLogout: res.ok }));
  }

  public async reboot(): Promise<{ isReboot?: boolean }> {
    if (!this.isConfigured()) return { isReboot: false };
    const res = await fetch(`${this.baseUrl}/reboot/${this.token}`, { method: 'GET' });
    return await res.json().catch(() => ({ isReboot: res.ok }));
  }

  public async getDeviceInfo(): Promise<GreenApiDeviceInfo | null> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${this.baseUrl}/getDeviceInfo/${this.token}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // --- SENDING METHODS ---

  public async sendMessage(params: {
    chatId: string;
    message: string;
    quotedMessageId?: string;
    linkPreview?: boolean;
  }): Promise<{ idMessage?: string; error?: string }> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות Green-API' };
    try {
      const res = await fetch(`${this.baseUrl}/sendMessage/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: params.chatId.includes('@') ? params.chatId : `${params.chatId.replace(/\D/g, '')}@c.us`,
          message: params.message,
          quotedMessageId: params.quotedMessageId || undefined,
          linkPreview: params.linkPreview,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e: any) {
      return { error: e.message || 'שגיאה בשליחת הודעה' };
    }
  }

  public async sendButtons(params: {
    chatId: string;
    message: string;
    buttons: Array<{ buttonId: string; buttonText: string }>;
    footer?: string;
    header?: string;
  }): Promise<{ idMessage?: string; error?: string }> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    try {
      const res = await fetch(`${this.baseUrl}/sendButtons/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: params.chatId.includes('@') ? params.chatId : `${params.chatId.replace(/\D/g, '')}@c.us`,
          message: params.message,
          footer: params.footer,
          header: params.header,
          buttons: params.buttons,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  public async sendTemplateButtons(params: {
    chatId: string;
    message: string;
    templateButtons: Array<
      | { index: number; urlButton: { displayText: string; url: string } }
      | { index: number; callButton: { displayText: string; phoneNumber: string } }
      | { index: number; quickReplyButton: { displayText: string; id: string } }
    >;
    footer?: string;
  }): Promise<{ idMessage?: string; error?: string }> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    try {
      const res = await fetch(`${this.baseUrl}/sendTemplateButtons/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: params.chatId.includes('@') ? params.chatId : `${params.chatId.replace(/\D/g, '')}@c.us`,
          message: params.message,
          footer: params.footer,
          templateButtons: params.templateButtons,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  public async sendListMessage(params: {
    chatId: string;
    message: string;
    buttonText: string;
    title: string;
    sections: Array<{
      title: string;
      rows: Array<{ rowId: string; title: string; description?: string }>;
    }>;
    footer?: string;
  }): Promise<{ idMessage?: string; error?: string }> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    try {
      const res = await fetch(`${this.baseUrl}/sendListMessage/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: params.chatId.includes('@') ? params.chatId : `${params.chatId.replace(/\D/g, '')}@c.us`,
          message: params.message,
          buttonText: params.buttonText,
          title: params.title,
          footer: params.footer,
          sections: params.sections,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  public async sendFileByUrl(params: {
    chatId: string;
    urlFile: string;
    fileName: string;
    caption?: string;
    quotedMessageId?: string;
  }): Promise<{ idMessage?: string; error?: string }> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    try {
      const res = await fetch(`${this.baseUrl}/sendFileByUrl/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: params.chatId.includes('@') ? params.chatId : `${params.chatId.replace(/\D/g, '')}@c.us`,
          urlFile: params.urlFile,
          fileName: params.fileName,
          caption: params.caption,
          quotedMessageId: params.quotedMessageId,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  public async sendPoll(params: {
    chatId: string;
    message: string;
    options: Array<{ optionName: string }>;
    multipleAnswers?: boolean;
  }): Promise<{ idMessage?: string; error?: string }> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    try {
      const res = await fetch(`${this.baseUrl}/sendPoll/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: params.chatId.includes('@') ? params.chatId : `${params.chatId.replace(/\D/g, '')}@c.us`,
          message: params.message,
          options: params.options,
          multipleAnswers: params.multipleAnswers ?? false,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  public async sendLocation(params: {
    chatId: string;
    latitude: number;
    longitude: number;
    nameLocation?: string;
    address?: string;
  }): Promise<{ idMessage?: string; error?: string }> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    try {
      const res = await fetch(`${this.baseUrl}/sendLocation/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: params.chatId.includes('@') ? params.chatId : `${params.chatId.replace(/\D/g, '')}@c.us`,
          latitude: params.latitude,
          longitude: params.longitude,
          nameLocation: params.nameLocation,
          address: params.address,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  public async sendContact(params: {
    chatId: string;
    contact: {
      phoneContact: number;
      firstName: string;
      lastName?: string;
      company?: string;
    };
  }): Promise<{ idMessage?: string; error?: string }> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    try {
      const res = await fetch(`${this.baseUrl}/sendContact/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: params.chatId.includes('@') ? params.chatId : `${params.chatId.replace(/\D/g, '')}@c.us`,
          contact: params.contact,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  public async forwardMessages(params: {
    chatId: string;
    chatIdFrom: string;
    messages: string[];
  }): Promise<any> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    try {
      const res = await fetch(`${this.baseUrl}/forwardMessages/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  // --- CHATS & JOURNALS ---

  public async getContacts(): Promise<any[]> {
    if (!this.isConfigured()) return [];
    const hosts = this.getCandidateHosts();
    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/getContacts/${this.token}`);
        if (res.ok) {
          this.host = h;
          const data = await res.json();
          if (Array.isArray(data)) return data;
        }
      } catch (e) {
        console.warn('getContacts error on host:', h, e);
      }
    }
    return [];
  }

  private async fetchRawChats(): Promise<any[]> {
    if (!this.isConfigured()) return [];
    const hosts = this.getCandidateHosts();
    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/getChats/${this.token}`);
        if (res.ok) {
          this.host = h;
          const list = await res.json();
          if (Array.isArray(list)) return list;
        }
      } catch (e) {
        console.warn('fetchRawChats error on host:', h, e);
      }
    }
    return [];
  }

  public async getChats(): Promise<GreenApiChat[]> {
    if (!this.isConfigured()) return [];

    // Fetch both full phonebook contacts and active chats in parallel
    const [rawContacts, rawChats] = await Promise.all([
      this.getContacts().catch(() => []),
      this.fetchRawChats().catch(() => []),
    ]);

    const chatMap = new Map<string, GreenApiChat>();

    // 1. Populate all phonebook contacts and groups
    if (Array.isArray(rawContacts)) {
      rawContacts.forEach((c: any) => {
        if (!c || !c.id) return;
        const id = String(c.id);
        const isGroup = id.endsWith('@g.us') || c.type === 'group';
        const cleanName = c.name || c.contactName || id.split('@')[0];
        chatMap.set(id, {
          id,
          name: cleanName,
          contactName: c.contactName,
          isGroup,
          unreadCount: 0,
          lastMessage: isGroup ? 'קבוצת WhatsApp' : 'איש קשר שמור',
          timestamp: 0,
        });
      });
    }

    // 2. Merge active chats with latest messages and unread count
    if (Array.isArray(rawChats)) {
      const now = Date.now();
      rawChats.forEach((c: any, index: number) => {
        if (!c || !c.id) return;
        const id = String(c.id);
        const isGroup = id.endsWith('@g.us');
        const existing = chatMap.get(id);

        let ts = 0;
        if (c.timestamp && typeof c.timestamp === 'number' && c.timestamp > 0) {
          ts = c.timestamp < 10000000000 ? c.timestamp * 1000 : c.timestamp;
        } else {
          // If WhatsApp did not supply timestamp, keep recency order from rawChats
          ts = now - (index * 60000);
        }

        const cleanName = c.name || c.contactName || existing?.name || id.split('@')[0];
        const lastMsg = c.lastMessage || c.message || c.textMessage || (existing?.lastMessage !== 'איש קשר שמור' ? existing?.lastMessage : '') || '';

        if (existing) {
          existing.name = cleanName;
          if (c.contactName) existing.contactName = c.contactName;
          existing.unreadCount = c.unreadCount || 0;
          if (lastMsg) existing.lastMessage = lastMsg;
          existing.timestamp = ts;
        } else {
          chatMap.set(id, {
            id,
            name: cleanName,
            contactName: c.contactName,
            unreadCount: c.unreadCount || 0,
            lastMessage: lastMsg || (isGroup ? 'קבוצת WhatsApp' : 'שיחת WhatsApp'),
            timestamp: ts,
            isGroup,
          });
        }
      });
    }

    // 3. Sort: Recent active conversations (timestamp > 0) first in descending order, then remaining contacts
    const result = Array.from(chatMap.values());
    result.sort((a, b) => {
      const aTs = a.timestamp || 0;
      const bTs = b.timestamp || 0;
      if (aTs > 0 || bTs > 0) {
        if (aTs !== bTs) {
          return bTs - aTs;
        }
      }
      return (a.name || '').localeCompare(b.name || '', 'he');
    });

    return result;
  }

  public async getChatHistory(chatId: string, count: number = 50): Promise<GreenApiChatMessage[]> {
    if (!this.isConfigured() || !chatId) return [];
    const hosts = this.getCandidateHosts();

    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/getChatHistory/${this.token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, count }),
        });
        if (res.ok) {
          this.host = h;
          const data: any[] = await res.json();
          return (data || []).map((m) => ({
            idMessage: m.idMessage,
            chatId: m.chatId,
            type: m.type,
            textMessage: m.textMessage || (m.caption ? `${m.caption} [קובץ]` : (m.downloadUrl ? '[מדיה/קובץ]' : '')),
            timestamp: m.timestamp || Math.floor(Date.now() / 1000),
            downloadUrl: m.downloadUrl,
            caption: m.caption,
            fileName: m.fileName,
            senderId: m.senderId,
            senderName: m.senderName,
            statusMessage: m.statusMessage,
          }));
        }
      } catch (e) {
        console.warn('getChatHistory error on host:', h, e);
      }
    }
    return [];
  }

  public async setMessageReaction(chatId: string, idMessage: string, reaction: string): Promise<any> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    const res = await fetch(`${this.baseUrl}/setMessageReaction/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, idMessage, reaction }),
    });
    return await res.json().catch(() => ({ success: res.ok }));
  }

  public async deleteMessage(chatId: string, idMessage: string): Promise<any> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    const res = await fetch(`${this.baseUrl}/deleteMessage/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, idMessage }),
    });
    return await res.json().catch(() => ({ success: res.ok }));
  }

  public async editMessage(chatId: string, idMessage: string, message: string): Promise<any> {
    if (!this.isConfigured()) return { error: 'לא הוגדרו מפתחות' };
    const res = await fetch(`${this.baseUrl}/editMessage/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, idMessage, message }),
    });
    return await res.json().catch(() => ({ success: res.ok }));
  }

  public async readChat(chatId: string, idMessage?: string): Promise<any> {
    if (!this.isConfigured()) return;
    return await fetch(`${this.baseUrl}/readChat/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, idMessage }),
    });
  }

  // --- GROUPS ---

  public async createGroup(groupName: string, chatIds: string[]): Promise<{ created?: boolean; chatId?: string }> {
    if (!this.isConfigured()) throw new Error('לא הוגדרו מפתחות');
    const res = await fetch(`${this.baseUrl}/createGroup/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupName, chatIds }),
    });
    return await res.json();
  }

  public async getGroupData(groupId: string): Promise<GreenApiGroupData | null> {
    if (!this.isConfigured() || !groupId) return null;
    try {
      const res = await fetch(`${this.baseUrl}/getGroupData/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async updateGroupName(groupId: string, groupName: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/updateGroupName/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, groupName }),
    });
    return await res.json();
  }

  public async addGroupParticipant(groupId: string, participantChatId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/addGroupParticipant/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, participantChatId }),
    });
    return await res.json();
  }

  public async removeGroupParticipant(groupId: string, participantChatId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/removeGroupParticipant/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, participantChatId }),
    });
    return await res.json();
  }

  public async setGroupAdmin(groupId: string, participantChatId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/setGroupAdmin/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, participantChatId }),
    });
    return await res.json();
  }

  public async removeAdmin(groupId: string, participantChatId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/removeAdmin/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, participantChatId }),
    });
    return await res.json();
  }

  public async leaveGroup(groupId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/leaveGroup/${this.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    });
    return await res.json();
  }

  // --- SERVICE & CONTACTS & QUEUES ---

  public async checkWhatsapp(phoneNumber: string): Promise<{ existsWhatsapp: boolean }> {
    if (!this.isConfigured()) return { existsWhatsapp: false };
    try {
      const clean = phoneNumber.replace(/\D/g, '');
      const res = await fetch(`${this.baseUrl}/checkWhatsapp/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: Number(clean) }),
      });
      if (!res.ok) return { existsWhatsapp: false };
      return await res.json();
    } catch {
      return { existsWhatsapp: false };
    }
  }

  public async getContactInfo(chatId: string): Promise<GreenApiContactInfo | null> {
    if (!this.isConfigured()) return null;
    try {
      const res = await fetch(`${this.baseUrl}/getContactInfo/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async getAvatar(chatId: string): Promise<{ urlAvatar?: string; existsWhatsapp?: boolean }> {
    if (!this.isConfigured()) return {};
    try {
      const res = await fetch(`${this.baseUrl}/getAvatar/${this.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  }

  public async showMessagesQueue(): Promise<GreenApiQueueItem[]> {
    if (!this.isConfigured()) return [];
    try {
      const res = await fetch(`${this.baseUrl}/showMessagesQueue/${this.token}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async clearMessagesQueue(): Promise<{ isCleared?: boolean }> {
    if (!this.isConfigured()) return { isCleared: false };
    const res = await fetch(`${this.baseUrl}/clearMessagesQueue/${this.token}`, { method: 'GET' });
    return await res.json().catch(() => ({ isCleared: res.ok }));
  }

  // --- WHATSAPP STATUSES & STORIES API ---

  public async sendTextStatus(payload: GreenApiTextStatusPayload): Promise<{ idMessage: string; [key: string]: any }> {
    if (!this.isConfigured()) throw new Error('Green-API is not configured');
    const hosts = this.getCandidateHosts();

    const body: any = {
      message: payload.message,
    };
    if (payload.backgroundColor) body.backgroundColor = payload.backgroundColor;
    if (payload.font) body.font = payload.font;
    if (payload.participants && payload.participants.length > 0) {
      body.participants = payload.participants;
    }

    let lastError: any = null;
    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/sendTextStatus/${this.token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          this.host = h;
          return await res.json();
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = new Error(errData.message || `HTTP ${res.status}`);
        }
      } catch (e: any) {
        lastError = e;
      }
    }
    throw lastError || new Error('Failed to send text status');
  }

  public async sendMediaStatus(payload: GreenApiMediaStatusPayload): Promise<{ idMessage: string; [key: string]: any }> {
    if (!this.isConfigured()) throw new Error('Green-API is not configured');
    const hosts = this.getCandidateHosts();

    const body: any = {
      urlFile: payload.urlFile,
      fileName: payload.fileName || 'status.jpg',
    };
    if (payload.caption) body.caption = payload.caption;
    if (payload.participants && payload.participants.length > 0) {
      body.participants = payload.participants;
    }

    let lastError: any = null;
    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/sendMediaStatus/${this.token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          this.host = h;
          return await res.json();
        } else {
          const errData = await res.json().catch(() => ({}));
          lastError = new Error(errData.message || `HTTP ${res.status}`);
        }
      } catch (e: any) {
        lastError = e;
      }
    }
    throw lastError || new Error('Failed to send media status');
  }

  public async getStatusStatistic(idMessage: string): Promise<GreenApiStatusStatisticItem[]> {
    if (!this.isConfigured() || !idMessage) return [];
    const hosts = this.getCandidateHosts();

    for (const h of hosts) {
      try {
        const res = await fetch(`${h}/waInstance${this.idInstance}/getStatusStatistic/${this.token}?idMessage=${encodeURIComponent(idMessage)}`, {
          method: 'GET',
        });
        if (res.ok) {
          this.host = h;
          const data = await res.json();
          if (Array.isArray(data)) return data;
        }
      } catch (e) {
        console.warn('getStatusStatistic error on host:', h, e);
      }
    }
    return [];
  }
}
