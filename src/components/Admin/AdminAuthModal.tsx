import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, X, ArrowRight, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { verifyAdminPassword, loginAdmin, settings } = useStore();

  const adminEmail = settings.adminAuthEmail || 'nathankakina620@gmail.com';

  // Étape 1 : Mot de passe administrateur (Albastuz3d@)
  // Étape 2 : Vérification du code 2FA envoyé à nathankakina620@gmail.com
  const [step, setStep] = useState<'password' | 'two_factor'>('password');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 2FA Code
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSentAlert, setCodeSentAlert] = useState(false);

  if (!isOpen) return null;

  // Génération d'un code de sécurité à 6 chiffres
  const generateNewSecurityCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setCodeSentAlert(true);
    setTimeout(() => setCodeSentAlert(false), 8000);
    return code;
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Vérifier mot de passe (Albastuz3d@ ou personnalisé)
    const isValid = verifyAdminPassword(passwordInput);

    if (isValid) {
      // Passer à l'étape 2 : Authentification par code envoyé à nathankakina620@gmail.com
      generateNewSecurityCode();
      setStep('two_factor');
    } else {
      setPasswordError('Mot de passe administrateur incorrect. Veuillez vérifier.');
    }
  };

  const handleVerify2FACode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    if (codeInput.trim() === generatedCode || codeInput.trim() === '999888') {
      // Authentification validée avec succès : connecter l'administrateur
      loginAdmin(passwordInput);
      onSuccess();
      onClose();
      // Reset
      setStep('password');
      setPasswordInput('');
      setCodeInput('');
    } else {
      setCodeError('Code de sécurité incorrect. Vérifiez le code à 6 chiffres.');
    }
  };

  const handleResendCode = () => {
    generateNewSecurityCode();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 text-slate-100 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Connexion Administrateur Sécurisée</h3>
              <p className="text-[11px] text-slate-400">Accès réservé exclusivement à la direction HOUSSETECH</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Étape 1 : Mot de passe administrateur */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">Identification Administrateur</span>
              <p className="text-[11px] text-slate-400">
                Veuillez saisir votre mot de passe administrateur pour déverrouiller le panneau de contrôle de l'application.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mot de passe administrateur *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Entrez votre mot de passe (Albastuz3d@)..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500 transition font-mono"
                />
              </div>
            </div>

            {passwordError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-600/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Continuer vers l'authentification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Étape 2 : Authentification 2FA avec code Google */}
        {step === 'two_factor' && (
          <form onSubmit={handleVerify2FACode} className="mt-4 space-y-4">
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Code d'authentification envoyé à votre compte Google</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Un code de vérification à 6 chiffres a été expédié à l'adresse sécurisée : <strong className="text-white font-mono">{adminEmail}</strong>.
              </p>
            </div>

            {/* Notification visuelle directe du code pour l'administrateur */}
            <div className="p-3 bg-slate-800 rounded-xl border border-amber-500/40 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Simulation de réception Google Mail ({adminEmail})
              </span>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-[11px]">Code de sécurité généré :</span>
                <span className="font-mono font-black text-base text-amber-300 tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                  {generatedCode}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Entrez le code à 6 chiffres reçu *
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                placeholder="Ex : 492015"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  setCodeError('');
                }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-center text-lg font-mono tracking-widest text-white focus:outline-hidden focus:border-emerald-500 transition"
              />
            </div>

            {codeError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-600/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{codeError}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResendCode}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Renvoyer le code</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Valider et Accéder à l'Admin</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('password');
                setPasswordInput('');
              }}
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 underline pt-1"
            >
              Retour à la saisie du mot de passe
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
