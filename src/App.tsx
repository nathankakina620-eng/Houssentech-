import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { DepositNoticeBanner } from './components/DepositNoticeBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminAuthModal } from './components/Admin/AdminAuthModal';
import { InSiteChatModal } from './components/Chat/InSiteChatModal';
import { OrderTrackingModal } from './components/Tracking/OrderTrackingModal';
import { OrderReceiptModal } from './components/Receipt/OrderReceiptModal';
import { MobileAppShell } from './components/MobileAppShell';
import { OfflineIndicator } from './components/PWA/OfflineIndicator';
import { PWAInstallButton } from './components/PWA/PWAInstallButton';
import { Product, ProductCategory, Order } from './types';
import {
  Wrench,
  Truck,
  ShieldCheck,
  Calendar,
  Sparkles,
  Flame,
  CheckCircle2,
  DollarSign,
  Phone,
  MessageCircle,
  Filter,
  Package,
  Lock,
  Bell,
  X,
} from 'lucide-react';

const CATEGORIES: ('Tous' | ProductCategory)[] = [
  'Tous',
  'Moteur & Piston',
  'Freinage',
  'Transmission & Chaîne',
  'Échappement',
  'Électrique & Éclairage',
  'Pneumatique & Jantes',
  'Carénage & Protection',
  'Huiles & Entretien',
  'Suspension & Direction',
];

