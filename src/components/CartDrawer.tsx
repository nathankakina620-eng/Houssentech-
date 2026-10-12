import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, AlertTriangle, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<Props> = ({ isOpen, onClose, onOpenCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    settings,
    isCartDepositRequired,
    cartDepositAmount,
    cartRemainingBalance,
    clearCart,
  } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Mon Panier</h2>
                <p className="text-xs text-slate-400">
                  {cart.length} article{cart.length > 1 ? 's' : ''} sélectionné{cart.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 p-1.5 transition"
                  title="Vider le panier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-300">Votre panier est vide</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Découvrez nos pièces détachées moto de qualité supérieure pour votre machine.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded-xl shadow-md transition"
                >
                  Explorer les pièces
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60 flex items-center gap-3"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg bg-slate-950 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-red-400 uppercase">
                          {item.product.brand}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate">
                        {item.product.name}
                      </h4>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs font-black text-white">
                          {(item.product.price * item.quantity).toFixed(2)} {settings.currency}
                        </span>

                        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Calculations */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-3">
              {/* Summary lines */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Sous-total articles :</span>
                  <span className="font-mono text-white font-bold">
                    {cartTotal.toFixed(2)} {settings.currency}
                  </span>
                </div>
              </div>

              {/* RÈGLE D'ACOMPTE 70% BOX */}
              <div
                className={`p-3 rounded-xl border ${
                  isCartDepositRequired
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs mb-1">
                  <span className="flex items-center gap-1.5">
                    {isCartDepositRequired ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-amber-400 uppercase tracking-wider">Acompte 70% Requis (&gt; 200$)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Achat &le; 200$ (Paiement standard)</span>
                      </>
                    )}
                  </span>
                </div>

                {isCartDepositRequired ? (
                  <div className="text-xs space-y-1.5 pt-1">
                    <p className="text-[11px] text-slate-300 leading-tight">
                      Votre panier dépasse 200$. Conformément à la politique du magasin, vous devez verser <strong className="text-amber-300">70% d'acompte</strong> à la commande.
                    </p>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 space-y-1">
                      <div className="flex justify-between text-amber-300 font-bold">
                        <span>Acompte 70% à verser maintenant :</span>
                        <span className="font-mono text-sm">{cartDepositAmount.toFixed(2)} {settings.currency}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Solde à la livraison (30%) :</span>
                        <span className="font-mono text-white">{cartRemainingBalance.toFixed(2)} {settings.currency}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Montant sous le seuil de 200$. Règlement possible selon les options convenues à la livraison.
                  </p>
                )}
              </div>

              {/* Saturday shipping notice & free shipping */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Livraison vers Kinshasa :</span>
                  <span className={cartTotal >= settings.freeDeliveryThreshold ? 'font-bold text-emerald-400 uppercase' : 'font-mono text-white font-bold'}>
                    {cartTotal >= settings.freeDeliveryThreshold ? 'GRATUITE (>= 200$)' : '15.00 $'}
                  </span>
                </div>
                <div className="text-amber-300 font-medium">
                  📦 Commandes avant Mercredi 12h expédiées ce Samedi matin !
                </div>
              </div>

              {/* Total display */}
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-slate-300">Total commande :</span>
                <span className="text-xl font-black text-white">
                  {cartTotal.toFixed(2)} {settings.currency}
                </span>
              </div>

              {/* Proceed to checkout button */}
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.99] font-bold text-sm text-white rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Commander mes pièces</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
