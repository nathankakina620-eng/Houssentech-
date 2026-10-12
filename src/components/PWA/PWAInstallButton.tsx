import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  variant?: 'header' | 'banner' | 'floating';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Handle click for desktop/Android vs iOS vs fallback
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowAndroidGuide(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-2.5 rounded-xl shadow-lg border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Installer l'Application Mobile MotoPièces</p>
              <p className="text-xs text-red-100">Accès ultra-rapide hors-ligne, notifications des commandes & catalogue moto instantané</p>
            </div>
          </div>
          <button
            onClick={handleClick}
            className="w-full sm:w-auto px-4 py-1.5 bg-white text-red-600 hover:bg-red-50 active:scale-95 text-xs font-bold rounded-lg shadow transition flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Installer l'Appli
          </button>
        </div>

        {/* iOS Guide Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-red-500 font-bold">
                  <Smartphone className="w-5 h-5" />
                  <span>Installation sur iPhone / iPad</span>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="p-2 bg-slate-700 rounded-lg text-blue-400 shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Étape 1 :</span> Appuyez sur le bouton <strong>Partager</strong> dans Safari (en bas au centre de votre écran).
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="p-2 bg-slate-700 rounded-lg text-emerald-400 shrink-0">
                    <PlusSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Étape 2 :</span> Faites défiler et choisissez <strong>« Sur l'écran d'accueil »</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="p-2 bg-slate-700 rounded-lg text-amber-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Étape 3 :</span> Appuyez sur <strong>Ajouter</strong>. L'application MotoPièces apparaîtra sur votre écran d'accueil comme une vraie application !
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition"
              >
                Compris, merci !
              </button>
            </div>
          </div>
        )}

        {/* Android / Desktop Fallback Guide Modal */}
        {showAndroidGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-red-500 font-bold">
                  <Smartphone className="w-5 h-5" />
                  <span>Installer sur votre téléphone</span>
                </div>
                <button
                  onClick={() => setShowAndroidGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>
                  Dans le menu de votre navigateur Chrome / Edge (les 3 petits points verticaux en haut à droite) :
                </p>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 font-medium text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-red-400" />
                  Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                </div>
                <p className="text-xs text-slate-400">
                  L'application s'ouvrira en plein écran sans barre d'adresse comme une application native.
                </p>
              </div>

              <button
                onClick={() => setShowAndroidGuide(false)}
                className="mt-5 w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Header button variant
  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold transition"
        title="Installer l'application sur votre mobile ou bureau"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installer l'App</span>
        <span className="sm:hidden">App</span>
      </button>

      {/* Guide Modals */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-red-500">Installation iPhone / iPad</span>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>1. Touchez le bouton <strong>Partager</strong> en bas de Safari.</p>
              <p>2. Choisissez <strong>« Sur l'écran d'accueil »</strong>.</p>
              <p>3. Cliquez sur <strong>Ajouter</strong>.</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-500"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-red-500">Installation Mobile</span>
              <button onClick={() => setShowAndroidGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>Ouvrez le menu de Chrome (3 points) et choisissez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</p>
            </div>
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-4 w-full rounded-xl bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-500"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
