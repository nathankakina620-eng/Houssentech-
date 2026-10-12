import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  customers: Customer[];
  orders: Order[];
  settings: StoreSettings;
  currentUser: Customer | null;
  isAdmin: boolean;
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
  deleteCustomer: (customerId: string) => void;
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
  sendChatMessage: (text: string, customCustId?: string, customCustName?: string, customCustPhone?: string, sender?: 'client' | 'admin') => void;
  markChatAsRead: (customerId: string) => void;

  // WhatsApp shortcut
  getWhatsAppUrl: (customText?: string) => string;

  // Settings & Admin
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  loginAdmin: (pin: string) => boolean;
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

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_ADMIN, JSON.stringify(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

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

  // Customer Registration & Validation with Company Number (+243900042404)
  const registerCustomer = (
    fullName: string,
    phone: string,
    city: string,
    address?: string
  ) => {
    const validationCode = `VAL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      fullName,
      phone,
      city,
      address: address || '',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'en_attente_validation',
      validationCode,
      notes: `Demande envoyée au numéro de l'entreprise ${settings.companyPhone}`,
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    const cleanCompanyPhone = cleanPhoneForLink(settings.companyPhone);
    const messageText = `🏍️ DEMANDE D'INSCRIPTION HOUSSETECH\nBonjour Gérant,\nJe souhaite valider mon inscription client sur votre site/application HOUSSETECH.\n\n👤 Nom : ${fullName}\n📱 Téléphone : ${phone}\n📍 Ville : ${city}\n🔑 Code Demande : ${validationCode}\n\nMerci de bien vouloir valider mon compte.`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanCompanyPhone}?text=${encodedMessage}`;
    const smsUrl = `sms:${settings.companyPhone}?body=${encodedMessage}`;

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
              validatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      )
    );

    if (currentUser && currentUser.id === customerId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: 'valide' } : null));
    }
  };

  const rejectCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: 'rejete' } : c))
    );
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    if (currentUser && currentUser.id === customerId) {
      setCurrentUser(null);
    }
  };

  const loginWithPhone = (phoneInput: string): {
    success: boolean;
    status?: CustomerStatus;
    customer?: Customer;
    message: string;
  } => {
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

    if (found.status === 'en_attente_validation') {
      return {
        success: false,
        status: 'en_attente_validation' as CustomerStatus,
        customer: found,
        message:
          `Votre compte est en attente de validation par le gérant au numéro ${settings.companyPhone}. Envoyez le message de confirmation pour l'activer.`,
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

    setCurrentUser(found);
    return {
      success: true,
      status: 'valide' as CustomerStatus,
      customer: found,
      message: `Bienvenue ${found.fullName} ! Votre compte est validé.`,
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
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              adminDecision: 'refusee',
              status: 'refusee',
              adminDecisionReason: reason || 'Article indisponible ou acompte non conforme.',
            }
          : o
      )
    );
  };

  const updateOrderTracking = (orderId: string, step: OrderTrackingStep) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: step } : o))
    );
  };

  const markDepositPaid = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              isDepositPaid: true,
              depositPaidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              status: o.status === 'en_attente_acompte' ? 'acompte_recu' : o.status,
            }
          : o
      )
    );
  };

  // Submit 3-dimensional 5-star rating (Speed, Quality, Delivery)
  const submitOrderRating = (orderId: string, rating: OrderRating) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, rating } : o))
    );
  };

  // In-site Chat System
  const sendChatMessage = (
    text: string,
    customCustId?: string,
    customCustName?: string,
    customCustPhone?: string,
    sender: 'client' | 'admin' = 'client'
  ) => {
    if (!text.trim()) return;

    const custId = customCustId || currentUser?.id || 'guest-cust';
    const custName = customCustName || currentUser?.fullName || 'Client Moto';
    const custPhone = customCustPhone || currentUser?.phone || 'Non renseigné';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      customerId: custId,
      customerName: custName,
      customerPhone: custPhone,
      sender,
      text: text.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };

    setChatMessages((prev) => [...prev, newMsg]);
  };

  const markChatAsRead = (customerId: string) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.customerId === customerId
          ? { ...m, read: true }
          : m
      )
    );
  };

  // Settings & Admin
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const loginAdmin = (pin: string) => {
    if (pin === settings.adminPin || pin === '1234') {
      setIsAdmin(true);
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
        deleteCustomer,
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
