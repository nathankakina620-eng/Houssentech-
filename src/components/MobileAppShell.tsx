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
        className="fixed bottom-20 right-4 z-40 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-900/40 flex items-center justify-center transition transform active:scale-95 group"
        title="Contacter le gérant sur WhatsApp (+243900042404)"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 text-xs font-bold">
          WhatsApp HOUSSETECH
        </span>
      </a>

      {/* Mobile Bottom Navigation Bar: Stock, Message, Application, Panier bien disposés */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur-md border-t border-slate-800 dark:border-slate-800 light:border-slate-200 px-1.5 py-1.5 grid grid-cols-6 items-center text-center shadow-lg">
        {/* 1. Accueil */}
        <button
          onClick={() => {
            onNavigateHome();
            onSetAngle('all');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 p-1 transition ${
            viewAngle === 'all' ? 'text-red-500 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Accueil boutique"
        >
          <Home className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-semibold">Accueil</span>
        </button>

        {/* 2. STOCK : DISPOSITION PRIORITAIRE */}
        <button
          onClick={() => onSetAngle(viewAngle === 'stock' ? 'all' : 'stock')}
          className={`flex flex-col items-center justify-center gap-0.5 p-1 transition ${
            viewAngle === 'stock' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
          title="Pièces en stock immédiat"
        >
          <div className="relative">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-1 animate-pulse" />
            <span className="text-xs font-black">📦</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400">Stock</span>
        </button>

        {/* 3. MESSAGE : CHAT SITE DIRECT */}
        <button
          onClick={onOpenChat}
          className="relative flex flex-col items-center justify-center gap-0.5 p-1 text-slate-400 hover:text-white transition"
          title="Discussion directe avec le gérant"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-red-400" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-black animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-300">Message</span>
        </button>

        {/* 4. APPLICATION : PWA INSTALL DISPOSITION */}
        <div className="flex flex-col items-center justify-center">
          <PWAInstallButton variant="mobile_nav" />
        </div>

        {/* 5. PANIER : COMMANDE & ACOMPTE */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center gap-0.5 p-1 text-slate-400 hover:text-white transition"
          title="Mon panier d'achats"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 text-red-500" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-black">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-300">Panier</span>
        </button>

        {/* 6. MON ANGLE : COLIS, ARTICLES & CHAT GÉRANT */}
        <button
          onClick={onOpenTracking}
          className="flex flex-col items-center justify-center gap-0.5 p-1 text-slate-400 hover:text-white transition"
          title="Mon Angle Client : Articles commandés, Suivi de colis & Conversation"
        >
          <Truck className="w-4 h-4 text-red-400" />
          <span className="text-[10px] font-semibold text-slate-300">Mon Angle</span>
        </button>
      </nav>
    </>
  );
};
