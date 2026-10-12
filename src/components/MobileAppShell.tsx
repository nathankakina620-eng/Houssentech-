import React from 'react';
import { Home, Truck, ShoppingBag, MessageSquare, User, Lock, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Props {
  activeView: 'home' | 'catalog';
  onNavigateHome: () => void;
  onOpenTracking: () => void;
  onOpenCart: () => void;
  onOpenChat: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
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
  onOpenAdmin,
  viewAngle,
  onSetAngle,
}) => {
  const { cartItemsCount, unreadMessagesCount, isAdmin, settings, getWhatsAppUrl } = useStore();

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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 dark:bg-slate-900/95 light:bg-white/95 backdrop-blur-md border-t border-slate-800 dark:border-slate-800 light:border-slate-200 px-2 py-1.5 flex items-center justify-around">
        {/* Boutique / Tout */}
        <button
          onClick={() => {
            onNavigateHome();
            onSetAngle('all');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 transition ${
            viewAngle === 'all' ? 'text-red-500 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-semibold text-slate-200">Accueil</span>
        </button>

        {/* ANGLE STOCK DÉDIÉ MOBILE */}
        <button
          onClick={() => onSetAngle(viewAngle === 'stock' ? 'all' : 'stock')}
          className={`flex flex-col items-center gap-0.5 p-1 transition ${
            viewAngle === 'stock' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-1 animate-pulse" />
            <span className="text-xs font-black">📦</span>
          </div>
          <span className="text-[10px] font-bold">En Stock</span>
        </button>

        {/* ANGLE SUR COMMANDE DÉDIÉ MOBILE */}
        <button
          onClick={() => onSetAngle(viewAngle === 'order' ? 'all' : 'order')}
          className={`flex flex-col items-center gap-0.5 p-1 transition ${
            viewAngle === 'order' ? 'text-blue-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-xs">✈️</span>
          <span className="text-[10px] font-bold">À Commander</span>
        </button>

        {/* Suivi Colis */}
        <button
          onClick={onOpenTracking}
          className="flex flex-col items-center gap-0.5 p-1 text-slate-400 hover:text-white"
        >
          <Truck className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Suivi</span>
        </button>

        {/* Panier */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-0.5 p-1 text-slate-400 hover:text-white"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-black">
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Panier</span>
        </button>

        {/* Chat Site */}
        <button
          onClick={onOpenChat}
          className="relative flex flex-col items-center gap-0.5 p-1 text-slate-400 hover:text-white"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-red-500" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-black animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Chat Site</span>
        </button>

        {/* Compte / Admin */}
        <button
          onClick={isAdmin ? onOpenAdmin : onOpenAccount}
          className="flex flex-col items-center gap-0.5 p-1 text-slate-400 hover:text-white"
        >
          {isAdmin ? <Lock className="w-5 h-5 text-amber-400" /> : <User className="w-5 h-5" />}
          <span className="text-[10px] font-semibold">{isAdmin ? 'Admin' : 'Compte'}</span>
        </button>
      </nav>
    </>
  );
};
