import { Product, StoreSettings, Customer, Order, ChatMessage } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  companyName: 'HOUSSETECH',
  companyPhone: '+243900042404', // Numéro officiel public, inscriptions & WhatsApp gérant direct
  secretPaymentPhone: '+243844885529', // Numéro secret pour paiement & réception capture d'écran
  companyEmail: 'contact@houssetech.com',
  companyCity: 'Kinshasa / Lubumbashi',
  companyAddress: 'Avenue des Huileries, Quartier Industriel',
  tiktokUrl: 'https://www.tiktok.com/@houssetech_moto',
  whatsappUrl: '',
  depositThreshold: 200, // 200$
  depositPercentage: 70, // 70%
  currency: '$',
  adminPin: '1234',
  adminPassword: 'Albastuz3d@', // Mot de passe officiel demandé par le gérant
  adminAuthEmail: 'nathankakina620@gmail.com', // Compte Google de confirmation 2FA
  shippingScheduleNote: 'Expédition chaque samedi matin vers Kinshasa',
  freeDeliveryThreshold: 200, // Livraison GRATUITE dès 200$ d'achat !
  announcementText: '🚀 HOUSSETECH : Livraison 100% GRATUITE dès 200$ d\'achat ! Pièces en stock immédiat & pièces sur commande expédiées chaque samedi matin.',
  mobileMoneyAccounts: [
    {
      id: 'mm-1',
      operator: 'M-Pesa / Vodacom',
      number: '+243 844 885 529', // Numéro de paiement
      holderName: 'HOUSSETECH SARL',
    },
    {
      id: 'mm-2',
      operator: 'Airtel Money',
      number: '+243 844 885 529',
      holderName: 'HOUSSETECH SARL',
    },
    {
      id: 'mm-3',
      operator: 'Orange Money',
      number: '+243 844 885 529',
      holderName: 'HOUSSETECH DIRECT',
    },
  ],
};

