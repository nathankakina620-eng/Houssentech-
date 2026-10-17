import React from 'react';
import { Home, Truck, ShoppingBag, MessageSquare, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PWAInstallButton } from './PWA/PWAInstallButton';

interface Props {
  activeView: 'home' | 'catalog';
  onNavigateHome: () => void;
  onOpenTracking: () => void;
  onOpenCart: () => void;
  onOpenChat: () => void;
  onOpenAccount: () => void;
  viewAngle: 'all' | 'stock' | 'order';
  onSetAngle: (angle: 'all' | 'stock' | 'order') => void;
}

export const MobileAppShell: React.FC<Props> = ({
  activeView,
  onNavigateHome,
  onOpenTracking,
  onOpenCart,
  onOpenChat,
  onOpenAccount,
  viewAngle,
  onSetAngle,
}) => {
  const { cartItemsCount, unreadMessagesCount, settings, getWhatsAppUrl } = useStore();

  return (
    <>
      {/* Floating WhatsApp Quick Contact Button */}
      <a
        href={getWhatsAppUrl(`Bonjour HOUSSETECH (${settings.companyPhone}), je vous contacte depuis l'application.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[calc(4.8rem+env(safe-area-inset-bottom,0px))] right-3.5 z-40 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-950/60 flex items-center justify-center transition transform active:scale-95 group border-2 border-emerald-400/40"
        title="Contacter le gérant sur WhatsApp (+243900042404)"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 text-xs font-bold">
          WhatsApp HOUSSETECH
        </span>
      </a>

      {/* Mobile Bottom Navigation Bar: Ergonomique, 5 onglets spacieux adaptés à tout écran de téléphone */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur-md border-t border-slate-800 dark:border-slate-800 light:border-slate-200 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] grid grid-cols-5 items-center text-center shadow-2xl">
        {/* 1. Accueil */}
        <button
          onClick={() => {
            onNavigateHome();
            onSetAngle('all');
          }}
          className={`flex flex-col items-center justify-center gap-1 p-1 transition cursor-pointer active:scale-95 ${
            viewAngle === 'all' ? 'text-red-500 font-black' : 'text-slate-400 hover:text-white'
          }`}
          title="Accueil boutique"
        >
          <Home className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-semibold leading-none">Accueil</span>
        </button>

        {/* 2. STOCK : DISPOSITION PRIORITAIRE */}
        <button
          onClick={() => onSetAngle(viewAngle === 'stock' ? 'all' : 'stock')}
          className={`flex flex-col items-center justify-center gap-1 p-1 transition cursor-pointer active:scale-95 ${
            viewAngle === 'stock' ? 'text-emerald-400 font-black scale-105' : 'text-slate-400 hover:text-white'
          }`}
          title="Pièces en stock immédiat"
        >
          <div className="relative">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-1.5 animate-pulse" />
            <span className="text-xs">📦</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 leading-none">Stock</span>
        </button>

        {/* 3. PANIER : COMMANDE & ACOMPTE */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center gap-1 p-1 text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
          title="Mon panier d'achats"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-red-500" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-black shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-300 leading-none">Panier</span>
        </button>

        {/* 4. MESSAGE : CHAT SITE DIRECT */}
        <button
          onClick={onOpenChat}
          className="relative flex flex-col items-center justify-center gap-1 p-1 text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
          title="Discussion directe avec le gérant"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-black animate-pulse shadow-sm">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-300 leading-none">Message</span>
        </button>

        {/* 5. MON ANGLE : COLIS, ARTICLES, PROFIL & MAP */}
        <button
          onClick={onOpenTracking}
          className="flex flex-col items-center justify-center gap-1 p-1 text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
          title="Mon Angle Client : Articles commandés, Suivi de colis, Paramètres & Map"
        >
          <Truck className="w-4 h-4 text-rose-400" />
          <span className="text-[10px] font-semibold text-slate-300 leading-none">Mon Angle</span>
        </button>
      </nav>
    </>
  );
};
