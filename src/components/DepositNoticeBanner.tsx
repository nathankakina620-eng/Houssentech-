import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ArrowRight,
  Info,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  MessageCircle,
  Truck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { computeShippingSchedule } from '../utils/shippingSchedule';

export const DepositNoticeBanner: React.FC = () => {
  const { settings, getWhatsAppUrl } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentSchedule = computeShippingSchedule();

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-red-500/15 to-amber-500/15 border-y sm:border sm:rounded-2xl border-amber-500/40 my-3 overflow-hidden shadow-lg backdrop-blur-md">
      {/* Top Bar */}
      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/40 animate-pulse mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600 text-white">
                HOUSSETECH OFFICIEL
              </span>
              <span className="text-xs font-bold text-amber-300">
                Acompte de {settings.depositPercentage}% pour achats &gt; {settings.depositThreshold}$
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                🎁 Livraison GRATUITE dès 200$
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1">
              {currentSchedule.cutoffExplanation} Acompte obligatoire de <strong className="text-amber-400">{settings.depositPercentage}%</strong> pour toute commande &gt; {settings.depositThreshold}$, solde de 30% à la livraison.
            </p>
          </div>
        </div>

        {/* Quick Social & Details Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {/* TikTok Direct Link */}
          {settings.tiktokUrl && (
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold transition shadow-xs"
              title="Voir les vidéos TikTok de nos articles"
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>Vidéos TikTok</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          )}

          {/* WhatsApp Direct */}
          <a
            href={getWhatsAppUrl(`Bonjour HOUSSETECH, je souhaite des informations sur vos pièces moto.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
            title="Contacter le gérant sur WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition"
          >
            <span className="hidden sm:inline">{isExpanded ? 'Réduire' : 'Règles & Horaires'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details: Wednesday 12h Rule & 70% Deposit Explanation */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-amber-500/20 bg-slate-900/80 text-xs sm:text-sm text-slate-300 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Rule 1: Wednesday Cutoff */}
            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-amber-500/40">
              <div className="flex items-center gap-2 font-bold text-amber-400 mb-1.5">
                <Clock className="w-4 h-4" />
                <span>Règle Cut-off : Mercredi à 12h00</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>
                  • <strong className="text-white">Lundi, Mardi & Mercredi avant 12h :</strong> Commande expédiée le <strong>samedi matin de la même semaine</strong> !
                </li>
                <li>
                  • <strong className="text-amber-300">Dès Mercredi à 12h00 :</strong> Commande programmée pour la semaine suivante (expédition le samedi matin d'après).
                </li>
              </ul>
            </div>

            {/* Rule 2: 70% Deposit */}
            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-red-500/40">
              <div className="flex items-center gap-2 font-bold text-red-400 mb-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Acompte Obligatoire de 70% (&gt; 200$)</span>
              </div>
              <p className="text-xs text-slate-300">
                Pour toute commande supérieure à 200$, le versement de 70% d'acompte par Mobile Money est obligatoire pour réserver et expédier les pièces. Les 30% restants sont payés à la livraison à Kinshasa.
              </p>
            </div>

            {/* Rule 3: Free Delivery */}
            <div className="bg-slate-800/90 p-3.5 rounded-xl border border-emerald-500/40">
              <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1.5">
                <Truck className="w-4 h-4" />
                <span>Livraison 100% GRATUITE (&ge; 200$)</span>
              </div>
              <p className="text-xs text-slate-300">
                Dès 200$ d'achat, les frais de transport et de passage transitaire vers Kinshasa sont intégralement offerts par HOUSSETECH.
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 text-amber-300">
              <Info className="w-4 h-4 shrink-0" />
              Prochain départ prévu par convoi transitaire : <strong className="text-white">{currentSchedule.targetSaturdayDate} matin</strong>.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
