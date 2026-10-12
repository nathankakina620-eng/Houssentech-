import React from 'react';
import { ShoppingCart, Check, ShieldCheck, Flame, Star, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface Props {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onOpenDetail }) => {
  const { addToCart, cart, settings } = useStore();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const isInCart = !!cartItem;
  const isSurCommande = product.availabilityType === 'sur_commande';
  const isInStock = product.availabilityType === 'en_stock' || (!isSurCommande && product.stock > 0);

  // 70% deposit calculation if product itself or order threshold
  const isOver200 = product.price > settings.depositThreshold;
  const deposit70 = isOver200 ? Math.round(product.price * (settings.depositPercentage / 100)) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group relative bg-slate-900 rounded-2xl border border-slate-800 hover:border-red-600/50 shadow-md hover:shadow-xl hover:shadow-red-950/20 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-1 pointer-events-none">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-red-400 border border-red-500/30">
          {product.brand}
        </span>
        <div className="flex items-center gap-1">
          {product.isPromo && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white flex items-center gap-0.5 shadow-xs">
              <Flame className="w-3 h-3" />
              Promo
            </span>
          )}
          {isOver200 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-slate-950 flex items-center gap-0.5 shadow-xs" title="Commande > 200$ : acompte de 70% requis">
              70% Acompte
            </span>
          )}
        </div>
      </div>

      {/* Product Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-950">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

        {/* Stock / Sur Commande Pill */}
        <div className="absolute bottom-2 left-2.5">
          {isInStock ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>EN STOCK ({product.stock})</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-950/90 border border-blue-500/60 text-blue-300 flex items-center gap-1 shadow-md">
              <span>✈️ SUR COMMANDE</span>
            </span>
          )}
        </div>

        {/* Photo count indicator (Min 4 photos) */}
        <div className="absolute bottom-2 right-2.5">
          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/80 border border-white/20 text-white flex items-center gap-1">
            📷 {product.images?.length || 4} photos
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>{product.category}</span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-500 text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {/* Description snippet for orderable / in stock item */}
          <p className="mt-1 text-xs text-slate-300 line-clamp-2">
            {product.shortDescription || product.description}
          </p>

          {/* Compatible models */}
          {product.compatibleModels && product.compatibleModels.length > 0 && (
            <p className="mt-1.5 text-[11px] text-slate-400 line-clamp-1">
              <span className="text-slate-500 font-medium">Compatible :</span> {product.compatibleModels.join(', ')}
            </p>
          )}
        </div>

        {/* Pricing & 70% rule notice */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">
                {product.price.toFixed(0)} {settings.currency}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-500 line-through">
                  {product.originalPrice.toFixed(0)} {settings.currency}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400">{product.sku}</span>
          </div>

          {/* Explicit 70% deposit breakdown tag if price > 200 */}
          {isOver200 ? (
            <div className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-1 rounded-md flex items-center justify-between">
              <span>Acompte 70% requis :</span>
              <strong className="text-amber-400 font-bold">{deposit70} {settings.currency}</strong>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Paiement standard (&le; 200$)</span>
            </div>
          )}

          {/* Add to Cart or Order button */}
          <button
            onClick={handleAddToCart}
            className={`w-full mt-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
              isInCart
                ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                : isSurCommande
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Dans le panier ({cartItem.quantity})</span>
              </>
            ) : isSurCommande ? (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Commander cette pièce</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Ajouter au panier (En stock)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
