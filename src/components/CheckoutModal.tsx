import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  Phone,
  MapPin,
  User,
  MessageSquare,
  CreditCard,
  ChevronRight,
  FileText,
  Upload,
  Image as ImageIcon,
  Check,
  Calendar,
  Lock,
  Eye,
  Download
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, Order } from '../types';
import { computeShippingSchedule } from '../utils/shippingSchedule';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenReceipt: (order: Order) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenReceipt,
}) => {
  const {
    cart,
    cartTotal,
    settings,
    currentUser,
    placeOrder,
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Kinshasa');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');

  // Post order
  const [completedOrder, setCompletedOrder] = useState<{
    order: Order;
    whatsappOrderUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  // Free delivery calculation
  const isFreeDelivery = cartTotal >= settings.freeDeliveryThreshold; // >= 200$
  const deliveryFee = isFreeDelivery ? 0 : 15;
  const grandTotal = cartTotal + deliveryFee;

  // 70% deposit calculation
  const isDepositRequired = grandTotal > settings.depositThreshold;
  const depositAmount = isDepositRequired
    ? Math.round(grandTotal * (settings.depositPercentage / 100) * 100) / 100
    : 0;
  const remainingBalance = isDepositRequired
    ? Math.round((grandTotal - depositAmount) * 100) / 100
    : grandTotal;

  // Screenshot upload handling
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPaymentScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !city.trim() || !deliveryAddress.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const res = placeOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      city: city.trim(),
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod,
      paymentScreenshot: paymentScreenshot || undefined,
      notes: notes.trim() + (paymentRef ? ` (Réf: ${paymentRef})` : ''),
    });

    setCompletedOrder(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-100 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Finaliser la Commande</h2>
              <p className="text-xs text-slate-400">
                Paiement sécurisé & expédition chaque samedi matin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!completedOrder ? (
          <form onSubmit={handleOrderSubmit} className="mt-4 space-y-4">
            {/* Free Shipping & Saturday Schedule Highlights with exact calculated date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isFreeDelivery
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <strong className="block text-white">
                    {isFreeDelivery ? 'Livraison 100% GRATUITE !' : 'Livraison standard (15$)'}
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    {isFreeDelivery
                      ? 'Commande >= 200$ : Frais offerts vers Kinshasa'
                      : 'Gratuite à partir de 200$ d\'achats'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border bg-amber-950/30 border-amber-500/30 text-amber-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <strong className="block text-white">
                    Expédition {computeShippingSchedule().targetSaturdayDate} matin
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    {computeShippingSchedule().isCurrentWeek
                      ? '✅ Avant Mercredi 12h : part ce samedi !'
                      : '⚠️ Après Mercredi 12h : part samedi prochain'}
                  </span>
                </div>
              </div>
            </div>

            {/* 70% DEPOSIT BREAKDOWN ALERT */}
            {isDepositRequired && (
              <div className="p-3.5 rounded-xl border bg-red-950/20 border-red-500/40 text-red-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Règle d'acompte de 70% requise (&gt; 200$)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Votre commande totale est de <strong className="text-white">${grandTotal.toFixed(2)}</strong>. Vous devez verser <strong className="text-amber-400 font-bold">70% d'acompte (${depositAmount.toFixed(2)})</strong>. Le solde de 30% (${remainingBalance.toFixed(2)}) sera payé à l'arrivée à Kinshasa.
                </p>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Coordonnées du client destinataire</span>
                {!currentUser && (
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="text-[11px] text-red-400 hover:text-red-300 underline font-normal normal-case"
                  >
                    Nouveau client ? S'inscrire d'abord
                  </button>
                )}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Ex : Jean-Pierre Kabangu"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Numéro de téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Ex : +243 812 345 678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ville de destination *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Kinshasa, Lubumbashi..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quartier / Adresse de livraison *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Quartier, Avenue, N°"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD & SECRET NUMBER REVELATION */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Moyen de paiement & Versement
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mpesa', label: 'Vodacom M-Pesa' },
                  { id: 'airtel_money', label: 'Airtel Money' },
                  { id: 'orange_money', label: 'Orange Money' },
                  { id: 'cash_livraison', label: 'Cash à la livraison' },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-2 rounded-xl border text-xs font-bold transition ${
                      paymentMethod === m.id
                        ? 'bg-red-600/20 border-red-500 text-white shadow-xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* SECRET PAYMENT NUMBER BOX (Revealed specifically at payment stage) */}
              <div className="p-4 rounded-xl bg-slate-800/90 border border-red-500/40 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Lock className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Numéro Exclusif pour Envoyer l'Argent :</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-red-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Envoyer l'argent directement au :</span>
                    <strong className="font-mono text-base sm:text-lg text-red-400 tracking-wider">
                      {settings.secretPaymentPhone}
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Titulaire : HOUSSETECH SARL / DIRECTION
                    </span>
                  </div>

                  <span className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-black uppercase">
                    Paiement Actif
                  </span>
                </div>

                {/* MANDATORY SCREENSHOT REQUIREMENT */}
                <div className="space-y-1.5 pt-1">
                  <label className="block font-bold text-slate-200">
                    📸 Obligation : Envoyez la capture d'écran du transfert d'argent sur ce numéro *
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Après avoir envoyé l'argent sur le <strong className="text-white">{settings.secretPaymentPhone}</strong>, importez la capture d'écran de confirmation pour valider immédiatement votre commande.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="cursor-pointer px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition">
                      <Upload className="w-4 h-4 text-red-400" />
                      <span>{paymentScreenshot ? 'Changer la capture' : 'Choisir la capture d\'écran'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>

                    {paymentScreenshot && (
                      <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Capture enregistrée</span>
                        <img
                          src={paymentScreenshot}
                          alt="Preuve"
                          className="w-6 h-6 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Référence de transaction SMS / Mobile Money (optionnel) :
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : MPESA-TX-849201"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Remarques pour la livraison (Optionnel)
              </label>
              <textarea
                rows={2}
                placeholder="Précisions de contact, heure souhaitée..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-red-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.99] font-bold text-sm text-white rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Confirmer ma Commande (${grandTotal.toFixed(2)})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* POST-ORDER CONFIRMATION */
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Commande Enregistrée !</h3>
              <p className="text-xs text-slate-300">
                Numéro : <strong className="font-mono text-emerald-400">{completedOrder.order.orderNumber}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total :</span>
                <strong className="text-white font-mono">${completedOrder.order.total.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Livraison :</span>
                <strong className="text-emerald-400">
                  {completedOrder.order.isFreeDelivery ? 'GRATUITE (>= 200$)' : '$15'}
                </strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Expédition :</span>
                <strong className="text-amber-400">Samedi matin vers Kinshasa</strong>
              </div>

              {completedOrder.order.isDepositRequired && (
                <div className="p-2.5 bg-red-950/30 border border-red-500/30 rounded-lg text-red-200 space-y-1 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Acompte de 70% :</span>
                    <span className="font-mono">${completedOrder.order.depositAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Solde à Kinshasa (30%) :</span>
                    <span className="font-mono">${completedOrder.order.remainingBalance.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <a
                href={completedOrder.whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Transmettre la commande sur WhatsApp ({settings.companyPhone})</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReceipt(completedOrder.order);
                }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Aperçu du Devis (Téléchargement officiel dès acceptation)</span>
              </button>

              <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-[11px] text-center">
                ℹ️ <strong>Règle HOUSSETECH :</strong> Dès que l'administrateur confirme votre commande et le versement, votre reçu officiel PDF est activé et directement téléchargeable sur votre compte et envoyé sur votre WhatsApp.
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