function StoreContent() {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    settings,
    isAdmin,
    getWhatsAppUrl,
    newCustomerToast,
    dismissNewCustomerToast,
  } = useStore();

  // Détection des liens partagés (?register=true, ?login=true, etc.)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('register') === 'true' || params.get('join') === 'true' || params.get('inscription') === 'true') {
        setIsRegisterOpen(true);
      } else if (params.get('login') === 'true' || params.get('connexion') === 'true') {
        setIsLoginOpen(true);
      } else if (params.get('tracking') === 'true' || params.get('colis') === 'true') {
        setIsTrackingOpen(true);
      } else if (params.get('admin') === 'true') {
        if (isAdmin) {
          setIsAdminOpen(true);
        } else {
          setIsAdminAuthOpen(true);
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, [isAdmin]);

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingInitialTab, setTrackingInitialTab] = useState<'orders' | 'tracking' | 'chat' | 'faq'>('orders');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Dedicated angle filter state: 'all' | 'stock' | 'order'
  const [viewAngle, setViewAngle] = useState<'all' | 'stock' | 'order'>('all');
  const inStockCount = products.filter((p) => p.availabilityType === 'en_stock' || p.stock > 0).length;
  const orderCount = products.filter((p) => p.availabilityType === 'sur_commande' || p.stock === 0).length;

  // Filter products by category, search and angle
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.compatibleModels &&
        p.compatibleModels.some((m) =>
          m.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    
    let matchesAngle = true;
    if (viewAngle === 'stock') {
      matchesAngle = p.availabilityType === 'en_stock' || p.stock > 0;
    } else if (viewAngle === 'order') {
      matchesAngle = p.availabilityType === 'sur_commande' || p.stock === 0;
    }

    return matchesCategory && matchesSearch && matchesAngle;
  });

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleOpenReceipt = (order: Order) => {
    setReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors pb-16 sm:pb-8">
      {/* Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenTracking={(tab) => {
          setTrackingInitialTab(tab || 'orders');
          setIsTrackingOpen(true);
        }}
        viewAngle={viewAngle}
        onSetAngle={setViewAngle}
        onOpenAdmin={() => {
          if (isAdmin) {
            setIsAdminOpen(true);
          } else {
            setIsAdminAuthOpen(true);
          }
        }}
      />

      {/* Alerte flottante en direct quand un nouveau client s'inscrit depuis son téléphone */}
      {newCustomerToast && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-slate-900 border-2 border-amber-500/80 shadow-2xl rounded-2xl p-4 text-slate-100 animate-fadeIn flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0">
                <Bell className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Nouveau Compte Client Reçu
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {newCustomerToast.customer.fullName}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {newCustomerToast.customer.phone} • {newCustomerToast.customer.city}
                </p>
              </div>
            </div>
            <button
              onClick={dismissNewCustomerToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                dismissNewCustomerToast();
                if (isAdmin) {
                  setIsAdminOpen(true);
                } else {
                  setIsAdminAuthOpen(true);
                }
              }}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition text-center cursor-pointer active:scale-98"
            >
              Valider ce compte
            </button>
            <button
              onClick={dismissNewCustomerToast}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Ignorer
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* 70% Deposit Rule & Saturday Shipping Notice Banner */}
        <DepositNoticeBanner />

        {/* Hero Features Bar (Free Delivery >= 200$, Saturday Expeditions, Direct WhatsApp) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white p-3.5 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-white dark:text-white light:text-slate-900">
                Livraison GRATUITE dès 200$
              </h4>
              <p className="text-[11px] text-slate-400">
                Frais de transport offerts pour tout achat égal ou supérieur à 200 dollars.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white p-3.5 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-white dark:text-white light:text-slate-900">
                Expédition Chaque Samedi Matin
              </h4>
              <p className="text-[11px] text-slate-400">
                Tous les colis commandés partent par convoi transitaire chaque samedi matin vers Kinshasa.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white p-3.5 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-red-500/15 text-red-400 rounded-xl border border-red-500/30 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-white dark:text-white light:text-slate-900">
                Contact Direct HOUSSETECH
              </h4>
              <p className="text-[11px] text-slate-400">
                Inscriptions & WhatsApp au <strong className="text-white dark:text-white light:text-slate-900 font-mono">{settings.companyPhone}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* KEY REQUIREMENT: LES DEUX ANGLES CLIENT (STOCK VS SUR COMMANDE) */}
        <div className="p-4 rounded-3xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Angles de Consultation HOUSSETECH</span>
              </span>
              <h2 className="text-sm sm:text-base font-black text-white dark:text-white light:text-slate-900">
                Choisissez votre angle de vue : En Stock ou Sur Commande
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Cliquez sur l'angle de votre choix pour filtrer instantanément le catalogue.
            </p>
          </div>

          {/* Les 3 Angles interactifs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* ANGLE 1 : PRODUITS EN STOCK */}
            <button
              onClick={() => setViewAngle('stock')}
              className={`p-3.5 rounded-2xl border text-left transition active:scale-98 flex flex-col justify-between gap-2 relative overflow-hidden ${
                viewAngle === 'stock'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-black text-xs uppercase tracking-wider text-emerald-400">
                    📦 ANGLE : EN STOCK
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] font-bold">
                  {inStockCount} dispo
                </span>
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white dark:text-white light:text-slate-900">
                  Produits Disponibles en Stock
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Présents physiquement dans nos dépôts à Kinshasa. Min. 4 photos par pièce, retrait ou livraison rapide.
                </p>
              </div>
            </button>

            {/* ANGLE 2 : PRODUITS SUR COMMANDE (À COMMANDER) */}
            <button
              onClick={() => setViewAngle('order')}
              className={`p-3.5 rounded-2xl border text-left transition active:scale-98 flex flex-col justify-between gap-2 relative overflow-hidden ${
                viewAngle === 'order'
                  ? 'bg-blue-950/70 border-blue-500 text-blue-200 ring-2 ring-blue-400/60 shadow-lg shadow-blue-950/40'
                  : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/20 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs">✈️</span>
                  <span className="font-black text-xs uppercase tracking-wider text-blue-400">
                    SUR COMMANDE
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[11px] font-bold">
                  {orderCount} à commander
                </span>
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white dark:text-white light:text-slate-900">
                  Produits à Commander
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Consultez la description complète des pièces que vous pouvez commander. Expédition samedi matin vers Kinshasa.
                </p>
              </div>
            </button>

            {/* ANGLE 3 : TOUT LE CATALOGUE */}
            <button
              onClick={() => setViewAngle('all')}
              className={`p-3.5 rounded-2xl border text-left transition active:scale-98 flex flex-col justify-between gap-2 relative overflow-hidden ${
                viewAngle === 'all'
                  ? 'bg-red-950/60 border-red-500 text-red-200 ring-2 ring-red-400/50 shadow-lg shadow-red-950/30'
                  : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-700">
                  ⚡ TOUT LE CATALOGUE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] font-bold">
                  {products.length} articles
                </span>
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white dark:text-white light:text-slate-900">
                  Tous nos Accessoires & Pièces
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Affiche à la fois les pièces en stock immédiat et les pièces commandables sur mesure.
                </p>
              </div>
            </button>
          </div>

          {/* Bannière d'angle active explicative */}
          {viewAngle === 'stock' && (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Angle Produits en Stock actif ({inStockCount} pièces)</strong> : Vous visualisez les pièces prêtes à être expédiées immédiatement. Chaque article comporte <strong>minimum 4 photos réelles</strong>.
                </span>
              </span>
              <button
                onClick={() => setViewAngle('all')}
                className="text-[11px] font-bold text-white underline hover:text-emerald-300 shrink-0"
              >
                Afficher tout
              </button>
            </div>
          )}

          {viewAngle === 'order' && (
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Angle Produits à Commander actif ({orderCount} pièces)</strong> : Cliquez sur n'importe quel article pour consulter sa <strong>description complète</strong>, son prix et programmer votre commande pour le départ de ce samedi matin.
                </span>
              </span>
              <button
                onClick={() => setViewAngle('all')}
                className="text-[11px] font-bold text-white underline hover:text-blue-300 shrink-0"
              >
                Afficher tout
              </button>
            </div>
          )}
        </div>

        {/* Categories Bar */}
        <div className="pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-red-500" />
                <span>Rayons & Catégories ({filteredProducts.length} pièces)</span>
              </h2>

              {searchQuery && (
                <span className="text-xs text-red-400 font-semibold">
                  (Recherche : « {searchQuery} »)
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-900/60 dark:bg-slate-900/60 light:bg-white rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">
              Aucune pièce trouvée
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Essayez un autre mot-clé ou réinitialisez la catégorie pour voir l'ensemble du catalogue moto.
            </p>
            <button
              onClick={() => setSelectedCategory('Tous')}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded-xl shadow-md transition"
            >
              Afficher toutes les pièces
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer avec accès administrateur discret tout en bas de page (invisible aux clients ordinaires) */}
      <footer className="mt-12 bg-slate-900 dark:bg-slate-900 light:bg-white border-t border-slate-800 dark:border-slate-800 light:border-slate-200 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                H
              </div>
              <span className="font-bold text-white dark:text-white light:text-slate-900">
                {settings.companyName}
              </span>
            </div>
            <div className="text-center sm:text-right space-y-0.5 text-[11px]">
              <p>
                Numéro officiel & Inscriptions : <strong className="text-white dark:text-white light:text-slate-900 font-mono">{settings.companyPhone}</strong>
              </p>
              <p>
                Règle d'acompte : 70% pour toute commande supérieure à 200$ • Expéditions chaque samedi matin
              </p>
            </div>
          </div>

          {/* Ligne discrète tout en bas de fil pour le gérant de la boutique */}
          <div className="pt-4 border-t border-slate-800/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} HOUSSETECH SARL. Tous droits réservés.</p>
            <button
              onClick={() => {
                if (isAdmin) {
                  setIsAdminOpen(true);
                } else {
                  setIsAdminAuthOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 dark:hover:text-slate-300 transition text-[10px] opacity-60 hover:opacity-100"
              title="Accès réservé exclusivement à la direction HOUSSETECH"
            >
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Espace sécurisé administration</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOpenRegister={() => {
          setIsCheckoutOpen(false);
          setIsRegisterOpen(true);
        }}
        onOpenReceipt={handleOpenReceipt}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onOpenTracking={() => {
          setIsRegisterOpen(false);
          setIsTrackingOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      {/* Authentification Administrateur (Mot de passe Albastuz3d@ + 2FA Google nathankakina620@gmail.com) */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsAdminOpen(true);
        }}
      />

      {/* Panneau Administration HOUSSETECH */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      <InSiteChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        onOpenReceipt={handleOpenReceipt}
        initialTab={trackingInitialTab}
      />

      <OrderReceiptModal
        order={receiptOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Mobile Shell Bar avec Stock, Message, Application et Panier */}
      <MobileAppShell
        activeView="home"
        onNavigateHome={() => {
          setSelectedCategory('Tous');
          setViewAngle('all');
        }}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAccount={() => setIsLoginOpen(true)}
        viewAngle={viewAngle}
        onSetAngle={setViewAngle}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
