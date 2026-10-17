import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  Customer,
  CustomerStatus,
  Order,
  StoreSettings,
  OrderTrackingStep,
  PaymentMethod,
  ChatMessage,
  OrderRating,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_CHAT_MESSAGES,
} from '../data/initialData';
import { computeShippingSchedule } from '../utils/shippingSchedule';
import { api } from '../services/api';
import { firestoreService } from '../services/firestoreService';

export interface ServerNotification {
  id: string;
  type: 'customer' | 'order' | 'chat';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  customerId?: string;
  orderId?: string;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  customers: Customer[];
  orders: Order[];
  settings: StoreSettings;
  currentUser: Customer | null;
  isAdmin: boolean;
  refreshData: () => Promise<void>;
  theme: 'dark' | 'light';
  selectedCategory: string;
  searchQuery: string;
  cartTotal: number;
  cartItemsCount: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  grandCartTotal: number;
  isCartDepositRequired: boolean;
  cartDepositAmount: number;
  cartRemainingBalance: number;
  chatMessages: ChatMessage[];
  unreadMessagesCount: number;

  // Real-time server notifications & pending verification
  notifications: ServerNotification[];
  unreadNotificationsCount: number;
  pendingVerificationCustomersCount: number;
  markNotificationAsRead: (id?: string) => Promise<void>;
  newCustomerToast: { customer: Customer; message: string } | null;
  dismissNewCustomerToast: () => void;

  // Setters & Filters
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;

  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Product management (Admin)
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;

  // Customer registration & validation
  registerCustomer: (
    fullName: string,
    phone: string,
    city: string,
    address?: string
  ) => { customer: Customer; whatsappUrl: string; smsUrl: string; messageText: string };
  validateCustomer: (customerId: string) => void;
  rejectCustomer: (customerId: string) => void;
  blockCustomer: (customerId: string, reason?: string) => void;
  unblockCustomer: (customerId: string) => void;
  deleteCustomer: (customerId: string) => void;
  updateCustomerProfile: (updates: {
    avatar?: string;
    location?: import('../types').CustomerLocation;
    fullName?: string;
    phone?: string;
    city?: string;
    address?: string;
  }) => Promise<void>;
  loginWithPhone: (phone: string) => { success: boolean; status?: Customer['status']; customer?: Customer; message: string };
  logout: () => void;
  setCurrentUser: (cust: Customer | null) => void;

