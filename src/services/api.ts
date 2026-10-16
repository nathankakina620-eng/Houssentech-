import { Customer, CustomerStatus, CustomerLocation, Order, ChatMessage, StoreSettings, Product } from '../types';

export interface SyncResponse {
  customers: Customer[];
  orders: Order[];
  chatMessages: ChatMessage[];
  settings: StoreSettings;
  products: Product[];
  notifications: Array<{
    id: string;
    type: 'customer' | 'order' | 'chat';
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    customerId?: string;
    orderId?: string;
  }>;
  lastUpdated: string;
}

const API_BASE = '/api';

export const api = {
  // 1. Récupération complète et synchronisation
  async sync(): Promise<SyncResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[API Sync] Serveur non joignable ou mode hors-ligne, utilisation du cache local:', err);
      return null;
    }
  },

  // 2. Inscription d'un nouveau client (depuis n'importe quel téléphone)
  async registerCustomer(customerData: {
    fullName: string;
    phone: string;
    city?: string;
    address?: string;
    validationCode?: string;
    notes?: string;
  }): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erreur lors de l\'inscription' };
      }
      return data;
    } catch (err) {
      console.error('[API registerCustomer] Erreur réseau:', err);
      return { success: false, error: 'Connexion au serveur impossible' };
    }
  },

  // 3. Validation ou modification du statut d'un client par l'administrateur
  async updateCustomer(
    customerId: string,
    updates: {
      status?: CustomerStatus;
      isBlocked?: boolean;
      blockedReason?: string;
      notes?: string;
      fullName?: string;
      phone?: string;
      city?: string;
      address?: string;
      avatar?: string;
      location?: import('../types').CustomerLocation;
    }
  ): Promise<{ success: boolean; customer?: Customer }> {
    try {
      const res = await fetch(`${API_BASE}/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      console.error('[API updateCustomer] Erreur:', err);
      return { success: false };
    }
  },

  // 4. Suppression d'un client
  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/customers/${customerId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.error('[API deleteCustomer] Erreur:', err);
      return false;
    }
  },

  // 5. Création d'une commande
  async createOrder(order: Partial<Order>): Promise<{ success: boolean; order?: Order }> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      return await res.json();
    } catch (err) {
      console.error('[API createOrder] Erreur:', err);
      return { success: false };
    }
  },

  // 6. Mise à jour de commande (Acceptée, Refusée, Acompte validé, Étape du suivi)
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<{ success: boolean; order?: Order }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      console.error('[API updateOrder] Erreur:', err);
      return { success: false };
    }
  },

  // 7. Envoi de message ou de photo dans la messagerie
  async sendChatMessage(msg: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    sender: 'client' | 'admin';
    text: string;
    images?: string[];
    orderId?: string;
  }): Promise<{ success: boolean; message?: ChatMessage }> {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      return await res.json();
    } catch (err) {
      console.error('[API sendChatMessage] Erreur:', err);
      return { success: false };
    }
  },

  // 8. Marquer la conversation comme lue
  async markChatRead(customerId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/chat/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
    } catch (err) {
      console.warn('[API markChatRead] Erreur:', err);
    }
  },

  // 9. Mise à jour des paramètres de l'entreprise
  async updateSettings(settings: Partial<StoreSettings>): Promise<{ success: boolean; settings?: StoreSettings }> {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return await res.json();
    } catch (err) {
      console.error('[API updateSettings] Erreur:', err);
      return { success: false };
    }
  },

  // 10. Notifications d'alertes pour l'administrateur
  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API getNotifications] Erreur:', e);
    }
    return [];
  },

  async markNotificationRead(id?: string) {
    try {
      await fetch(`${API_BASE}/notifications/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.warn('[API markNotificationRead] Erreur:', e);
    }
  },
};
