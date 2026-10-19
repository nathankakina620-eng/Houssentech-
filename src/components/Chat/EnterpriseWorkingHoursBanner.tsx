import React, { useState } from 'react';
import { Clock, Calendar, ShieldCheck, Truck, Pin, ChevronDown, ChevronUp, Building2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getKinshasaNow, formatKinshasaTime } from '../../utils/dateUtils';

interface Props {
  compact?: boolean;
}

export const EnterpriseWorkingHoursBanner: React.FC<Props> = ({ compact = false }) => {
  const { settings, currentUser } = useStore();
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Déterminer en temps réel si l'entreprise est ouverte ou fermée selon l'heure officielle de Kinshasa (UTC+1)
  const now = getKinshasaNow();
  const day = now.getDay(); // 0: Dimanche, 1: Lundi, ..., 6: Samedi
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeDec = hours + minutes / 60;
  const kinshasaTimeDisplay = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  let isOpenNow = false;
  let statusText = '🔴 Actuellement Fermé';
  let nextOpenText = 'Réouverture Lundi à 08h00';

  if (day >= 1 && day <= 5) {
    // Lundi au Vendredi : 08h00 à 16h30
    if (currentTimeDec >= 8 && currentTimeDec < 16.5) {
      isOpenNow = true;
      statusText = '🟢 Actuellement Ouvert';
      nextOpenText = 'Fermeture aujourd\'hui à 16h30';
    } else if (currentTimeDec < 8) {
      statusText = '🔴 Actuellement Fermé';
      nextOpenText = 'Ouverture ce matin à 08h00';
    } else {
      statusText = '🔴 Actuellement Fermé';
      nextOpenText = day === 5 ? 'Réouverture Samedi à 08h00' : 'Réouverture Demain à 08h00';
    }
  } else if (day === 6) {
    // Samedi : 08h00 à 14h00
    if (currentTimeDec >= 8 && currentTimeDec < 14) {
      isOpenNow = true;
      statusText = '🟢 Actuellement Ouvert (Samedi)';
      nextOpenText = 'Fermeture aujourd\'hui à 14h00';
    } else if (currentTimeDec < 8) {
      statusText = '🔴 Actuellement Fermé';
      nextOpenText = 'Ouverture ce matin à 08h00';
    } else {
      statusText = '🔴 Actuellement Fermé';
      nextOpenText = 'Réouverture Lundi à 08h00';
    }
  } else {
    // Dimanche : Fermé
    statusText = '🔴 Fermé (Dimanche)';
    nextOpenText = 'Réouverture Lundi matin à 08h00';
  }

  return (
    <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 dark:from-red-950/60 dark:to-amber-950/40 light:from-red-50 light:to-amber-50 border-b-2 border-red-500/50 p-3 sm:p-3.5 shadow-md text-xs transition-colors">
      {/* En-tête épinglé obligatoire en première position */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-600 text-white shrink-0 shadow-xs">
            <Pin className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white dark:text-white light:text-slate-900 uppercase tracking-tight text-[11px] sm:text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-500" />
                <span>HOUSSETECH • Horaires & Modes de Travail Officiels</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-red-500/20 text-red-300 dark:text-red-300 light:text-red-700 border border-red-500/30">
                Épinglé
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600">
              Message permanent pour le suivi de vos commandes & contact gérant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700" title="Heure officielle actuelle à Kinshasa (UTC+1)">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Kinshasa {kinshasaTimeDisplay}</span>
          </span>

          <span
            className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isOpenNow
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
            title={nextOpenText}
          >
            <span>{statusText}</span>
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-200 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition cursor-pointer"
            title={isExpanded ? 'Réduire' : 'Afficher tous les détails'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Résumé compact des horaires toujours visible */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        {/* Horaires Lun-Ven & Samedi */}
        <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white p-2 sm:p-2.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white dark:text-white light:text-slate-900 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Nos Heures de Travail :</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10.5px]">
            <div className="p-1 rounded bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100">
              <span className="text-slate-400 dark:text-slate-400 light:text-slate-500 block text-[9.5px]">Lundi au Vendredi :</span>
              <strong className="text-white dark:text-white light:text-slate-900 font-mono">08h00 à 16h30</strong>
            </div>
            <div className="p-1 rounded bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100">
              <span className="text-slate-400 dark:text-slate-400 light:text-slate-500 block text-[9.5px]">Le Samedi :</span>
              <strong className="text-amber-400 dark:text-amber-400 light:text-amber-600 font-mono">08h00 à 14h00</strong>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 flex items-center justify-between">
            <span>Dimanche : <strong className="text-rose-400">Fermé</strong></span>
            <span className="text-emerald-400 font-mono text-[9px]">{nextOpenText}</span>
          </div>
        </div>

        {/* Règles de commandes & convoi */}
        <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white p-2 sm:p-2.5 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white dark:text-white light:text-slate-900 text-[11px]">
            <Truck className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>Modes de Travail pour chaque Commande :</span>
          </div>
          <ul className="text-[10.5px] text-slate-300 dark:text-slate-300 light:text-slate-700 space-y-0.5">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span><strong>Acompte 70%</strong> dès 200$ d'achat (solde 30% à la livraison).</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span><strong>Expédition convoi :</strong> chaque samedi matin vers Kinshasa.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Détails supplémentaires en mode déroulé */}
      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 space-y-1.5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10.5px]">
            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 p-2 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <span className="font-bold text-white dark:text-white light:text-slate-900 block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                1. Validation Administrateur
              </span>
              <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-[10px] mt-0.5">
                Chaque article est examiné et validé par l'administrateur depuis son compte officiel.
              </p>
            </div>

            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 p-2 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <span className="font-bold text-white dark:text-white light:text-slate-900 block flex items-center gap-1">
                <Truck className="w-3 h-3 text-blue-400" />
                2. Traçabilité du Colis
              </span>
              <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-[10px] mt-0.5">
                Suivi étape par étape : contrôle policier, transitaire et arrivée au dépôt de Kinshasa.
              </p>
            </div>

            <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 p-2 rounded-lg border border-slate-800 dark:border-slate-800 light:border-slate-200">
              <span className="font-bold text-white dark:text-white light:text-slate-900 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                3. Facture & Reçu Officiel
              </span>
              <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-[10px] mt-0.5">
                Reçu PDF avec QR Code unique téléchargeable dès l'acceptation de la commande.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 italic text-center pt-0.5">
            Ce message officiel reste fixé en premier au-dessus de vos conversations pour que vous puissiez toujours consulter nos heures et modes de travail.
          </p>
        </div>
      )}
    </div>
  );
};
