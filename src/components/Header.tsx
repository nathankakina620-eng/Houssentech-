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
  Sparkles,
  Package,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PWAInstallButton } from './PWA/PWAInstallButton';

interface Props {
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenChat: () => void;
  onOpenTracking: (tab?: 'orders' | 'tracking' | 'chat') => void;
  viewAngle: 'all' | 'stock' | 'order';
  onSetAngle: (angle: 'all' | 'stock' | 'order') => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenCart,
  onOpenLogin,
  onOpenRegister,
  onOpenChat,
  onOpenTracking,
  viewAngle,
  onSetAngle,
  onOpenAdmin,
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
    isAdmin,
    getWhatsAppUrl,
  } = useStore();

  const inStockCount = products.filter((p) => p.availabilityType === 'en_stock' || p.stock > 0).length;
  const orderCount = products.filter((p) => p.availabilityType === 'sur_commande' || p.stock === 0).length;

  // Tiroir latéral gauche déclenché par les 3 traits (hamburger menu)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenTrackingFromDrawer = (tab?: 'orders' | 'tracking' | 'chat') => {
    setIsDrawerOpen(false);
    onOpenTracking(tab);
  };

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

        {/* Main Header Bar (Note : Mon Angle Client et Installer l'application sont désormais rangés dans le menu des 3 traits à gauche) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Côté Gauche : Bouton des 3 traits (Menu latéral) + Logo HOUSSETECH */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton des 3 traits (☰) visible en permanence à gauche pour ouvrir le menu contenant l'Angle Client & l'Installation */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 hover:text-red-500 hover:border-red-500/50 transition flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95"
              title="Menu principal (les trois traits ☰) : Mon Angle Client, Suivi de colis & Installer l'application"
              aria-label="Ouvrir le menu principal à 3 traits"
            >
              <Menu className="w-5 h-5 text-red-500" />
            </button>

            {/* Logo de l'application */}
            <button
              onClick={() => onSetAngle('all')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-red-500/30 overflow-hidden flex items-center justify-center shadow-md shadow-red-600/25 group-hover:scale-105 group-hover:border-red-500 transition-all p-0.5 shrink-0">
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
                <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 block -mt-0.5 font-medium">
                  Pièces Moto & Expéditions Kinshasa
                </span>
              </div>
            </button>
          </div>

          {/* Barre de recherche (sur desktop) */}
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

          {/* Actions rapides de la barre supérieure (Le mode sombre/éclairage et la fiche de messagerie sont déplacés dans le menu 3 traits à gauche) */}
          <div className="flex items-center gap-2">
            {/* Bouton STOCK physique */}
            <button
              onClick={() => onSetAngle(viewAngle === 'stock' ? 'all' : 'stock')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer ${
                viewAngle === 'stock'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300'
              }`}
              title="Filtrer : Pièces en stock physique disponibles immédiatement"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>STOCK</span>
              <span className="hidden sm:inline text-[10px] font-mono opacity-90">
                ({inStockCount})
              </span>
            </button>

            {/* Bouton SUR COMMANDE */}
            <button
              onClick={() => onSetAngle(viewAngle === 'order' ? 'all' : 'order')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer ${
                viewAngle === 'order'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/50'
                  : 'bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300'
              }`}
              title="Filtrer : Pièces à commander (Expédition convoi samedi)"
            >
              <span>✈️</span>
              <span>SUR COMMANDE</span>
              <span className="text-[10px] font-mono opacity-90">
                ({orderCount})
              </span>
            </button>

            {/* Indicateur de compte discret sur grand écran */}
            {currentUser ? (
              <div className="hidden lg:flex items-center gap-2 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-semibold text-white dark:text-white light:text-slate-900 truncate max-w-[110px]">
                  {currentUser.fullName}
                </span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 ml-1 transition"
                  title="Déconnexion"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={onOpenLogin}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition cursor-pointer"
                >
                  Connexion
                </button>
                <button
                  onClick={onOpenRegister}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  S'inscrire
                </button>
              </div>
            )}

            {/* Déclencheur Panier */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/30 transition active:scale-95 cursor-pointer shrink-0"
              title="Voir mon panier"
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
      </header>

      {/* MENU LATÉRAL GAUCHE (Déclenché par les 3 traits ☰ du côté gauche de la barre du nom) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Arrière-plan semi-transparent pour fermer en cliquant à l'extérieur */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Panneau coulissant du côté gauche */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-slate-950 dark:bg-slate-950 light:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 border-r border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl flex flex-col justify-between overflow-y-auto p-5 z-10 transition-transform">
            {/* En-tête du menu à 3 traits */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-red-500/40 p-1 flex items-center justify-center shadow-md">
                    <img src="/icon.svg" alt="HOUSSETECH" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white dark:text-white light:text-slate-900 leading-tight">
                      HOUSSE<span className="text-red-500">TECH</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
                      Menu latéral • Les 3 traits (☰)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-100 transition cursor-pointer"
                  title="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Recherche rapide mobile intégrée */}
              <div className="md:hidden">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher une pièce moto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* ============================================================ */}
              {/* SECTION PRINCIPALE : MON ANGLE CLIENT (Disponible après inscription) */}
              {/* ============================================================ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-red-500" />
                    <span>MON ANGLE CLIENT</span>
                  </span>
                  {currentUser ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ✓ Débloqué
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Verrouillé
                    </span>
                  )}
                </div>

                {currentUser ? (
                  /* CARTE ANGLE CLIENT ACTIF (Client inscrit) */
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 dark:from-slate-900 dark:to-red-950/40 light:from-slate-50 light:to-red-50/40 border border-red-500/40 shadow-lg space-y-3">
                    {/* Profil de l'utilisateur inscrit */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center font-black text-sm">
                          {currentUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white dark:text-white light:text-slate-900">
                            {currentUser.fullName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {currentUser.phone}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {currentUser.status === 'valide' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Validé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            En attente
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-600 leading-tight">
                      Votre Angle Client est actif. Consultez vos colis vers Kinshasa, vos articles acceptés et échangez avec la direction.
                    </p>

                    {/* Raccourcis directs de l'Angle Client */}
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      <button
                        onClick={() => handleOpenTrackingFromDrawer('orders')}
                        className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-left text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center justify-between transition cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>Mes Articles Commandés (Acceptés & En attente)</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => handleOpenTrackingFromDrawer('tracking')}
                        className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-left text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center justify-between transition cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-red-400" />
                          <span>Suivi de mes Colis vers Kinshasa</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => handleOpenTrackingFromDrawer('chat')}
                        className="w-full px-3 py-2 bg-slate-800 dark:bg-slate-800 light:bg-white hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-100 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-left text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center justify-between transition cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Notre Conversation avec l'Administrateur</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    {/* Bouton principal : Ouvrir Mon Angle Client */}
                    <button
                      onClick={() => handleOpenTrackingFromDrawer('orders')}
                      className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Ouvrir tout mon Angle Client</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="pt-1 text-center">
                      <button
                        onClick={() => {
                          logout();
                          setIsDrawerOpen(false);
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-400 transition underline underline-offset-2 cursor-pointer"
                      >
                        Déconnexion de mon compte ({currentUser.fullName})
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CARTE AVANT INSCRIPTION : Verrouillée avec incitation claire */
                  <div className="p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white dark:text-white light:text-slate-900">
                          Angle Client disponible dès inscription
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 leading-relaxed">
                          Inscrivez-vous avec votre numéro de téléphone pour débloquer automatiquement votre Angle Client : suivi de vos colis vers Kinshasa, détails de vos articles acceptés par le gérant et messagerie privée directe.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onOpenRegister();
                        }}
                        className="py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>S'inscrire</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onOpenLogin();
                        }}
                        className="py-2.5 px-3 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Se connecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================ */}
              {/* SECTION INSTALLATION APPLICATION (Cachée ici au lieu du haut) */}
              {/* ============================================================ */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider block">
                  Installation de l'Application
                </span>
                <PWAInstallButton variant="drawer" />
              </div>

              {/* ============================================================ */}
              {/* SECTION NAVIGATION CATALOGUE & FILTRES */}
              {/* ============================================================ */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider block">
                  Angles du Catalogue
                </span>

                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      onSetAngle('stock');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      viewAngle === 'stock'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-slate-800 dark:border-slate-800 light:border-slate-300 text-emerald-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Pièces en Stock Immédiat</span>
                    </span>
                    <span className="font-mono text-[11px]">({inStockCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      onSetAngle('order');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      viewAngle === 'order'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-slate-800 dark:border-slate-800 light:border-slate-300 text-blue-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>✈️</span>
                      <span>Pièces Sur Commande (Samedi)</span>
                    </span>
                    <span className="font-mono text-[11px]">({orderCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      onSetAngle('all');
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      viewAngle === 'all'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🏍️</span>
                      <span>Tout le Catalogue Moto</span>
                    </span>
                    <span className="font-mono text-[11px]">({products.length})</span>
                  </button>
                </div>
              </div>

              {/* ============================================================ */}
              {/* FICHE DE MESSAGERIE & CONTACT (Cachée ici au lieu du haut) */}
              {/* ============================================================ */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                    <span>Fiche de Messagerie</span>
                  </span>
                  {unreadMessagesCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black animate-pulse">
                      {unreadMessagesCount} non lu{unreadMessagesCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-white dark:text-white light:text-slate-900">
                        Discussion Directe Gérant / Admin
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600">
                        Lun - Ven : 08h00 - 16h30 | Sam : 08h00 - 14h00
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      En service
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenChat();
                    }}
                    className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-red-600/30 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ouvrir la Messagerie Directe</span>
                    {unreadMessagesCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-white text-red-600 rounded-full text-[10px] font-black">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </button>

                  <a
                    href={getWhatsAppUrl(`Bonjour HOUSSETECH (${settings.companyPhone}), je vous écris depuis l'application.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Gérant</span>
                    </span>
                    <span className="font-mono text-[10px]">{settings.companyPhone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* PIED DU MENU LATÉRAL : MODE SOMBRE & ÉCLAIRAGE (Caché ici au lieu du haut) */}
            {/* ============================================================ */}
            <div className="pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-3">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider block">
                  Mode Sombre & Éclairage
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-800 text-amber-400 border-amber-500/60 shadow-md ring-2 ring-amber-500/30'
                        : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Mode Sombre</span>
                  </button>

                  <button
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mode Éclairage</span>
                  </button>
                </div>
              </div>

              {onOpenAdmin && (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-2 text-center text-[10px] text-slate-500 hover:text-slate-300 dark:hover:text-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-slate-600" />
                  <span>Espace sécurisé de l'administration</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
