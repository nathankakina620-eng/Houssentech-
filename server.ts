import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_CHAT_MESSAGES,
} from './src/data/initialData';
import { Customer, Order, ChatMessage, StoreSettings, Product } from './src/types';

interface ServerNotification {
  id: string;
  type: 'customer' | 'order' | 'chat';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  customerId?: string;
  orderId?: string;
}

interface DatabaseSchema {
  customers: Customer[];
  orders: Order[];
  chatMessages: ChatMessage[];
  settings: StoreSettings;
  products: Product[];
  notifications: ServerNotification[];
  lastUpdated: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize central database
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        customers: Array.isArray(parsed.customers)
          ? parsed.customers.map((c: any) => ({
              ...c,
              pendingVerification: c.status === 'en_attente_validation' ? true : false,
            }))
          : INITIAL_CUSTOMERS,
        orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_ORDERS,
        chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages : INITIAL_CHAT_MESSAGES,
        settings: parsed.settings || INITIAL_SETTINGS,
        products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Erreur lecture database.json, réinitialisation avec valeurs par défaut:', err);
  }

  // Initial seed
  const initialData: DatabaseSchema = {
    customers: INITIAL_CUSTOMERS,
    orders: INITIAL_ORDERS,
    chatMessages: INITIAL_CHAT_MESSAGES,
    settings: INITIAL_SETTINGS,
    products: INITIAL_PRODUCTS,
    notifications: [
      {
        id: 'notif-init-1',
        type: 'customer',
        title: 'Système Initialisé',
        message: 'Base de données centrale active pour tous les téléphones et ordinateurs.',
        createdAt: new Date().toISOString(),
        read: false,
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  saveDatabase(initialData);
  return initialData;
}

let db: DatabaseSchema = loadDatabase();

function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.customers)) {
        db = parsed;
      }
    }
  } catch (err) {
    console.error('Erreur lecture DB_FILE:', err);
  }
  return db;
}

