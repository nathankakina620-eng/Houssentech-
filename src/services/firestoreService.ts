import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Customer, Order, ChatMessage, StoreSettings, Product } from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SETTINGS,
  INITIAL_PRODUCTS,
} from '../data/initialData';

// Collections Firestore
const CUSTOMERS_COL = 'customers';
const ORDERS_COL = 'orders';
const CHAT_COL = 'chatMessages';
const SETTINGS_COL = 'settings';
const PRODUCTS_COL = 'products';

let isSeeding = false;

/**
 * Nettoie récursivement un objet pour Firestore en supprimant toutes les clés 'undefined',
 * car Firestore lève une erreur fatale dès qu'une valeur undefined est présente.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return null as any;
  if (Array.isArray(data)) {
    return data.map((item) => cleanForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    const res: Record<string, any> = {};
    for (const [key, val] of Object.entries(data as Record<string, any>)) {
      if (val !== undefined) {
        res[key] = cleanForFirestore(val);
      }
    }
    return res as any;
  }
  return data;
}

export const firestoreService = {
  // Initialisation et amorçage sécurisé des collections au premier démarrage
  async seedInitialDataIfNeeded() {
    if (isSeeding) return;
    try {
      const customersSnap = await getDocs(collection(db, CUSTOMERS_COL));
      if (customersSnap.empty) {
        isSeeding = true;
        console.log('[Firestore] Amorçage initial des clients, produits et paramètres...');
        
        // 1. Clients initiaux
        for (const cust of INITIAL_CUSTOMERS) {
          await setDoc(doc(db, CUSTOMERS_COL, cust.id), cleanForFirestore(cust));
        }

        // 2. Paramètres initiaux
        await setDoc(doc(db, SETTINGS_COL, 'general'), cleanForFirestore(INITIAL_SETTINGS));

        // 3. Commandes initiales
        for (const ord of INITIAL_ORDERS) {
          await setDoc(doc(db, ORDERS_COL, ord.id), cleanForFirestore(ord));
        }

        // 4. Messages initiaux
        for (const msg of INITIAL_CHAT_MESSAGES) {
          await setDoc(doc(db, CHAT_COL, msg.id), cleanForFirestore(msg));
        }

        // 5. Produits initiaux
        for (const prod of INITIAL_PRODUCTS) {
          await setDoc(doc(db, PRODUCTS_COL, prod.id), cleanForFirestore(prod));
        }

        console.log('[Firestore] Amorçage initial terminé avec succès.');
      }
    } catch (e) {
      console.warn('[Firestore] Note amorçage initial:', e);
    } finally {
      isSeeding = false;
    }
  },

  // 1. Écoute en temps réel des Clients (mise à jour instantanée sur TOUS les téléphones)
  subscribeCustomers(callback: (customers: Customer[]) => void) {
    try {
      return onSnapshot(
        collection(db, CUSTOMERS_COL),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Customer[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Customer;
              list.push({
                ...data,
                id: data.id || d.id,
                status: data.status === 'bloque' || data.isBlocked ? 'bloque' : 'valide',
                isBlocked: data.status === 'bloque' || Boolean(data.isBlocked),
                pendingVerification: false,
              });
            });
            // Trier par date d'inscription la plus récente en haut
            list.sort((a, b) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));
            callback(list);
          }
        },
        (error) => {
          console.warn('[Firestore] Erreur écoute clients:', error);
        }
      );
    } catch (err) {
      console.warn('[Firestore] Impossible de souscrire aux clients:', err);
      return () => {};
    }
  },

  // Récupérer directement la liste synchronisée des clients depuis Firestore
  async getCustomers(): Promise<Customer[]> {
    try {
      const snapshot = await getDocs(collection(db, CUSTOMERS_COL));
      const list: Customer[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Customer;
        list.push({
          ...data,
          id: data.id || d.id,
          status: data.status === 'bloque' || data.isBlocked ? 'bloque' : 'valide',
          isBlocked: data.status === 'bloque' || Boolean(data.isBlocked),
          pendingVerification: false,
        });
      });
      list.sort((a, b) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));
      return list;
    } catch (err) {
      console.warn('[Firestore] Erreur récupération directe clients:', err);
      return [];
    }
  },

  async saveCustomer(customer: Customer): Promise<void> {
    try {
      const cleanCustomer: Customer = {
        ...customer,
        status: customer.status === 'bloque' || customer.isBlocked ? 'bloque' : 'valide',
        isBlocked: customer.status === 'bloque' || Boolean(customer.isBlocked),
        pendingVerification: false,
      };
      await setDoc(doc(db, CUSTOMERS_COL, cleanCustomer.id), cleanForFirestore(cleanCustomer), { merge: true });
      console.log(`[Firestore] Client ${cleanCustomer.fullName} (${cleanCustomer.phone}) sauvegardé dans Firestore.`);
    } catch (err) {
      console.error('[Firestore] Erreur sauvegarde client:', err);
      throw err;
    }
  },

  // Mettre à jour un client (avatar, localisation map, statut, blocage)
  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<void> {
    try {
      await setDoc(doc(db, CUSTOMERS_COL, customerId), cleanForFirestore(updates), { merge: true });
      console.log(`[Firestore] Client ${customerId} mis à jour dans Firestore.`);
    } catch (err) {
      console.error('[Firestore] Erreur update client:', err);
      throw err;
    }
  },

  // Supprimer définitivement un client
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, CUSTOMERS_COL, customerId));
      console.log(`[Firestore] Client ${customerId} supprimé de Firestore.`);
    } catch (err) {
      console.error('[Firestore] Erreur suppression client:', err);
      throw err;
    }
  },

  // 2. Écoute en temps réel des Commandes
  subscribeOrders(callback: (orders: Order[]) => void) {
    try {
      return onSnapshot(
        collection(db, ORDERS_COL),
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as Order);
          });
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          callback(list);
        },
        (error) => {
          console.warn('[Firestore] Erreur écoute commandes:', error);
        }
      );
    } catch (err) {
      console.warn('[Firestore] Impossible de souscrire aux commandes:', err);
      return () => {};
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const snapshot = await getDocs(collection(db, ORDERS_COL));
      const list: Order[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Order);
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return list;
    } catch (err) {
      console.warn('[Firestore] Erreur récupération commandes getDocs:', err);
      return [];
    }
  },

  async saveOrder(order: Order): Promise<void> {
    try {
      await setDoc(doc(db, ORDERS_COL, order.id), cleanForFirestore(order), { merge: true });
      console.log(`[Firestore] Commande ${order.orderNumber || order.id} sauvegardée dans Firestore.`);
    } catch (err) {
      console.error('[Firestore] Erreur sauvegarde commande:', err);
    }
  },

  // 3. Écoute en temps réel de la Messagerie instantanée (Clients & Direction)
  subscribeChatMessages(callback: (messages: ChatMessage[]) => void) {
    try {
      return onSnapshot(
        collection(db, CHAT_COL),
        (snapshot) => {
          const list: ChatMessage[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as ChatMessage);
          });
          list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
          callback(list);
        },
        (error) => {
          console.warn('[Firestore] Erreur écoute chat:', error);
        }
      );
    } catch (err) {
      console.warn('[Firestore] Impossible de souscrire au chat:', err);
      return () => {};
    }
  },

  async getChatMessages(): Promise<ChatMessage[]> {
    try {
      const snapshot = await getDocs(collection(db, CHAT_COL));
      const list: ChatMessage[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ChatMessage);
      });
      list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      return list;
    } catch (err) {
      console.warn('[Firestore] Erreur récupération chat getDocs:', err);
      return [];
    }
  },

  async sendChatMessage(message: ChatMessage): Promise<void> {
    try {
      await setDoc(doc(db, CHAT_COL, message.id), cleanForFirestore(message), { merge: true });
      console.log(`[Firestore] Message ${message.id} envoyé par ${message.sender} pour client ${message.customerId}`);
    } catch (err) {
      console.error('[Firestore] Erreur envoi message:', err);
      throw err;
    }
  },

  async markChatAsRead(customerId: string): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, CHAT_COL));
      const promises: Promise<any>[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as ChatMessage;
        if (data.customerId === customerId && !data.read) {
          promises.push(setDoc(doc(db, CHAT_COL, d.id), { read: true }, { merge: true }));
        }
      });
      await Promise.all(promises);
    } catch (err) {
      console.warn('[Firestore] Note markChatAsRead:', err);
    }
  },

  // 4. Paramètres
  subscribeSettings(callback: (settings: StoreSettings) => void) {
    try {
      return onSnapshot(
        doc(db, SETTINGS_COL, 'general'),
        (snapshot) => {
          if (snapshot.exists()) {
            callback(snapshot.data() as StoreSettings);
          }
        },
        (error) => {
          console.warn('[Firestore] Erreur écoute settings:', error);
        }
      );
    } catch (err) {
      console.warn('[Firestore] Impossible de souscrire aux settings:', err);
      return () => {};
    }
  },

  async updateSettings(settings: StoreSettings): Promise<void> {
    try {
      await setDoc(doc(db, SETTINGS_COL, 'general'), cleanForFirestore(settings), { merge: true });
    } catch (err) {
      console.error('[Firestore] Erreur update settings:', err);
    }
  },

  // 5. Produits
  subscribeProducts(callback: (products: Product[]) => void) {
    try {
      return onSnapshot(
        collection(db, PRODUCTS_COL),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as Product);
            });
            callback(list);
          }
        },
        (error) => {
          console.warn('[Firestore] Erreur écoute produits:', error);
        }
      );
    } catch (err) {
      console.warn('[Firestore] Impossible de souscrire aux produits:', err);
      return () => {};
    }
  },

  async saveProduct(product: Product): Promise<void> {
    try {
      await setDoc(doc(db, PRODUCTS_COL, product.id), cleanForFirestore(product), { merge: true });
    } catch (err) {
      console.error('[Firestore] Erreur sauvegarde produit:', err);
    }
  },
};

