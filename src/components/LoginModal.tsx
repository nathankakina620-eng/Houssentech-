import React, { useState } from 'react';
import { X, Phone, LogIn, AlertCircle, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { loginWithPhone, settings, isAdmin, logoutAdmin } = useStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingCustomer, setPendingCustomer] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setPendingCustomer(null);

    if (isAdmin) {
      setErrorMsg("Une session Administrateur est active dans cette fenêtre. Veuillez d'abord vous déconnecter de l'administration pour ouvrir un compte client.");
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMsg('Veuillez entrer votre numéro de téléphone.');
      return;
    }

    const res = loginWithPhone(phoneNumber.trim());
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
      if (res.status === 'en_attente_validation' && res.customer) {
        setPendingCustomer(res.customer);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Connexion Client</h2>
              <p className="text-xs text-slate-400">Identifiez-vous avec votre numéro de téléphone</p>
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
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-700/60 text-red-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span>👑 Session Administrateur Active</span>
              </div>
              <p>
                Vous êtes actuellement connecté au compte Administrateur HOUSSETECH. Un client ne peut pas ouvrir son compte simultanément dans le même angle.
              </p>
              <p className="text-[11px] text-slate-300">
                Veuillez vous déconnecter de l'administration pour vous connecter à votre compte client.
              </p>
            </div>
            <button
              onClick={() => {
                logoutAdmin();
                setErrorMsg('');
              }}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>Se déconnecter de l'administration</span>
            </button>
          </div>
        ) : (

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Numéro de téléphone enregistré
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="Ex : +243 812 345 678 ou 0812345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 transition"
              />
            </div>
          </div>

          {errorMsg && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              pendingCustomer ? 'bg-amber-950/40 border-amber-600/50 text-amber-200' : 'bg-red-950/40 border-red-700/50 text-red-200'
            }`}>
              {pendingCustomer ? (
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p>{errorMsg}</p>
                {pendingCustomer && (
                  <div className="mt-2 pt-2 border-t border-amber-800/40 space-y-1 text-[11px]">
                    <div>Code de votre demande : <strong className="font-mono text-amber-300">{pendingCustomer.validationCode}</strong></div>
                    <a
                      href={`https://wa.me/${settings.companyPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Bonjour MotoPièces, pouvez-vous valider mon compte client ? Nom: ${pendingCustomer.fullName}, Code: ${pendingCustomer.validationCode}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1 text-emerald-400 hover:text-emerald-300 font-bold underline"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Relancer le gérant par WhatsApp ({settings.companyPhone})
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-[0.99] font-bold text-sm text-white rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter</span>
          </button>

          <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-800">
            Vous n'avez pas encore de compte ?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-red-400 hover:text-red-300 font-semibold underline underline-offset-2 ml-1"
            >
              Créer un compte avec mon téléphone
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
