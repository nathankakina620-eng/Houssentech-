import React, { useState } from 'react';
import { X, ShoppingCart, Check, ShieldCheck, AlertTriangle, MessageSquare, Wrench, CheckCircle2, ChevronRight, Share2, Layers } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  const { addToCart, cart, settings } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!isOpen || !product) return null;

  const cartItem = cart.find((item) => item.product.id === product.id);
  const isSurCommande = product.availabilityType === 'sur_commande';
  const isInStock = product.availabilityType === 'en_stock' || (!isSurCommande && product.stock > 0);
  const isOutOfStock = !isSurCommande && product.stock <= 0;
  const maxAllowedQuantity = isSurCommande ? 99 : Math.max(1, product.stock);

  // Deposit calculation
  const isOver200 = product.price > settings.depositThreshold;
  const deposit70 = isOver200 ? Math.round(product.price * (settings.depositPercentage / 100) * 100) / 100 : 0;
  const balance30 = isOver200 ? Math.round((product.price - deposit70) * 100) / 100 : product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleWhatsAppAsk = () => {
    const cleanPhone = settings.companyPhone.replace(/[^0-9]/g, '');
    const msg = `Bonjour HOUSSETECH (${settings.companyPhone}), je me renseigne sur la pièce moto suivante :\n• Article : ${product.name} (Réf : ${product.sku})\n• Disponibilité : ${isInStock ? 'En Stock immédiat' : 'Sur Commande'}\n• Prix : $${product.price}\n• Modèles : ${product.compatibleModels?.join(', ') || 'N/A'}\nEst-elle toujours disponible pour livraison vers Kinshasa ?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-100 my-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photos Column */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-md text-xs font-black bg-slate-950/90 text-red-400 border border-red-500/30">
                  {product.brand}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-950/90 text-slate-300 border border-slate-700">
                  {product.condition}
                </span>
              </div>
            </div>

            {/* Thumbnails of at least 4 photos */}
            {product.images.length > 1 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Galerie photos ({product.images.length} vues disponibles)</span>
                  <span className="text-red-400 font-medium">Vue {selectedImageIndex + 1}/{product.images.length}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-16 w-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        selectedImageIndex === idx ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Vue ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Box */}
            <div className={`p-3 rounded-xl border flex flex-col gap-1 text-xs ${
              isInStock
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Disponibilité :</span>
                {isInStock ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    En Stock Immédiat ({product.stock} pièces)
                  </span>
                ) : (
                  <span className="text-blue-400 flex items-center gap-1.5">
                    <span>✈️ Sur Commande (Expédié Samedi)</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isInStock
                  ? 'Pièce physiquement présente en stock dans nos dépôts pour retrait ou expédition immédiate.'
                  : 'Pièce disponible à la commande. Départ avec le convoi transitaire du samedi matin vers Kinshasa.'}
              </p>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">
                {product.category}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white leading-snug">
                {product.name}
              </h1>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Référence SKU : {product.sku}
              </div>

              {/* Price display */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {product.price.toFixed(2)} {settings.currency}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-500 line-through">
                    {product.originalPrice.toFixed(2)} {settings.currency}
                  </span>
                )}
              </div>

              {/* KEY RULE BOX: 70% deposit for > $200 */}
              <div className={`mt-3 p-3.5 rounded-xl border ${
                isOver200
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
                  {isOver200 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400">Règle de commande (&gt; 200$) : Acompte de 70%</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-200">Achat &le; 200$ : Paiement standard</span>
                    </>
                  )}
                </div>

                {isOver200 ? (
                  <div className="text-xs space-y-1">
                    <p className="text-slate-300">
                      Cet article dépasse 200$. Un <strong>acompte de 70% ({deposit70.toFixed(2)} {settings.currency})</strong> est requis à la commande par Mobile Money pour déclencher la réservation et l'expédition.
                    </p>
                    <div className="pt-1 text-[11px] text-amber-300 font-medium flex items-center justify-between border-t border-amber-500/20 mt-1">
                      <span>• Acompte à verser immédiatement :</span>
                      <strong className="text-amber-400 font-mono text-xs">{deposit70.toFixed(2)} {settings.currency}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>• Solde à régler à la livraison (30%) :</span>
                      <strong className="text-white font-mono text-xs">{balance30.toFixed(2)} {settings.currency}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300">
                    Pour cet achat (&le; 200$), vous pouvez régler en totalité selon votre préférence (à la livraison ou via Mobile Money).
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Description de la pièce
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {product.description || product.shortDescription}
                </p>
              </div>

              {/* Compatible Models */}
              {product.compatibleModels && product.compatibleModels.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-red-500" />
                    Motos & Modèles compatibles
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.compatibleModels.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700 font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications Table */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-red-500" />
                    Fiche technique
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="bg-slate-800/50 p-2 rounded-lg border border-slate-800 flex justify-between">
                        <span className="text-slate-400">{key} :</span>
                        <span className="font-semibold text-slate-200">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bottom Bar */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxAllowedQuantity, quantity + 1))}
                    disabled={quantity >= maxAllowedQuantity || isOutOfStock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 ${
                    isOutOfStock
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : isSurCommande
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Article épuisé</span>
                  ) : addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : isSurCommande ? (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Commander cette pièce ({(product.price * quantity).toFixed(2)} {settings.currency})</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Ajouter au panier ({(product.price * quantity).toFixed(2)} {settings.currency})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social / Video Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* TikTok Video button */}
                <a
                  href={product.tiktokVideoUrl || settings.tiktokUrl || 'https://www.tiktok.com/@houssetech_moto'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Voir la vidéo sur TikTok</span>
                </a>

                {/* Ask WhatsApp button */}
                <button
                  onClick={handleWhatsAppAsk}
                  className="py-2.5 px-3 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp ({settings.companyPhone})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
