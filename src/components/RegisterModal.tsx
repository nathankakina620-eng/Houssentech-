import React, { useState } from 'react';
import { X, Phone, User, MapPin, Send, MessageSquare, CheckCircle, Copy, Check, Sparkles, ShoppingBag, Truck, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onOpenTracking?: () => void;
  onOpenChat?: () => void;
}

export const RegisterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onOpenTracking,
  onOpenChat,
}) => {
  const { registerCustomer, settings, isAdmin, logoutAdmin } = useStore();

  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+243');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('Kinshasa');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Post-submit state
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [whatsappShareUrl, setWhatsappShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isAdmin) {
      setErrorMessage("Une session Administrateur est active dans cette fenêtre. Veuillez d'abord vous déconnecter de l'administration pour ouvrir un compte client.");
      return;
    }

    if (!fullName.trim() || !phoneNumber.trim() || !city.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${phonePrefix}${phoneNumber.replace(/^0+/, '')}`;
    try {
      const result = registerCustomer(fullName.trim(), fullPhone, city.trim(), address.trim());
      setCreatedCustomer(result.customer);
      setWhatsappShareUrl(result.whatsappUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de l'enregistrement du compte.");
    }
  };

  const handleCopyPhone = () => {
    if (createdCustomer) {
      navigator.clipboard.writeText(createdCustomer.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Créer mon Compte Client</h2>
              <p className="text-xs text-slate-400">Compte actif immédiatement — Sans attente de validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAdmin ? (
          /* CONFLIT DE SESSION : Admin déjà ouvert */
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-700/60 text-red-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span>👑 Session Administrateur Active</span>
              </div>
              <p>
                Vous êtes actuellement connecté au compte Administrateur HOUSSETECH dans cette fenêtre. Un client ne peut pas ouvrir son compte simultanément dans le même angle.
              </p>
              <p className="text-[11px] text-slate-300">
                Veuillez vous déconnecter du panneau administrateur pour pouvoir créer ou naviguer sur un compte client.
              </p>
            </div>
            <button
              onClick={() => {
                logoutAdmin();
                setErrorMessage('');
              }}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter de l'administration</span>
            </button>
          </div>
        ) : !createdCustomer ? (
          /* ÉTAPE 1 : Formulaire d'inscription rapide */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Validation automatique immédiate :</strong> Dès l'insertion de vos coordonnées, votre compte est instantanément activé. Vous pouvez dialoguer en direct avec nous, passer commande et suivre vos colis sans attente.
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-700/50 rounded-xl text-xs text-red-200">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nom complet *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex : Nathan Kakina"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Numéro de téléphone *
              </label>
              <div className="flex gap-2">
                <select
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-red-500"
                >
                  <option value="+243">+243 (RDC)</option>
                  <option value="+33">+33 (France)</option>
                  <option value="+225">+225 (Côte d'Ivoire)</option>
                  <option value="+221">+221 (Sénégal)</option>
                  <option value="+237">+237 (Cameroun)</option>
                  <option value="+242">+242 (Congo)</option>
                  <option value="+1">+1 (USA/Canada)</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="812 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sert d'identifiant unique pour vos commandes et pour dialoguer avec la boutique.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Ville de livraison *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex : Kinshasa"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Quartier / Commune
                </label>
                <input
                  type="text"
                  placeholder="Ex : Gombe, Lemba, Limete..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] font-bold text-sm text-white rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Créer mon Compte & Activer l'Accès</span>
              <Send className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs text-slate-400">
              Vous avez déjà un compte ?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2 ml-1"
              >
                Se connecter avec son téléphone
              </button>
            </div>
          </form>
        ) : (
          /* ÉTAPE 2 : Confirmation immédiate du compte actif */
          <div className="mt-5 space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Compte Client Validé & Activé avec Succès !</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Bienvenue <strong className="text-white font-bold">{createdCustomer.fullName}</strong> ! Votre compte est opérationnel immédiatement. Vous pouvez dès à présent échanger en direct avec la direction, passer vos commandes de pièces et suivre vos expéditions.
              </p>
            </div>

            {/* Récapitulatif du compte client */}
            <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Nom du titulaire :</span>
                <span className="font-bold text-white">{createdCustomer.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Numéro de téléphone :</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    {createdCustomer.phone}
                  </span>
                  <button
                    onClick={handleCopyPhone}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copier"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ville / Commune :</span>
                <span className="text-slate-200">{createdCustomer.city} {createdCustomer.address ? `(${createdCustomer.address})` : ''}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                <span className="text-slate-400">Statut du compte :</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded-full border border-emerald-500/30">
                  ● Actif & Validé
                </span>
              </div>
            </div>

            {/* Actions immédiates directes */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenChat) onOpenChat();
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] font-bold text-sm text-white rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>M'envoyer un message & Discuter en direct</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 active:scale-[0.99] font-bold text-xs text-white rounded-xl shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Voir les articles & Passer mes achats</span>
              </button>

              {onOpenTracking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTracking();
                  }}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-red-400" />
                  <span>Ouvrir mon Angle Client & Suivi de colis</span>
                </button>
              )}

              {whatsappShareUrl && (
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center justify-center gap-1.5 transition text-center"
                >
                  <span>Informer également le gérant sur WhatsApp ({settings.companyPhone})</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
