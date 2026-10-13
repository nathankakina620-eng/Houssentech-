import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  ShieldCheck,
  Search,
  Wrench,
  Sun,
  Moon,
  MessageCircle,
  MessageSquare,
  Truck,
  Phone,
  LogIn,
  LogOut,
  Menu,
  X,
  Lock,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PWAInstallButton } from './PWA/PWAInstallButton';

interface Props {
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenChat: () => void;
  onOpenTracking: () => void;
  viewAngle: 'all' | 'stock' | 'order';
  onSetAngle: (angle: 'all' | 'stock' | 'order') => void;
}

export const Header: React.FC<Props> = ({
  onOpenCart,
  onOpenLogin,
  onOpenRegister,
  onOpenChat,
  onOpenTracking,
  viewAngle,
  onSetAngle,
}) => {
  const {
    products,
    settings,
    currentUser,
    logout,
    theme,
    toggleTheme,
    cartItemsCount,
    unreadMessagesCount,
    searchQuery,
    setSearchQuery,
    loginAdmin,
    isAdmin,
    getWhatsAppUrl,
  } = useStore();

  const inStockCount = products.filter((p) => p.availabilityType === 'en_stock' || p.stock > 0).length;
  const orderCount = products.filter((p) => p.availabilityType === 'sur_commande' || p.stock === 0).length;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 dark:bg-slate-950/95 light:bg-white/95 backdrop-blur-md border-b border-slate-800 dark:border-slate-800 light:border-slate-200 transition-colors">
        {/* Top Mini Bar with phone & shipping alert */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-[11px] px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="font-bold flex items-center gap-1 shrink-0">
              <Truck className="w-3.5 h-3.5" />
              <span>HOUSSETECH : Expédition chaque samedi matin vers Kinshasa</span>
            </span>
            <span className="hidden md:inline text-white/80">•</span>
            <span className="hidden md:inline font-medium">
              🎁 Livraison 100% GRATUITE dès 200$ d'achats !
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={getWhatsAppUrl(`Bonjour HOUSSETECH (${settings.companyPhone}), je vous écris depuis votre boutique en ligne.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1 font-bold text-white"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Gérant :</span>
              <span className="font-mono">{settings.companyPhone}</span>
            </a>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand HOUSSETECH */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => onSetAngle('all')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-red-500/30 overflow-hidden flex items-center justify-center shadow-md shadow-red-600/25 group-hover:scale-105 group-hover:border-red-500 transition-all p-0.5">
                <img
                  src="/icon.svg"
                  alt="HOUSSETECH Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-white dark:text-white light:text-slate-900 block leading-tight">
                  HOUSSE<span className="text-red-500">TECH</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                  Pièces Moto & Expéditions Kinshasa
                </span>
              </div>
            </button>
          </div>

          {/* Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une pièce, modèle de moto (Yamaha, Honda, KTM...)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Dark Mode / Light Mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition"
              title={theme === 'dark' ? 'Passer en Mode Éclairage' : 'Passer en Mode Sombre'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Dedicated ANGLE STOCK Button */}
            <button
              onClick={() => onSetAngle(viewAngle === 'stock' ? 'all' : 'stock')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 ${
                viewAngle === 'stock'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300'
              }`}
              title="Angle Pièces en stock physique disponibles immédiatement"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>STOCK</span>
              <span className="hidden sm:inline text-[10px] font-mono opacity-90">
                ({inStockCount})
              </span>
            </button>

            {/* Dedicated ANGLE SUR COMMANDE Button */}
            <button
              onClick={() => onSetAngle(viewAngle === 'order' ? 'all' : 'order')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 ${
                viewAngle === 'order'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/50'
                  : 'bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300'
              }`}
              title="Angle Pièces à commander (Expédition convoi samedi)"
            >
              <span>✈️</span>
              <span>SUR COMMANDE</span>
              <span className="text-[10px] font-mono opacity-90">
                ({orderCount})
              </span>
            </button>

            {/* Suivi Colis & Angle Client Button */}
            <button
              onClick={onOpenTracking}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition"
              title="Ouvrir mon Angle Client (Commandes, Articles acceptés & Discussion gérant)"
            >
              <Truck className="w-3.5 h-3.5 text-red-400" />
              <span>Mon Angle Client</span>
            </button>

            {/* In-Site Chat Button */}
            <button
              onClick={onOpenChat}
              className="relative p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition"
              title="Discuter avec le gérant sur le site"
            >
              <MessageSquare className="w-4 h-4 text-red-500" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Customer Account / Registration status */}
            {currentUser ? (
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs">
                <button
                  onClick={onOpenTracking}
                  className="flex items-center gap-2 hover:opacity-80 transition text-left"
                  title="Ouvrir mon Angle Client"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white dark:text-white light:text-slate-900 truncate max-w-[100px]">
                    {currentUser.fullName}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 ml-1"
                  title="Déconnexion"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={onOpenLogin}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white"
                >
                  Connexion
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 rounded-xl text-xs font-bold transition"
                >
                  S'inscrire
                </button>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/30 transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Panier</span>
              {cartItemsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-red-600 rounded-full text-[11px] font-black">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar if open */}
        {isMobileMenuOpen && (
          <div className="lg:hidden px-4 pb-3 space-y-2 border-t border-slate-800 pt-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une pièce moto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenTracking();
                }}
                className="flex-1 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5 text-red-400" />
                <span>Suivi Colis Kinshasa</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenChat();
                }}
                className="flex-1 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                <span>Discussion Site</span>
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              {!currentUser ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="flex-1 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-300"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenRegister();
                    }}
                    className="flex-1 py-2 bg-red-600 rounded-xl text-xs font-bold text-white"
                  >
                    Créer compte par tél
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <span>Connecté : <strong>{currentUser.fullName}</strong></span>
                  <button onClick={logout} className="text-red-400 font-bold">Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

    </>
  );
};