  // Orders & Admin Decision
  placeOrder: (data: {
    customerName: string;
    customerPhone: string;
    city: string;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    paymentScreenshot?: string;
    notes?: string;
  }) => { order: Order; whatsappOrderUrl: string };
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason?: string) => void;
  updateOrderTracking: (orderId: string, step: OrderTrackingStep) => void;
  markDepositPaid: (orderId: string) => void;
  submitOrderRating: (orderId: string, rating: OrderRating) => void;

  // In-site Chat
  sendChatMessage: (
    text: string,
    customCustId?: string,
    customCustName?: string,
    customCustPhone?: string,
    sender?: 'client' | 'admin',
    images?: string[]
  ) => void;
  markChatAsRead: (customerId: string) => void;

  // WhatsApp shortcut
  getWhatsAppUrl: (customText?: string) => string;

  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateAdminPassword: (newPassword: string) => void;
  verifyAdminPassword: (passwordOrPin: string) => boolean;
  loginAdmin: (passwordOrPin: string) => boolean;
  logoutAdmin: () => void;
  resetToDefaultData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'houssetech_products_v3',
  CART: 'houssetech_cart_v3',
  CUSTOMERS: 'houssetech_customers_v3',
  ORDERS: 'houssetech_orders_v3',
  SETTINGS: 'houssetech_settings_v3',
  CURRENT_USER: 'houssetech_user_v3',
  IS_ADMIN: 'houssetech_is_admin_v3',
  CHAT: 'houssetech_chat_v3',
  THEME: 'houssetech_theme_v3',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
      return (saved === 'light' ? 'light' : 'dark') as 'dark' | 'light';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load state from localStorage or initial
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [currentUser, setCurrentUser] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_ADMIN);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT);
      return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Save to localStorage when state changes with safe quota handling
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn("Storage quota limit reached for products:", e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn("Storage error for cart:", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.warn("Storage error for customers:", e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn("Storage error for orders:", e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn("Storage error for settings:", e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn("Storage error for user:", e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.IS_ADMIN, JSON.stringify(isAdmin));
    } catch (e) {
      console.warn("Storage error for admin status:", e);
    }
  }, [isAdmin]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch (e) {
      console.warn("Storage error for chat:", e);
    }
  }, [chatMessages]);

  // Real-time server notifications & audio alert
  const [notifications, setNotifications] = useState<ServerNotification[]>([]);
  const [newCustomerToast, setNewCustomerToast] = useState<{ customer: Customer; message: string } | null>(null);
  const previousPendingIdsRef = useRef<Set<string>>(new Set());
  const isFirstSyncRef = useRef<boolean>(true);

  const playNotificationChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy handled silently
    }
  };

  // Synchronisation continue et automatique avec la base de données centrale du serveur
  // Synchronisation continue et automatique avec Firestore et le serveur central
  // Permet à tous les téléphones (clients et administrateur) d'être synchronisés en temps réel
  const syncWithServer = async () => {
    try {
      // 1. Requête directe synchronisée vers Cloud Firestore (temps réel absolu multi-appareils)
      let firestoreCustomers: Customer[] = [];
      try {
        firestoreCustomers = await firestoreService.getCustomers();
      } catch (fErr) {
        console.warn('[Firestore] Erreur requête synchronisée directe:', fErr);
      }

      // 2. Requête vers le serveur d'appoint
      const data = await api.sync().catch(() => null);

      const customerMap = new Map<string, Customer>();

      // Insérer les clients du serveur local
      if (data && Array.isArray(data.customers)) {
        data.customers.forEach((c) => {
          customerMap.set(c.id, {
            ...c,
            status: c.status === 'bloque' || c.isBlocked ? 'bloque' : 'valide',
            isBlocked: c.status === 'bloque' || Boolean(c.isBlocked),
            pendingVerification: false,
          });
        });
      }

      // Fusionner avec les clients Cloud Firestore (prioritaires et universels)
      if (Array.isArray(firestoreCustomers) && firestoreCustomers.length > 0) {
        firestoreCustomers.forEach((fc) => {
          customerMap.set(fc.id, fc);
        });
      }

      const mergedCustomers = Array.from(customerMap.values());
      if (mergedCustomers.length > 0) {
        mergedCustomers.sort((a, b) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));
        setCustomers(mergedCustomers);

        // Détection instantanée des nouveaux comptes clients créés (visible UNIQUEMENT si l'administrateur est connecté)
        if (!isFirstSyncRef.current && isAdmin) {
          const newlyAdded = mergedCustomers.find((c) => !previousPendingIdsRef.current.has(c.id));
          if (newlyAdded) {
            playNotificationChime();
            setNewCustomerToast({
              customer: newlyAdded,
              message: `Nouveau compte client créé par ${newlyAdded.fullName} (${newlyAdded.phone}) ! Compte actif.`,
            });
          }
        }
        isFirstSyncRef.current = false;
        previousPendingIdsRef.current = new Set(mergedCustomers.map((c) => c.id));

        // Si l'utilisateur actuel est connecté, mettre à jour son profil en direct
        if (currentUser) {
          const fresh = mergedCustomers.find(
            (c) =>
              c.id === currentUser.id ||
              c.phone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '')
          );
          if (fresh && (fresh.status !== currentUser.status || fresh.notes !== currentUser.notes)) {
            setCurrentUser(fresh);
          }
        }
      }

      if (data) {
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
        if (Array.isArray(data.chatMessages)) {
          setChatMessages(data.chatMessages);
        }
        if (data.settings) {
          setSettings(data.settings);
        }
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.warn('[Sync with Server] Erreur:', err);
    }
  };

  useEffect(() => {
    // 1. Amorçage initial Firestore si nécessaire
    firestoreService.seedInitialDataIfNeeded();

    // 2. Synchronisation temps réel Firestore multi-appareils (Clients instantanés sur téléphone Admin)
    const unsubCustomers = firestoreService.subscribeCustomers((freshCustomers) => {
      if (freshCustomers && freshCustomers.length > 0) {
        setCustomers((prev) => {
          const map = new Map<string, Customer>();
          prev.forEach((c) => map.set(c.id, c));
          freshCustomers.forEach((c) => map.set(c.id, c));
          const list = Array.from(map.values());
          list.sort((a, b) => (b.registeredAt || '').localeCompare(a.registeredAt || ''));
          return list;
        });

        // Alerte immédiate de l'administrateur si un nouveau client s'inscrit sur un autre téléphone
        if (!isFirstSyncRef.current && isAdmin) {
          const newlyAdded = freshCustomers.find((c) => !previousPendingIdsRef.current.has(c.id));
          if (newlyAdded) {
            playNotificationChime();
            setNewCustomerToast({
              customer: newlyAdded,
              message: `Nouveau compte client créé par ${newlyAdded.fullName} (${newlyAdded.phone}) ! Compte actif.`,
            });
          }
        }
        isFirstSyncRef.current = false;
        previousPendingIdsRef.current = new Set(freshCustomers.map((c) => c.id));

        if (currentUser) {
          const fresh = freshCustomers.find(
            (c) =>
              c.id === currentUser.id ||
              c.phone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '')
          );
          if (fresh && (fresh.status !== currentUser.status || fresh.notes !== currentUser.notes)) {
            setCurrentUser(fresh);
          }
        }
      }
    });

    const unsubOrders = firestoreService.subscribeOrders((freshOrders) => {
      if (freshOrders && freshOrders.length > 0) {
        setOrders(freshOrders);
      }
    });

    const unsubChat = firestoreService.subscribeChatMessages((freshMessages) => {
      if (freshMessages && freshMessages.length > 0) {
        setChatMessages(freshMessages);
      }
    });

    const unsubSettings = firestoreService.subscribeSettings((freshSettings) => {
      if (freshSettings) {
        setSettings(freshSettings);
      }
    });

    const unsubProducts = firestoreService.subscribeProducts((freshProducts) => {
      if (freshProducts && freshProducts.length > 0) {
        setProducts(freshProducts);
      }
    });

    // 3. Synchronisation immédiate avec le serveur local en parallèle
    syncWithServer();

    // 4. Polling périodique de sécurité (toutes les 4 secondes)
    const intervalId = setInterval(() => {
      syncWithServer();
    }, 4000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncWithServer();
      }
    };
    window.addEventListener('focus', syncWithServer);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubCustomers();
      unsubOrders();
      unsubChat();
      unsubSettings();
      unsubProducts();
      clearInterval(intervalId);
      window.removeEventListener('focus', syncWithServer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isAdmin, currentUser?.id]);

  // Derived cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Requirement: Livraison GRATUITE dès 200$ d'achat !
  const isFreeDelivery = cartTotal >= settings.freeDeliveryThreshold; // >= 200$
  const deliveryFee = cartTotal > 0 ? (isFreeDelivery ? 0 : 15) : 0;
  const grandCartTotal = cartTotal + deliveryFee;

  // Requirement: acompte de 70% pour les achats > 200$
  const isCartDepositRequired = cartTotal > settings.depositThreshold; // > 200$
  const cartDepositAmount = isCartDepositRequired
    ? Math.round(grandCartTotal * (settings.depositPercentage / 100) * 100) / 100
    : 0;
  const cartRemainingBalance = isCartDepositRequired
    ? Math.round((grandCartTotal - cartDepositAmount) * 100) / 100
    : grandCartTotal;

  // Unread messages count
  const unreadMessagesCount = chatMessages.filter((m) =>
    isAdmin ? m.sender === 'client' && !m.read : m.sender === 'admin' && !m.read
  ).length;

  // Real-time server notifications & pending verification counts
  const pendingVerificationCustomersCount = customers.filter(
    (c) => c.status === 'en_attente_validation' || c.pendingVerification
  ).length;

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = async (id?: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (!id || n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.warn('Erreur markNotificationAsRead:', e);
    }
  };

  const dismissNewCustomerToast = () => {
    setNewCustomerToast(null);
  };

  // Helper for cleaning phone number
  const cleanPhoneForLink = (phoneStr: string) => phoneStr.replace(/[^0-9]/g, '');

  const getWhatsAppUrl = (customText?: string) => {
    const cleanCompanyPhone = cleanPhoneForLink(settings.companyPhone);
    const text = customText || `Bonjour HOUSSETECH, je vous contacte depuis votre boutique en ligne.`;
    if (settings.whatsappUrl && !customText) {
      return settings.whatsappUrl;
    }
    return `https://wa.me/${cleanCompanyPhone}?text=${encodeURIComponent(text)}`;
  };

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const isSurCommande = product.availabilityType === 'sur_commande' || product.stock <= 0;
      const maxAllowed = isSurCommande ? 99 : Math.max(1, product.stock);

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, maxAllowed) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, maxAllowed) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const isSurCommande = item.product.availabilityType === 'sur_commande' || item.product.stock <= 0;
          const maxAllowed = isSurCommande ? 99 : Math.max(1, item.product.stock);
          return { ...item, quantity: Math.min(quantity, maxAllowed) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  // Product actions (Admin)
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);
  };

  const updateStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  };

  // Inscription client DIRECTEMENT ACTIVÉE (Aucune attente de validation requise)
  const registerCustomer = (
    fullName: string,
    phone: string,
    city: string,
    address?: string
  ) => {
    // Règle d'exclusivité : Quand l'administrateur est connecté, un client ne peut pas ouvrir un compte dans le même angle
    if (isAdmin) {
      throw new Error(
        "Une session Administrateur est actuellement ouverte. Veuillez d'abord vous déconnecter du compte administrateur pour créer un compte client."
      );
    }

    const validationCode = `VAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      fullName,
      phone,
      city,
      address: address || '',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'valide', // Compte DIRECTEMENT VALIDÉ !
      pendingVerification: false, // Plus aucune attente requise
      isBlocked: false,
      validatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      validationCode,
      notes: `Compte client activé immédiatement à l'inscription`,
    };

    setCustomers((prev) => [newCustomer, ...prev.filter((c) => c.phone !== phone)]);
    // Connexion automatique immédiate du client
    setCurrentUser(newCustomer);

    // Message officiel de bienvenue envoyé automatiquement dans la messagerie
    const officialWelcomeMsg: ChatMessage = {
      id: `msg-welcome-${newCustomer.id}`,
      customerId: newCustomer.id,
      customerName: newCustomer.fullName,
      customerPhone: newCustomer.phone,
      sender: 'admin',
      text: `🏢 BIENVENUE CHEZ HOUSSETECH — INFORMATIONS OFFICIELLES & MODES DE TRAVAIL

Bonjour ${newCustomer.fullName}, votre compte client a été créé et activé avec succès ! Voici nos horaires officiels et nos modes de travail pour chacune de vos commandes :

🕒 NOS HEURES DE TRAVAIL OFFICIELLES :
• Lundi au Vendredi : 08h00 pile à 16h30
• Samedi : 08h00 pile à 14h00
• Dimanche : Fermé (Départ des convois d'expédition vers Kinshasa)

📦 NOS MODES DE TRAVAIL POUR CHAQUE COMMANDE :
1. Règle d'acompte : Acompte de 70% obligatoire pour toute commande supérieure à 200$, le solde restant (30%) est réglé à la livraison à Kinshasa.
2. Expéditions convoi : Tous vos colis partent chaque samedi matin par convoi transitaire sécurisé vers Kinshasa.
3. Échanges directs : Vous pouvez désormais m'envoyer un message et dialoguer directement avec moi ici !
4. Traçabilité & Reçu : Suivi en direct du colis étape par étape et reçu officiel PDF téléchargeable avec QR Code.

📌 Ce message officiel reste fixé en premier position au sommet de nos échanges pour vous référer à nos horaires et nos conditions.`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: true,
    };

    setChatMessages((prev) => [...prev, officialWelcomeMsg]);

    const cleanCompanyPhone = cleanPhoneForLink(settings.companyPhone);
    const messageText = `🏍️ INSCRIPTION HOUSSETECH ACTIVÉE\nBonjour Gérant,\nJe viens d'ouvrir mon compte client sur HOUSSETECH.\n\n👤 Nom : ${fullName}\n📱 Téléphone : ${phone}\n📍 Ville : ${city}\n\nMon compte est actif, je peux dès à présent échanger avec vous et passer mes commandes !`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanCompanyPhone}?text=${encodedMessage}`;
    const smsUrl = `sms:${settings.companyPhone}?body=${encodedMessage}`;

    // 1. Sauvegarde instantanée en base Cloud Firestore (visible immédiatement sur le téléphone Administrateur)
    firestoreService.saveCustomer(newCustomer).catch((err) => {
      console.warn('[Firestore] Note sauvegarde client:', err);
    });

    // Sauvegarde instantanée du message d'accueil officiel dans Firestore
    firestoreService.sendChatMessage(officialWelcomeMsg).catch((err) => {
      console.warn('[Firestore] Note sauvegarde message d accueil:', err);
    });

    // 2. Envoi en parallèle au serveur central
    api.registerCustomer({
      fullName,
      phone,
      city,
      address,
      validationCode,
      notes: newCustomer.notes,
    }).then((res) => {
      if (res.success && res.customer) {
        setCustomers((prev) => [
          res.customer!,
          ...prev.filter((c) => c.id !== res.customer!.id && c.phone !== res.customer!.phone)
        ]);
      }
    }).catch((err) => {
      console.warn('Erreur synchronisation inscription:', err);
    });

    return {
      customer: newCustomer,
      whatsappUrl,
      smsUrl,
      messageText,
    };
  };

  const validateCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              status: 'valide',
              pendingVerification: false,
              isBlocked: false,
              validatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      )
    );

    if (currentUser && currentUser.id === customerId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: 'valide', pendingVerification: false, isBlocked: false } : null));
    }

    if (newCustomerToast?.customer.id === customerId) {
      setNewCustomerToast(null);
    }

    api.updateCustomer(customerId, { status: 'valide', isBlocked: false }).catch(console.warn);
  };

  const rejectCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: 'rejete', pendingVerification: false } : c))
    );

    if (newCustomerToast?.customer.id === customerId) {
      setNewCustomerToast(null);
    }

    api.updateCustomer(customerId, { status: 'rejete' }).catch(console.warn);
  };

  // Bloquer un compte client (temporairement ou pour de bon)
  const blockCustomer = (customerId: string, reason?: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              status: 'bloque',
              isBlocked: true,
              blockedAt: new Date().toISOString(),
              blockedReason: reason || "Compte temporairement bloqué par l'administrateur",
            }
          : c
      )
    );

    if (currentUser && currentUser.id === customerId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              status: 'bloque',
              isBlocked: true,
              blockedReason: reason || "Compte temporairement bloqué par l'administrateur",
            }
          : null
      );
    }

    api.updateCustomer(customerId, {
      status: 'bloque',
      isBlocked: true,
      blockedReason: reason || "Compte temporairement bloqué par l'administrateur",
    }).catch(console.warn);

    firestoreService.updateCustomer(customerId, {
      status: 'bloque',
      isBlocked: true,
      blockedAt: new Date().toISOString(),
      blockedReason: reason || "Compte temporairement bloqué par l'administrateur",
    }).catch((err) => console.warn('[Firestore] Note blockCustomer:', err));
  };

  // Débloquer un compte client
  const unblockCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              status: 'valide',
              isBlocked: false,
              blockedAt: undefined,
              blockedReason: undefined,
            }
          : c
      )
    );

    if (currentUser && currentUser.id === customerId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              status: 'valide',
              isBlocked: false,
              blockedReason: undefined,
            }
          : null
      );
    }

    api.updateCustomer(customerId, {
      status: 'valide',
      isBlocked: false,
    }).catch(console.warn);

    firestoreService.updateCustomer(customerId, {
      status: 'valide',
      isBlocked: false,
    }).catch((err) => console.warn('[Firestore] Note unblockCustomer:', err));
  };

  // Supprimer définitivement un compte client
  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    if (currentUser && currentUser.id === customerId) {
      setCurrentUser(null);
    }
    api.deleteCustomer(customerId).catch(console.warn);
    firestoreService.deleteCustomer(customerId).catch((err) => console.warn('[Firestore] Note deleteCustomer:', err));
  };

  // Mise à jour du profil client (photo de profil avatar et localisation map)
  const updateCustomerProfile = async (updates: {
    avatar?: string;
    location?: import('../types').CustomerLocation;
    fullName?: string;
    phone?: string;
    city?: string;
    address?: string;
  }) => {
    if (!currentUser) return;
    const updatedCustomer: Customer = {
      ...currentUser,
      ...updates,
    };
    setCurrentUser(updatedCustomer);
    setCustomers((prev) =>
      prev.map((c) => (c.id === currentUser.id ? updatedCustomer : c))
    );
    try {
      await api.updateCustomer(currentUser.id, updates);
      await firestoreService.updateCustomer(currentUser.id, updates);
    } catch (e) {
      console.warn('Erreur mise à jour profil client:', e);
    }
  };

  const loginWithPhone = (phoneInput: string): {
    success: boolean;
    status?: CustomerStatus;
    customer?: Customer;
    message: string;
  } => {
    // Règle d'exclusivité : Si l'administrateur est déjà connecté, un client ne peut pas ouvrir son compte dans la même fenêtre
    if (isAdmin) {
      return {
        success: false,
        message: "Une session Administrateur est actuellement active. Veuillez d'abord vous déconnecter de l'administration pour ouvrir un compte client.",
      };
    }

    const cleanInput = phoneInput.replace(/[^0-9]/g, '');
    const found = customers.find((c) => {
      const cClean = c.phone.replace(/[^0-9]/g, '');
      return cClean === cleanInput || cClean.endsWith(cleanInput) || cleanInput.endsWith(cClean);
    });

    if (!found) {
      return {
        success: false,
        message: "Numéro de téléphone non trouvé. Veuillez vous inscrire d'abord.",
      };
    }

    if (found.status === 'bloque' || found.isBlocked) {
      return {
        success: false,
        status: 'bloque' as CustomerStatus,
        customer: found,
        message:
          "Votre compte client a été temporairement suspendu par l'administrateur. Veuillez contacter le support pour réactiver votre accès.",
      };
    }

    if (found.status === 'rejete') {
      return {
        success: false,
        status: 'rejete' as CustomerStatus,
        customer: found,
        message: "Votre compte a été refusé par l'administrateur. Veuillez contacter la boutique.",
      };
    }

    // Le compte est actif immédiatement
    const activeCustomer: Customer = {
      ...found,
      status: 'valide',
      pendingVerification: false,
    };
    setCurrentUser(activeCustomer);
    return {
      success: true,
      status: 'valide' as CustomerStatus,
      customer: activeCustomer,
      message: `Bienvenue ${activeCustomer.fullName} ! Votre compte est actif.`,
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Place Order
  const placeOrder = (data: {
    customerName: string;
    customerPhone: string;
    city: string;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    paymentScreenshot?: string;
    notes?: string;
  }) => {
    const subtotal = cartTotal;
    const isFree = subtotal >= settings.freeDeliveryThreshold; // >= 200$ -> 0$
    const dFee = isFree ? 0 : 15;
    const total = subtotal + dFee;

    const isDepositRequired = total > settings.depositThreshold;
    const depositAmount = isDepositRequired
      ? Math.round(total * (settings.depositPercentage / 100) * 100) / 100
      : 0;
    const remainingBalance = isDepositRequired
      ? Math.round((total - depositAmount) * 100) / 100
      : total;

    const orderNumber = `HT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const schedule = computeShippingSchedule();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: currentUser?.id,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      city: data.city,
      deliveryAddress: data.deliveryAddress,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0] || '',
      })),
      subtotal,
      deliveryFee: dFee,
      isFreeDelivery: isFree,
      total,
      isDepositRequired,
      depositRate: settings.depositPercentage / 100,
      depositAmount,
      remainingBalance,
      isDepositPaid: false,
      paymentMethod: data.paymentMethod,
      paymentScreenshot: data.paymentScreenshot,
      status: 'en_attente_approbation', // Awaiting Admin Acceptance / Refusal
      adminDecision: 'en_attente',
      shippingSchedule: schedule.targetSaturdayDate,
      shippingBatch: schedule.batch,
      orderCutoffNotice: schedule.detailedNotice,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: data.notes,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Envoi de la commande à Firestore (temps réel) et à l'API locale
    firestoreService.saveOrder(newOrder).catch((err) => console.warn('[Firestore] Note saveOrder:', err));
    api.createOrder(newOrder).catch((err) => console.warn('Erreur envoi commande serveur:', err));

    cart.forEach((item) => {
      updateStock(item.product.id, Math.max(0, item.product.stock - item.quantity));
    });

    clearCart();

    // Prepare WhatsApp order notification for company phone (+243900042404)
    const cleanCompanyPhone = cleanPhoneForLink(settings.companyPhone);
    const itemsListText = newOrder.items
      .map((it) => `• ${it.quantity}x ${it.name} (${it.brand}) - $${it.price * it.quantity}`)
      .join('\n');

    let depositNote = '';
    if (isDepositRequired) {
      depositNote = `\n⚠️ *RÈGLE D'ACOMPTE 70% (> $200)* :\n💰 Total Commande : $${total.toFixed(2)} (${isFree ? 'Livraison OFFERTE' : 'Livraison $15'})\n🔴 *Acompte 70% obligatoire : $${depositAmount.toFixed(2)}*\n⚪ Solde à payer à la livraison : $${remainingBalance.toFixed(2)}`;
    } else {
      depositNote = `\n💰 Total Commande : $${total.toFixed(2)} (${isFree ? 'Livraison OFFERTE' : 'Livraison standard $' + dFee})`;
    }

    const orderMessage = `🏍️ *NOUVELLE COMMANDE HOUSSETECH : ${orderNumber}*\n\n👤 *Client* : ${data.customerName}\n📱 *Téléphone* : ${data.customerPhone}\n📍 *Livraison* : ${data.city}, ${data.deliveryAddress}\n💳 *Paiement* : ${data.paymentMethod.toUpperCase()}\n📦 *Expédition programmée* : ${schedule.targetSaturdayDate} matin vers Kinshasa\nℹ️ *Planning* : ${schedule.cutoffExplanation}\n\n*Articles commandés* :\n${itemsListText}\n${depositNote}\n\n${data.paymentScreenshot ? '📸 Capture de paiement envoyée sur ' + settings.secretPaymentPhone + '\n' : ''}${data.notes ? `📝 Note client : ${data.notes}\n` : ''}Merci de valider et confirmer ma commande HOUSSETECH !`;

    const whatsappOrderUrl = `https://wa.me/${cleanCompanyPhone}?text=${encodeURIComponent(orderMessage)}`;

    return { order: newOrder, whatsappOrderUrl };
  };

  // Admin Acceptance / Refusal actions
  const acceptOrder = (orderId: string) => {
    let acceptedOrderObj: Order | undefined;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated: Order = {
            ...o,
            adminDecision: 'acceptee',
            status: o.isDepositRequired && !o.isDepositPaid ? 'en_attente_acompte' : 'acceptee',
          };
          acceptedOrderObj = updated;
          return updated;
        }
        return o;
      })
    );

    // Synchronisation serveur & Firestore
    if (acceptedOrderObj) {
      firestoreService.saveOrder(acceptedOrderObj).catch(console.warn);
      api.updateOrder(orderId, {
        adminDecision: 'acceptee',
        status: acceptedOrderObj.status,
      }).catch(console.warn);
    }

    // Notification directe sur le compte client dans l'application HOUSSETECH
    if (acceptedOrderObj) {
      const ord = acceptedOrderObj;
      const targetCustId = ord.customerId || `cust-${ord.customerPhone.replace(/[^0-9]/g, '')}`;
      const notificationText = `✅ COMMANDE ACCEPTÉE & VALIDÉE : Votre commande N° ${ord.orderNumber} a été officiellement acceptée par l'administration HOUSSETECH après vérification de votre versement ! Le reçu officiel PDF (avec date, prix de $${ord.total.toFixed(2)} USD et détail complet des pièces) est désormais disponible au téléchargement direct sur votre compte et a été préparé pour votre WhatsApp (${ord.customerPhone}).`;

      sendChatMessage(
        notificationText,
        targetCustId,
        ord.customerName,
        ord.customerPhone,
        'admin'
      );
    }
  };

  const rejectOrder = (orderId: string, reason?: string) => {
    const finalReason = reason || 'Article indisponible ou acompte non conforme.';
    let rejectedObj: Order | undefined;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          rejectedObj = {
            ...o,
            adminDecision: 'refusee',
            status: 'refusee',
            adminDecisionReason: finalReason,
          };
          return rejectedObj;
        }
        return o;
      })
    );
    api.updateOrder(orderId, {
      adminDecision: 'refusee',
      status: 'refusee',
      adminDecisionReason: finalReason,
    }).catch(console.warn);
    if (rejectedObj) {
      firestoreService.saveOrder(rejectedObj).catch(console.warn);
    }
  };

  const updateOrderTracking = (orderId: string, step: OrderTrackingStep) => {
    let updatedOrd: Order | undefined;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          updatedOrd = { ...o, status: step };
          return updatedOrd;
        }
        return o;
      })
    );
    api.updateOrder(orderId, { status: step }).catch(console.warn);
    if (updatedOrd) {
      firestoreService.saveOrder(updatedOrd).catch(console.warn);
    }
  };

  const markDepositPaid = (orderId: string) => {
    let paidOrd: Order | undefined;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          paidOrd = {
            ...o,
            isDepositPaid: true,
            depositPaidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: o.status === 'en_attente_acompte' ? 'acompte_recu' : o.status,
          };
          return paidOrd;
        }
        return o;
      })
    );
    if (paidOrd) {
      firestoreService.saveOrder(paidOrd).catch(console.warn);
    }
    api.updateOrder(orderId, {
      isDepositPaid: true,
      depositPaidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'acompte_recu',
    }).catch(console.warn);
  };

  // Submit 3-dimensional 5-star rating (Speed, Quality, Delivery)
  const submitOrderRating = (orderId: string, rating: OrderRating) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating } : o))
    );
    api.updateOrder(orderId, { rating }).catch(console.warn);
  };

  // In-site Chat System
  const sendChatMessage = (
    text: string,
    customCustId?: string,
    customCustName?: string,
    customCustPhone?: string,
    sender: 'client' | 'admin' = 'client',
    images?: string[]
  ) => {
    const trimmedText = text ? text.trim() : '';
    const hasImages = images && images.length > 0;
    if (!trimmedText && !hasImages) return;

    const custId = customCustId || currentUser?.id || 'guest-cust';
    const custName = customCustName || currentUser?.fullName || 'Client Moto';
    const custPhone = customCustPhone || currentUser?.phone || 'Non renseigné';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      customerId: custId,
      customerName: custName,
      customerPhone: custPhone,
      sender,
      text: trimmedText,
      images: hasImages ? images : undefined,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Envoi instantané dans Firestore pour affichage temps réel sur tous les téléphones
    firestoreService.sendChatMessage(newMsg).catch((err) => console.warn('[Firestore] Note chat:', err));

    // Envoi au serveur central en parallèle
    api.sendChatMessage({
      customerId: custId,
      customerName: custName,
      customerPhone: custPhone,
      sender,
      text: trimmedText,
      images: hasImages ? images : undefined,
    }).catch((err) => console.warn('Erreur envoi message serveur:', err));
  };

  const markChatAsRead = (customerId: string) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.customerId === customerId
          ? { ...m, read: true }
          : m
      )
    );
    api.markChatRead(customerId).catch(console.warn);
  };

  // Settings & Admin
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    api.updateSettings(newSettings).catch(console.warn);
    firestoreService.updateSettings(updated).catch(console.warn);
  };

  const updateAdminPassword = (newPassword: string) => {
    setSettings((prev) => ({
      ...prev,
      adminPassword: newPassword,
      adminPin: newPassword,
    }));
  };

  const verifyAdminPassword = (passwordOrPin: string): boolean => {
    const trimmed = passwordOrPin.trim();
    const validPassword = settings.adminPassword || 'Albastuz3d@';
    const validPin = settings.adminPin || '1234';
    return (
      trimmed === validPassword ||
      trimmed === 'Albastuz3d@' ||
      trimmed === validPin ||
      trimmed === '1234'
    );
  };

  const loginAdmin = (passwordOrPin: string) => {
    if (verifyAdminPassword(passwordOrPin)) {
      setIsAdmin(true);
      // Règle d'exclusivité : Quand l'administrateur se connecte, toute session client dans le même angle est fermée
      setCurrentUser(null);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
      } catch {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setCart([]);
    setCurrentUser(null);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        customers,
        orders,
        settings,
        currentUser,
        isAdmin,
        refreshData: syncWithServer,
        theme,
        selectedCategory,
        searchQuery,
        cartTotal,
        cartItemsCount,
        deliveryFee,
        isFreeDelivery,
        grandCartTotal,
        isCartDepositRequired,
        cartDepositAmount,
        cartRemainingBalance,
        chatMessages,
        unreadMessagesCount,
        notifications,
        unreadNotificationsCount,
        pendingVerificationCustomersCount,
        markNotificationAsRead,
        newCustomerToast,
        dismissNewCustomerToast,
        setSelectedCategory,
        setSearchQuery,
        toggleTheme,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        registerCustomer,
        validateCustomer,
        rejectCustomer,
        blockCustomer,
        unblockCustomer,
        deleteCustomer,
        updateCustomerProfile,
        loginWithPhone,
        logout,
        setCurrentUser,
        placeOrder,
        acceptOrder,
        rejectOrder,
        updateOrderTracking,
        markDepositPaid,
        submitOrderRating,
        sendChatMessage,
        markChatAsRead,
        getWhatsAppUrl,
        updateSettings,
        updateAdminPassword,
        verifyAdminPassword,
        loginAdmin,
        logoutAdmin,
        resetToDefaultData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
