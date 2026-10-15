export type ProductCategory =
  | 'Moteur & Piston'
  | 'Freinage'
  | 'Transmission & Chaîne'
  | 'Échappement'
  | 'Électrique & Éclairage'
  | 'Pneumatique & Jantes'
  | 'Carénage & Protection'
  | 'Huiles & Entretien'
  | 'Suspension & Direction';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  compatibleModels: string[];
  price: number; // In USD ($)
  originalPrice?: number;
  stock: number;
  availabilityType: 'en_stock' | 'sur_commande'; // Angle "En Stock" vs Angle "Sur Commande (À commander)"
  shortDescription: string;
  description: string;
  images: string[]; // Minimum 4 photos pour les produits
  sku: string;
  condition: 'Neuf d\'origine' | 'Performance Racing' | 'Adaptable Haute Qualité';
  specifications: Record<string, string>;
  isFeatured?: boolean;
  isPromo?: boolean;
  rating: number;
  reviewsCount: number;
  tiktokVideoUrl?: string; // Optionnel : lien vidéo TikTok de démo de la pièce
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type CustomerStatus = 'en_attente_validation' | 'valide' | 'rejete';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  address?: string;
  registeredAt: string;
  status: CustomerStatus;
  pendingVerification?: boolean;
  validationCode: string;
  validatedAt?: string;
  notes?: string;
}

export type OrderTrackingStep =
  | 'en_attente_approbation' // Step 1: Admin needs to click Accepter / Refuser
  | 'acceptee'               // Step 2: Commande acceptée par le gérant
  | 'en_attente_acompte'     // En attente versement de l'acompte 70%
  | 'acompte_recu'           // Acompte 70% reçu et vérifié
  | 'en_preparation'         // Colis préparé et emballé
  | 'policier_transitaire'   // Step 3: Passage policier / contrôle transitaire
  | 'en_expedition_kinshasa' // Step 4: En route vers Kinshasa (départ samedi matin)
  | 'arrive_a_kinshasa'      // Step 5: Colis arrivé à Kinshasa (déclenche la notation 3x 5 étoiles!)
  | 'livree'                 // Step 6: Colis livré et soldé
  | 'refusee';               // Refusée par l'administrateur

export type PaymentMethod =
  | 'mobile_money'
  | 'airtel_money'
  | 'mpesa'
  | 'orange_money'
  | 'wave'
  | 'virement'
  | 'cash_livraison';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderRating {
  speedStars: number;       // 1 à 5 étoiles pour la rapidité
  qualityStars: number;     // 1 à 5 étoiles pour la qualité du colis
  deliveryStars: number;    // 1 à 5 étoiles pour la livraison
  comment?: string;
  ratedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number; // 0 if subtotal >= 200$
  isFreeDelivery: boolean;
  total: number;
  isDepositRequired: boolean; // True if total > 200$
  depositRate: number; // 0.70
  depositAmount: number; // 70%
  remainingBalance: number; // 30%
  isDepositPaid: boolean;
  depositPaidAt?: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentScreenshot?: string;
  status: OrderTrackingStep;
  adminDecision?: 'acceptee' | 'refusee' | 'en_attente';
  adminDecisionReason?: string;
  createdAt: string;
  shippingSchedule: string; // Ex: "Expédié Samedi 17 Octobre"
  shippingBatch: 'cette_semaine' | 'semaine_prochaine'; // Selon la règle du mercredi 12h
  orderCutoffNotice: string;
  notes?: string;
  rating?: OrderRating;
}

export interface ChatMessage {
  id: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  sender: 'client' | 'admin';
  text: string;
  images?: string[]; // Une ou plusieurs photos attachées au message
  createdAt: string;
  read: boolean;
}

export interface MobileMoneyAccount {
  id: string;
  operator: string;
  number: string;
  holderName: string;
}

export interface StoreSettings {
  companyName: string; // "HOUSSETECH"
  companyPhone: string; // +243900042404
  secretPaymentPhone: string; // +243844885529
  tiktokUrl: string; // Lien TikTok de la boutique pour les vidéos de nos articles
  whatsappUrl: string; // Lien WhatsApp direct configurable
  companyEmail: string;
  companyCity: string;
  companyAddress: string;
  depositThreshold: number; // 200$
  depositPercentage: number; // 70%
  currency: string; // "$"
  adminPin: string; // Default: 1234
  adminPassword?: string; // Mot de passe administrateur sécurisé (ex: Albastuz3d@)
  adminAuthEmail?: string; // Email Google lié pour le code d'authentification (nathankakina620@gmail.com)
  shippingScheduleNote: string;
  freeDeliveryThreshold: number; // 200$
  mobileMoneyAccounts: MobileMoneyAccount[];
  announcementText: string;
}