export const INITIAL_PRODUCTS: Product[] = [
  // 1. PRODUIT SUR COMMANDE (À commander par le client)
  {
    id: 'prod-1',
    name: 'Ligne Complète Échappement Akrapovič Titane Racing',
    category: 'Échappement',
    brand: 'Akrapovič',
    compatibleModels: ['Yamaha MT-09', 'Yamaha Tracer 9 GT', 'Yamaha XSR 900 (2021-2025)'],
    price: 890,
    originalPrice: 980,
    stock: 0,
    availabilityType: 'sur_commande', // Angle SUR COMMANDE
    sku: 'AKRA-S-Y9R15-HAPT',
    condition: 'Performance Racing',
    shortDescription: 'Ligne complète en titane avec silencieux carbone sur commande spéciale. Gain de poids de 4.2 kg et gain de puissance +5.3 ch.',
    description: 'PRODUIT À COMMANDER : La référence absolue pour Yamaha 3 cylindres. Fabriquée en titane de qualité aérospatiale avec embout en fibre de carbone véritable. Sonorité profonde et envoûtante homologuée avec chicane amovible. Expédiée dans le convoi du samedi matin dès validation de l\'acompte de 70%.',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    reviewsCount: 28,
    isFeatured: true,
    isPromo: true,
    specifications: {
      'Disponibilité': 'Sur commande spéciale (Expédition Samedi)',
      'Matériau tubulure': 'Titane haute résistance',
      'Enveloppe silencieux': 'Carbone mat verni',
      'Poids net': '4.1 kg (-4.2 kg vs origine)',
      'Homologation': 'Euro 5 avec convertisseur',
      'Fabrication': 'Slovénie',
    },
  },
  // 2. PRODUIT EN STOCK (Disponible immédiatement)
  {
    id: 'prod-2',
    name: 'Disque de Frein Flottant Avant Brembo Serie Oro 320mm',
    category: 'Freinage',
    brand: 'Brembo',
    compatibleModels: ['Honda CBR600RR', 'Honda CBR1000RR Fireblade', 'CB1000R'],
    price: 240,
    originalPrice: 275,
    stock: 8,
    availabilityType: 'en_stock', // Angle EN STOCK
    sku: 'BREM-78B40871',
    condition: 'Performance Racing',
    shortDescription: 'Disque racing flottant 320mm frette alu dorée pour un freinage puissant et endurant sans fading.',
    description: 'PRODUIT EN STOCK DISPONIBLE IMMÉDIATEMENT : Disque flottant d\'origine Brembo composé d\'une piste de freinage en acier inoxydable martensitique reliée par 10 douilles d\'entraînement à une frette en alliage d\'aluminium anodisé or. En stock physique dans nos dépôts pour retrait ou livraison rapide.',
    images: [
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.8,
    reviewsCount: 42,
    isFeatured: true,
    isPromo: false,
    specifications: {
      'Disponibilité': 'En stock immédiat (Dépôt Kinshasa)',
      'Diamètre extérieur': '320 mm',
      'Diamètre intérieur': '94 mm',
      'Épaisseur': '5.0 mm',
      'Type': 'Flottant haute dissipation thermique',
    },
  },
  // 3. PRODUIT EN STOCK (Disponible immédiatement)
  {
    id: 'prod-3',
    name: 'Kit Chaîne Renforcé D.I.D Or & Noir 525VX3 X-Ring',
    category: 'Transmission & Chaîne',
    brand: 'D.I.D',
    compatibleModels: ['Yamaha MT-07', 'Kawasaki Z650', 'Suzuki SV650', 'Honda CB500F'],
    price: 155,
    originalPrice: 175,
    stock: 15,
    availabilityType: 'en_stock', // Angle EN STOCK
    sku: 'DID-525VX3-114GL',
    condition: 'Adaptable Haute Qualité',
    shortDescription: 'Chaîne X-Ring ultra renforcée avec pignon trempé et couronne acier traité C49. Longévité maximale.',
    description: 'PRODUIT EN STOCK DISPONIBLE IMMÉDIATEMENT : Le kit transmission N°1 mondial. La technologie exclusive X-Ring réduit la friction de moitié tout en doublant la résistance à l\'usure comparé à un joint torique standard. Livré complet avec attache à river.',
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    reviewsCount: 65,
    isFeatured: true,
    isPromo: true,
    specifications: {
      'Disponibilité': 'En stock immédiat',
      'Pas de chaîne': '525',
      'Type de joint': 'X-Ring breveté D.I.D',
      'Maillons': '114 maillons avec attache à river',
      'Pignon': 'Acier trempé 16 dents',
      'Couronne': 'Acier haute résistance 43 dents',
    },
  },
  // 4. PRODUIT SUR COMMANDE (À commander)
  {
    id: 'prod-4',
    name: 'Amortisseur Arrière Réglable Racing Öhlins STX 46',
    category: 'Suspension & Direction',
    brand: 'Öhlins',
    compatibleModels: ['Yamaha MT-07 (2014-2024)', 'Yamaha XSR 700'],
    price: 680,
    originalPrice: 750,
    stock: 0,
    availabilityType: 'sur_commande', // Angle SUR COMMANDE
    sku: 'OHL-YA419-STX46',
    condition: 'Performance Racing',
    shortDescription: 'Mono-amortisseur pressurisé avec bonbonne séparée, précharge hydraulique et réglage détente/compression.',
    description: 'PRODUIT À COMMANDER : Transforme radicalement le comportement de votre moto. Conçu par les ingénieurs du MotoGP pour offrir un grip exemplaire, une motricité constante et un confort supérieur sur route comme sur piste. Commande avec acompte de 70% et expédition chaque samedi.',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 5.0,
    reviewsCount: 19,
    isFeatured: true,
    isPromo: false,
    specifications: {
      'Disponibilité': 'Sur commande (Départ Samedi)',
      'Piston': '46 mm monotube',
      'Réglages': 'Détente, compression et précharge ressort',
      'Bonbonne': 'Gaz azote sous pression',
      'Garantie': '2 ans constructeur',
    },
  },
  // 5. PRODUIT EN STOCK (Disponible immédiatement)
  {
    id: 'prod-5',
    name: 'Piston Forgé Haute Compression Vertex Ø77mm 4T',
    category: 'Moteur & Piston',
    brand: 'Vertex',
    compatibleModels: ['KTM 250 SX-F', 'Husqvarna FC 250', 'GasGas MC 250F (2019-2024)', 'Boxer BM 150'],
    price: 185,
    originalPrice: 210,
    stock: 7,
    availabilityType: 'en_stock', // Angle EN STOCK
    sku: 'VTX-24322B-77',
    condition: 'Performance Racing',
    shortDescription: 'Piston forgé en alliage d\'aluminium aérospatiale avec revêtement bisulfure de molybdène antifriction.',
    description: 'PRODUIT EN STOCK DISPONIBLE IMMÉDIATEMENT : Piston haute performance forgé pour moteurs 4 temps. Augmente le taux de compression, la réponse aux gaz et la vitesse maximale du piston. 4 photos disponibles. En stock dans nos ateliers pour expédition rapide.',
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.7,
    reviewsCount: 31,
    isFeatured: false,
    isPromo: true,
    specifications: {
      'Disponibilité': 'En stock immédiat',
      'Diamètre nominal': '76.96 mm (Côte B)',
      'Taux de compression': '14.4:1',
      'Inclus': 'Piston, segments, axe nitruré et circlips',
    },
  },
  // 6. PRODUIT EN STOCK (Disponible immédiatement)
  {
    id: 'prod-6',
    name: 'Pneu Arrière Michelin Road 6 180/55 ZR17 73W',
    category: 'Pneumatique & Jantes',
    brand: 'Michelin',
    compatibleModels: ['Yamaha MT-09', 'Kawasaki Z900', 'Honda CB650R', 'BMW F900R', 'Ducati Monster'],
    price: 215,
    originalPrice: 235,
    stock: 12,
    availabilityType: 'en_stock', // Angle EN STOCK
    sku: 'MICH-RD6-1805517',
    condition: 'Neuf d\'origine',
    shortDescription: 'Adhérence phénoménale sur sol mouillé et +10% de longévité par rapport au Road 5 grâce au composé 2CT+.',
    description: 'PRODUIT EN STOCK DISPONIBLE IMMÉDIATEMENT : Le pneu de référence pour rouler par tous les temps. Gomme 100% silice et technologie de lamelles Michelin Water Evergrip pour une évacuation continue même à 50% d\'usure. En stock à Kinshasa.',
    images: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.9,
    reviewsCount: 88,
    isFeatured: true,
    isPromo: false,
    specifications: {
      'Disponibilité': 'En stock immédiat',
      'Dimension': '180/55 ZR17 M/C',
      'Indice charge/vitesse': '73W (jusqu\'à 270 km/h)',
      'Technologie': 'Bi-gomme 2CT+ radial',
    },
  },
  // 7. PRODUIT SUR COMMANDE (À commander)
  {
    id: 'prod-7',
    name: 'Carburateur Racing Mikuni TM28 Boisseau Plat',
    category: 'Moteur & Piston',
    brand: 'Mikuni',
    compatibleModels: ['Yamaha DT 125', 'Honda CG 125', 'TVS Apache 160', 'Bajaj Boxer 150'],
    price: 195,
    originalPrice: 220,
    stock: 0,
    availabilityType: 'sur_commande', // Angle SUR COMMANDE
    sku: 'MIK-TM28-FLAT',
    condition: 'Performance Racing',
    shortDescription: 'Carburateur à boisseau plat authentique Mikuni Japon pour reprise instantanée et gain de puissance à haut régime.',
    description: 'PRODUIT À COMMANDER : Vous pouvez commander ce carburateur haute précision importé directement du Japon. Idéal pour optimiser les moteurs 2 temps et 4 temps à Kinshasa. Convoi d\'expédition chaque samedi matin. Versement acompte requis pour commande ferme.',
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.8,
    reviewsCount: 14,
    isFeatured: false,
    isPromo: false,
    specifications: {
      'Disponibilité': 'Sur commande (Départ Samedi)',
      'Diamètre venturi': '28 mm',
      'Type boisseau': 'Plat chromé dur',
      'Gicleur principal': '180 inclus',
      'Origine': 'Fabriqué au Japon',
    },
  },
  // 8. PRODUIT EN STOCK (Disponible immédiatement)
  {
    id: 'prod-8',
    name: 'Huile Moteur Motul 300V Factory Line 10W40 4T (Bidon 4L)',
    category: 'Huiles & Entretien',
    brand: 'Motul',
    compatibleModels: ['Toutes motos 4T sportives, roadsters et utilitaires'],
    price: 95,
    originalPrice: 110,
    stock: 24,
    availabilityType: 'en_stock', // Angle EN STOCK
    sku: 'MOT-300V-10W40-4L',
    condition: 'Neuf d\'origine',
    shortDescription: 'Lubrifiant 100% Synthèse haute performance avec technologie ESTER Core® pour protection extrême du moteur et boîte de vitesses.',
    description: 'PRODUIT EN STOCK DISPONIBLE IMMÉDIATEMENT : Huile de compétition officielle. Résistance exceptionnelle du film d\'huile à très haute température. Réduit l\'usure et optimise les passages de vitesses sous fortes chaleurs à Kinshasa.',
    images: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 5.0,
    reviewsCount: 52,
    isFeatured: true,
    isPromo: false,
    specifications: {
      'Disponibilité': 'En stock immédiat (24 bidons dispo)',
      'Viscosité': '10W-40',
      'Technologie': 'ESTER Core® 100% Synthèse',
      'Volume': 'Bidon 4 Litres',
      'Normes': 'Dépasse les exigences JASO MA2',
    },
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'Jean-Pierre Kabangu',
    phone: '+243812345678',
    city: 'Kinshasa (Gombe)',
    address: 'Av. Justice N°14',
    registeredAt: '2026-10-10 14:20',
    status: 'en_attente_validation',
    pendingVerification: true,
    validationCode: 'VAL-7821',
    notes: 'Demande envoyée au numéro de l\'entreprise +243900042404',
  },
  {
    id: 'cust-2',
    fullName: 'David Mbemba',
    phone: '+243998112233',
    city: 'Kinshasa (Limete)',
    address: '7ème Rue Résidentiel',
    registeredAt: '2026-10-09 11:05',
    status: 'valide',
    pendingVerification: false,
    validationCode: 'VAL-4419',
    validatedAt: '2026-10-09 11:30',
    notes: 'Compte validé par le gérant HOUSSETECH',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'HT-2026-1001',
    customerId: 'cust-2',
    customerName: 'David Mbemba',
    customerPhone: '+243998112233',
    city: 'Kinshasa',
    deliveryAddress: '7ème Rue Résidentiel, Limete',
    items: [
      {
        productId: 'prod-1',
        name: 'Ligne Complète Échappement Akrapovič Titane Racing',
        brand: 'Akrapovič',
        price: 890,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 890,
    deliveryFee: 0, // Commande >= 200$ -> Livraison GRATUITE !
    isFreeDelivery: true,
    total: 890,
    isDepositRequired: true,
    depositRate: 0.70,
    depositAmount: 623.0, // 70% de 890$
    remainingBalance: 267.0, // 30% restant
    isDepositPaid: true,
    depositPaidAt: '2026-10-10 16:45',
    paymentMethod: 'mpesa',
    paymentReference: 'MPESA-TX-8839201',
    paymentScreenshot: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    status: 'arrive_a_kinshasa', // Arrivé à Kinshasa ! Permet de tester la notation 3x 5 étoiles !
    adminDecision: 'acceptee',
    createdAt: '2026-10-10 15:30',
    shippingSchedule: 'Expédié samedi matin',
    shippingBatch: 'cette_semaine',
    orderCutoffNotice: 'Expédié vers Kinshasa',
    notes: 'Acompte reçu. Colis arrivé au dépôt HOUSSETECH de Kinshasa.',
    rating: {
      speedStars: 5,
      qualityStars: 5,
      deliveryStars: 4,
      comment: 'Superbe échappement Akrapovic original bien emballé et arrivé à Kinshasa à temps !',
      ratedAt: '2026-10-11 11:20',
    },
  },
  {
    id: 'ord-1002',
    orderNumber: 'HT-2026-1002',
    customerName: 'Michel Tshimanga',
    customerPhone: '+243823445566',
    city: 'Kinshasa',
    deliveryAddress: 'Bandalungwa, Av. Kasa-Vubu',
    items: [
      {
        productId: 'prod-3',
        name: 'Kit Chaîne Renforcé D.I.D Or & Noir 525VX3',
        brand: 'D.I.D',
        price: 155,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 155,
    deliveryFee: 15, // < 200$ -> Livraison payante
    isFreeDelivery: false,
    total: 170,
    isDepositRequired: false,
    depositRate: 0.70,
    depositAmount: 0,
    remainingBalance: 170,
    isDepositPaid: false,
    paymentMethod: 'cash_livraison',
    status: 'policier_transitaire', // Étape contrôle policier / transitaire
    adminDecision: 'acceptee',
    createdAt: '2026-10-11 08:45',
    shippingSchedule: 'Expédié samedi matin',
    shippingBatch: 'cette_semaine',
    orderCutoffNotice: 'En cours de transport',
    notes: 'Passage contrôle policier et transitaire en cours vers Kinshasa.',
  },
  {
    id: 'ord-1003',
    orderNumber: 'HT-2026-1003',
    customerName: 'Patrice Ilunga',
    customerPhone: '+243810022334',
    city: 'Kinshasa',
    deliveryAddress: 'Gombe, Av. du Port',
    items: [
      {
        productId: 'prod-4',
        name: 'Amortisseur Arrière Réglable Racing Öhlins STX 46',
        brand: 'Öhlins',
        price: 680,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 680,
    deliveryFee: 0,
    isFreeDelivery: true,
    total: 680,
    isDepositRequired: true,
    depositRate: 0.70,
    depositAmount: 476.0, // 70% de 680$
    remainingBalance: 204.0,
    isDepositPaid: false,
    paymentMethod: 'airtel_money',
    status: 'en_attente_approbation', // En attente du clic "Accepter la commande" ou "Refuser la commande" par le gérant HOUSSETECH !
    adminDecision: 'en_attente',
    createdAt: '2026-10-11 12:10',
    shippingSchedule: 'Expédié samedi matin',
    shippingBatch: 'cette_semaine',
    orderCutoffNotice: 'En attente de validation',
    notes: 'Nouvelle commande passée par le client. Le gérant HOUSSETECH doit appuyer sur Accepter ou Refuser.',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-cust-2',
    customerId: 'cust-2',
    customerName: 'David Mbemba',
    customerPhone: '+243998112233',
    sender: 'admin',
    text: `🏢 BIENVENUE CHEZ HOUSSETECH — INFORMATIONS OFFICIELLES DE L'ENTREPRISE

Bonjour David Mbemba, votre compte client a été créé avec succès ! Voici nos horaires officiels et nos modes de travail pour chacune de vos commandes :

🕒 NOS HEURES DE TRAVAIL OFFICIELLES :
• Lundi au Vendredi : 08h00 pile à 16h30
• Samedi : 08h00 pile à 14h00
• Dimanche : Fermé (Départ des convois d'expédition vers Kinshasa)

📦 NOS MODES DE TRAVAIL POUR CHAQUE COMMANDE :
1. Règle d'acompte : Acompte de 70% obligatoire pour toute commande supérieure à 200$, le solde restant (30%) est réglé à la livraison à Kinshasa.
2. Expéditions convoi : Tous vos colis partent chaque samedi matin par convoi transitaire sécurisé vers Kinshasa.
3. Validation officielle : Chaque article commandé est validé par l'administrateur (Articles acceptés vs Articles en attente).
4. Suivi & Reçu : Suivi en temps réel de votre colis et reçu officiel PDF téléchargeable avec QR Code.

📌 Ce message officiel reste fixé en premier position au sommet de nos échanges pour que vous puissiez toujours vous y référer.`,
    createdAt: '2026-10-10 08:00',
    read: true,
  },
  {
    id: 'msg-1',
    customerId: 'cust-2',
    customerName: 'David Mbemba',
    customerPhone: '+243998112233',
    sender: 'client',
    text: 'Bonjour HOUSSETECH ! Mon colis d\'échappement Akrapovic commandé sera-t-il bien expédié ce samedi matin ?',
    createdAt: '2026-10-10 16:50',
    read: true,
  },
  {
    id: 'msg-2',
    customerId: 'cust-2',
    customerName: 'David Mbemba',
    customerPhone: '+243998112233',
    sender: 'admin',
    text: 'Bonjour David ! Oui absolument, votre acompte de 70% a bien été vérifié par HOUSSETECH. Votre colis est emballé et partira avec le convoi de samedi matin vers Kinshasa.',
    createdAt: '2026-10-10 17:05',
    read: true,
  },
];
