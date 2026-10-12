import React, { useState } from 'react';
import { X, Phone, User, MapPin, Send, MessageSquare, CheckCircle, Clock, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { registerCustomer, settings, validateCustomer, setCurrentUser } = useStore();

  const [fullName, setFullName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+243');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Post-submit state
  const [registrationResult, setRegistrationResult] = useState<{
    customer: Customer;
    whatsappUrl: string;
    smsUrl: string;
    messageText: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [selfValidated, setSelfValidated] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim() || !city.trim()) {
      return;
    }

    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${phonePrefix}${phoneNumber.replace(/^0+/, '')}`;
    const result = registerCustomer(fullName.trim(), fullPhone, city.trim(), address.trim());
    setRegistrationResult(result);
  };

  const handleCopy = () => {
    if (registrationResult) {
      navigator.clipboard.writeText(registrationResult.messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleQuickDemoValidation = () => {
    if (registrationResult) {
      validateCustomer(registrationResult.customer.id);
      setCurrentUser({
        ...registrationResult.customer,
        status: 'valide',
      });
      setSelfValidated(true);
    }
  };

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
              <p className="text-xs text-slate-400">Validation obligatoire par le numéro de l'entreprise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!registrationResult ? (
          /* STEP 1: Registration Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong>Validation sécurisée :</strong> Après avoir soumis vos coordonnées, un message de confirmation sera préparé pour être envoyé au numéro officiel de l'entreprise (<strong className="text-white">{settings.companyPhone}</strong>) afin d'activer votre compte.
              </div>
            </div>

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
                Ce numéro sera utilisé pour recevoir vos notifications de commande et d'acompte.
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
                  Quartier / Commune (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Gombe, Av. Commerce"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] font-bold text-sm text-white rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Valider & Générer le message pour l'entreprise</span>
              <Send className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs text-slate-400">
              Vous avez déjà un compte validé ?{' '}
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
          /* STEP 2: Post Registration Action Screen */
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-400 mb-1">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Demande enregistrée — En attente de validation</span>
              </div>
              <p className="text-xs text-slate-300">
                Votre inscription a été créée. Pour que votre compte soit officiellement activé par notre équipe, envoyez le message pré-rempli au numéro de notre entreprise : <strong className="text-white font-mono">{settings.companyPhone}</strong>.
              </p>
            </div>

            {/* Generated Code & Message Box */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Code de validation client :</span>
                <span className="font-mono font-black text-amber-400 bg-slate-900 px-2.5 py-1 rounded-md border border-amber-500/30">
                  {registrationResult.customer.validationCode}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Numéro de l'entreprise destinataire :</span>
                <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded">
                  {settings.companyPhone}
                </span>
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Message préparé pour l'entreprise :
                </label>
                <div className="p-3 bg-slate-950/70 rounded-lg text-xs font-mono text-slate-200 border border-slate-800 whitespace-pre-line">
                  {registrationResult.messageText}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-1.5 px-3 bg-slate-700/60 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Message copié dans le presse-papier !' : 'Copier le texte du message'}</span>
              </button>
            </div>

            {/* Action Buttons: WhatsApp & SMS */}
            <div className="space-y-2 pt-1">
              <a
                href={registrationResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] font-bold text-sm text-white rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Envoyer par WhatsApp au Gérant ({settings.companyPhone})</span>
              </a>

              <a
                href={registrationResult.smsUrl}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] font-semibold text-xs text-slate-200 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-red-400" />
                <span>Envoyer par SMS direct au ({settings.companyPhone})</span>
              </a>
            </div>

            {/* Quick validation simulation for testing or admin */}
            {!selfValidated ? (
              <div className="p-3 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 inline text-amber-400 mr-1" />
                  Vous testez l'application ? Vous pouvez valider immédiatement ce compte sans attendre ou aller dans l'espace administrateur :
                </p>
                <button
                  type="button"
                  onClick={handleQuickDemoValidation}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold rounded-lg transition"
                >
                  ⚡ Activer & Connecter directement ce compte client
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Compte validé avec succès ! Vous êtes connecté et prêt à commander.</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Fermer la fenêtre
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