function saveDatabase(dataToSave: DatabaseSchema) {
  try {
    dataToSave.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    db = dataToSave;
  } catch (err) {
    console.error('Erreur sauvegarde database.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware pour requêtes JSON avec grande limite (pour les photos)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // =========================================================================
  // API ROUTES (Synchronisation centrale pour tous les téléphones et admins)
  // =========================================================================

  // 1. Health check
  app.get('/api/health', (req, res) => {
    const currentDb = getDatabase();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), customersCount: currentDb.customers.length });
  });

  // 2. Full Sync (Appelé régulièrement par chaque client & admin)
  app.get('/api/sync', (req, res) => {
    const currentDb = getDatabase();
    res.json({
      customers: currentDb.customers.map((c) => ({
        ...c,
        status: c.status === 'bloque' || c.isBlocked ? 'bloque' : 'valide',
        isBlocked: c.status === 'bloque' || Boolean(c.isBlocked),
        pendingVerification: false,
      })),
      orders: currentDb.orders,
      chatMessages: currentDb.chatMessages,
      settings: currentDb.settings,
      products: currentDb.products,
      notifications: currentDb.notifications,
      lastUpdated: currentDb.lastUpdated,
    });
  });

  // 3. Customers API
  app.get('/api/customers', (req, res) => {
    const currentDb = getDatabase();
    res.json(
      currentDb.customers.map((c) => ({
        ...c,
        status: c.status === 'bloque' || c.isBlocked ? 'bloque' : 'valide',
        isBlocked: c.status === 'bloque' || Boolean(c.isBlocked),
        pendingVerification: false,
      }))
    );
  });

  // Inscription d'un nouveau client (depuis n'importe quel téléphone client)
  app.post('/api/customers', (req, res) => {
    const { fullName, phone, city, address, notes, validationCode } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Nom complet et numéro de téléphone requis.' });
    }

    const cleanInputPhone = phone.replace(/[^0-9]/g, '');

    // Vérifier si un client existe déjà avec ce numéro
    const existingIndex = db.customers.findIndex(
      (c) => c.phone.replace(/[^0-9]/g, '') === cleanInputPhone
    );

    let customerToReturn: Customer;

    if (existingIndex >= 0) {
      // Mettre à jour les informations du client existant
      const existing = db.customers[existingIndex];
      const isBlocked = existing.status === 'bloque' || existing.isBlocked;
      customerToReturn = {
        ...existing,
        fullName: fullName || existing.fullName,
        city: city || existing.city,
        address: address || existing.address,
        avatar: req.body.avatar || existing.avatar,
        location: req.body.location || existing.location,
        validationCode: validationCode || existing.validationCode,
        notes: notes || existing.notes,
        status: isBlocked ? 'bloque' : 'valide',
        isBlocked: Boolean(isBlocked),
        pendingVerification: false,
      };
      db.customers[existingIndex] = customerToReturn;
    } else {
      // Création d'un nouveau compte client ACTIVÉ DIRECTEMENT (Pas d'attente de validation requise)
      const newCustId = `cust-${Date.now()}`;
      customerToReturn = {
        id: newCustId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city?.trim() || 'Kinshasa',
        address: address?.trim() || '',
        avatar: req.body.avatar || undefined,
        location: req.body.location || undefined,
        registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'valide', // Validé directement sans attente
        pendingVerification: false,
        isBlocked: false,
        validatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        validationCode: validationCode || `VAL-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: notes || `Compte actif créé directement. Possibilité de blocage ou suppression par l'administration.`,
      };

      db.customers.unshift(customerToReturn);

      // Créer automatiquement le message de bienvenue officiel HOUSSETECH
      const welcomeMsg: ChatMessage = {
        id: `msg-welcome-${customerToReturn.id}`,
        customerId: customerToReturn.id,
        customerName: customerToReturn.fullName,
        customerPhone: customerToReturn.phone,
        sender: 'admin',
        text: `🏢 BIENVENUE CHEZ HOUSSETECH — INFORMATIONS OFFICIELLES & MODES DE TRAVAIL

Bonjour ${customerToReturn.fullName}, votre compte client a été créé et activé avec succès ! Voici nos horaires officiels et nos modes de travail pour chacune de vos commandes :

🕒 NOS HEURES DE TRAVAIL OFFICIELLES :
• Lundi au Vendredi : 08h00 pile à 16h30
• Samedi : 08h00 pile à 14h00
• Dimanche : Fermé (Départ des convois d'expédition vers Kinshasa)

📦 NOS MODES DE TRAVAIL POUR CHAQUE COMMANDE :
1. Acompte & Paiement : Acompte de 70% obligatoire pour les commandes supérieures à 200$, solde réglé à la livraison à Kinshasa.
2. Expéditions convoi : Tous vos colis partent chaque samedi matin par convoi transitaire sécurisé vers Kinshasa.
3. Messagerie & Suivi : Vous pouvez échanger directement avec la direction ici et suivre vos commandes en direct.

📌 Ce message officiel reste fixé en première position de nos échanges pour que vous puissiez toujours vous référer à nos horaires et nos conditions.`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        read: true,
      };

      db.chatMessages.push(welcomeMsg);
    }

    // Notification administrative persistante (visible seulement dans la session admin)
    const newNotif: ServerNotification = {
      id: `notif-${Date.now()}`,
      type: 'customer',
      title: 'Nouveau Compte Client Actif',
      message: `${customerToReturn.fullName} (${customerToReturn.phone}) a ouvert son compte client. Compte actif immédiatement.`,
      createdAt: new Date().toISOString(),
      read: false,
      customerId: customerToReturn.id,
    };

    db.notifications.unshift(newNotif);
    if (db.notifications.length > 100) {
      db.notifications = db.notifications.slice(0, 100);
    }

    saveDatabase(db);
    console.log(`[API] Client inscrit: ${customerToReturn.fullName} (${customerToReturn.phone}) - Compte Validé Directement`);
    res.json({ success: true, customer: customerToReturn, notification: newNotif });
  });

  // Mise à jour d'un client par l'administrateur (bloquer, débloquer, modifier profil, avatar, location)
  app.patch('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const { status, notes, fullName, phone, city, address, avatar, location, isBlocked, blockedReason } = req.body;

    const customerIndex = db.customers.findIndex((c) => c.id === id);
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    const current = db.customers[customerIndex];
    const willBeBlocked = status === 'bloque' || isBlocked === true;
    const willBeValid = status === 'valide' || isBlocked === false;

    const updatedCustomer: Customer = {
      ...current,
      status: willBeBlocked ? 'bloque' : (willBeValid ? 'valide' : (status || current.status)),
      isBlocked: willBeBlocked ? true : (willBeValid ? false : Boolean(current.isBlocked)),
      blockedAt: willBeBlocked ? (current.blockedAt || new Date().toISOString()) : undefined,
      blockedReason: willBeBlocked ? (blockedReason || current.blockedReason || 'Compte suspendu par l\'administrateur') : undefined,
      pendingVerification: false,
      notes: notes !== undefined ? notes : current.notes,
      fullName: fullName || current.fullName,
      phone: phone || current.phone,
      city: city || current.city,
      address: address || current.address,
      avatar: avatar !== undefined ? avatar : current.avatar,
      location: location !== undefined ? location : current.location,
      validatedAt: willBeValid ? (current.validatedAt || new Date().toISOString().replace('T', ' ').substring(0, 16)) : current.validatedAt,
    };

    db.customers[customerIndex] = updatedCustomer;
    saveDatabase(db);
    console.log(`[API] Client mis à jour: ${updatedCustomer.fullName} -> Statut: ${updatedCustomer.status} (Bloqué: ${updatedCustomer.isBlocked})`);
    res.json({ success: true, customer: updatedCustomer });
  });

  // Suppression d'un client
  app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    db.customers = db.customers.filter((c) => c.id !== id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 4. Orders API
  app.get('/api/orders', (req, res) => {
    res.json(db.orders);
  });

  // Nouvelle commande passée par un client
  app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    if (!orderData || !orderData.items) {
      return res.status(400).json({ error: 'Données de commande invalides' });
    }

    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `ord-${Date.now()}`,
      createdAt: orderData.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    db.orders.unshift(newOrder);

    // Mettre à jour les stocks de produits sur le serveur
    if (Array.isArray(newOrder.items)) {
      newOrder.items.forEach((item) => {
        const prodIndex = db.products.findIndex((p) => p.id === item.productId);
        if (prodIndex >= 0) {
          db.products[prodIndex].stock = Math.max(0, db.products[prodIndex].stock - (item.quantity || 1));
        }
      });
    }

    // Notification administrateur
    const orderNotif: ServerNotification = {
      id: `notif-ord-${Date.now()}`,
      type: 'order',
      title: 'Nouvelle Commande Reçue !',
      message: `Commande ${newOrder.orderNumber} par ${newOrder.customerName} (${newOrder.customerPhone}) - Total: $${newOrder.total}`,
      createdAt: new Date().toISOString(),
      read: false,
      orderId: newOrder.id,
      customerId: newOrder.customerId,
    };
    db.notifications.unshift(orderNotif);

    saveDatabase(db);
    console.log(`[API] Nouvelle commande: ${newOrder.orderNumber} pour ${newOrder.customerName}`);
    res.json({ success: true, order: newOrder });
  });

  // Décision ou mise à jour de commande par l'administrateur
  app.patch('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const orderIndex = db.orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    db.orders[orderIndex] = {
      ...db.orders[orderIndex],
      ...updates,
    };

    saveDatabase(db);
    console.log(`[API] Commande ${db.orders[orderIndex].orderNumber} mise à jour: Statut ${db.orders[orderIndex].status}`);
    res.json({ success: true, order: db.orders[orderIndex] });
  });

  // 5. Chat API (avec photos multiples)
  app.get('/api/chat', (req, res) => {
    res.json(db.chatMessages);
  });

  app.post('/api/chat', (req, res) => {
    const { customerId, customerName, customerPhone, sender, text, images, orderId } = req.body;

    if (!customerId || (!text && (!images || images.length === 0))) {
      return res.status(400).json({ error: 'Message ou photo requis' });
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderId,
      customerId,
      customerName: customerName || 'Client Moto',
      customerPhone: customerPhone || '',
      sender: sender || 'client',
      text: (text || '').trim(),
      images: Array.isArray(images) ? images : [],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: sender === 'admin',
    };

    db.chatMessages.push(newMsg);

    // Si le message provient du client, créer une notification admin
    if (sender === 'client') {
      const chatNotif: ServerNotification = {
        id: `notif-chat-${Date.now()}`,
        type: 'chat',
        title: `Message de ${newMsg.customerName}`,
        message: newMsg.text
          ? newMsg.text.substring(0, 60) + (newMsg.text.length > 60 ? '...' : '')
          : `A envoyé ${newMsg.images?.length || 1} photo(s)`,
        createdAt: new Date().toISOString(),
        read: false,
        customerId: newMsg.customerId,
      };
      db.notifications.unshift(chatNotif);
    }

    saveDatabase(db);
    res.json({ success: true, message: newMsg });
  });

  // Marquer messages lus
  app.patch('/api/chat/read', (req, res) => {
    const { customerId } = req.body;
    if (customerId) {
      db.chatMessages.forEach((m) => {
        if (m.customerId === customerId) {
          m.read = true;
        }
      });
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  // 6. Settings API
  app.get('/api/settings', (req, res) => {
    res.json(db.settings);
  });

  app.put('/api/settings', (req, res) => {
    const newSettings = req.body;
    db.settings = { ...db.settings, ...newSettings };
    saveDatabase(db);
    res.json({ success: true, settings: db.settings });
  });

  // 7. Products API (Stock, etc.)
  app.get('/api/products', (req, res) => {
    res.json(db.products);
  });

  app.patch('/api/products/:id/stock', (req, res) => {
    const { id } = req.params;
    const { newStock } = req.body;
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx >= 0) {
      db.products[idx].stock = Number(newStock);
      saveDatabase(db);
      return res.json({ success: true, product: db.products[idx] });
    }
    res.status(404).json({ error: 'Produit non trouvé' });
  });

  // 8. Notifications API
  app.get('/api/notifications', (req, res) => {
    res.json(db.notifications);
  });

  app.patch('/api/notifications/read', (req, res) => {
    const { id } = req.body;
    if (id) {
      const notif = db.notifications.find((n) => n.id === id);
      if (notif) notif.read = true;
    } else {
      db.notifications.forEach((n) => (n.read = true));
    }
    saveDatabase(db);
    res.json({ success: true });
  });

  // =========================================================================
  // VITE DEV SERVER OU FICHIERS STATIQUES EN PRODUCTION
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 SERVEUR HOUSSETECH CONNECTÉ SUR LE PORT ${PORT}`);
    console.log(`📦 Base de données centrale active : ${DB_FILE}`);
    console.log(`👥 Synchronisation multi-appareils (Clients & Admin) prête`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Erreur démarrage serveur:', err);
  process.exit(1);
});
