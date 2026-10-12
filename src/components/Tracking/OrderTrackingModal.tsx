import React, { useState } from 'react';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Shield,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  Search,
  FileText,
  MessageSquare,
  ThumbsUp,
  XCircle,
  Download
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderTrackingStep, OrderRating } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenReceipt: (order: Order) => void;
}

export const OrderTrackingModal: React.FC<Props> = ({ isOpen, onClose, onOpenReceipt }) => {
  const { orders, currentUser, submitOrderRating, settings, getWhatsAppUrl } = useStore();
  const [searchCode, setSearchCode] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Rating state for arrived parcel
  const [speedStars, setSpeedStars] = useState(5);
  const [qualityStars, setQualityStars] = useState(5);
  const [deliveryStars, setDeliveryStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmittedSuccess, setRatingSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  // Find order
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    const query = searchCode.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerPhone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))
    );
    if (found) {
      setSelectedOrder(found);
    } else {
      alert(`Aucune commande trouvée pour "${searchCode}". Vérifiez votre numéro de commande.`);
    }
  };

  // User's orders
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerId === currentUser.id ||
          o.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '')
      )
    : orders;

  const currentOrder = selectedOrder || (userOrders.length > 0 ? userOrders[0] : null);

  // Tracking steps definition
  const TRACKING_STAGES = [
    {
      id: 'en_attente_approbation',
      title: '1. Commande reçue',
      desc: 'En attente de validation par le gérant',
      icon: Clock,
    },
    {
      id: 'acceptee',
      title: '2. Commande acceptée & Acompte 70%',
      desc: 'Acompte obligatoire vérifié et stock réservé',
      icon: CheckCircle2,
    },
    {
      id: 'policier_transitaire',
      title: '3. Contrôle Policier & Transitaire',
      desc: 'Vérification douanière et passage transitaire officiel',
      icon: Shield,
    },
    {
      id: 'en_expedition_kinshasa',
      title: '4. En expédition vers Kinshasa',
      desc: 'Départ sécurisé par convoi (chaque samedi matin)',
      icon: Truck,
    },
    {
      id: 'arrive_a_kinshasa',
      title: '5. Arrivé à Kinshasa !',
      desc: 'Prêt pour retrait au dépôt ou livraison à domicile',
      icon: MapPin,
    },
  ];

  const getStepProgressIndex = (status: OrderTrackingStep) => {
    switch (status) {
      case 'refusee':
        return -1;
      case 'en_attente_approbation':
        return 0;
      case 'acceptee':
      case 'en_attente_acompte':
      case 'acompte_recu':
      case 'en_preparation':
        return 1;
      case 'policier_transitaire':
        return 2;
      case 'en_expedition_kinshasa':
        return 3;
      case 'arrive_a_kinshasa':
      case 'livree':
        return 4;
      default:
        return 0;
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    submitOrderRating(currentOrder.id, {
      speedStars,
      qualityStars,
      deliveryStars,
      comment: ratingComment.trim(),
      ratedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    setRatingSubmittedSuccess(true);
    setTimeout(() => setRatingSubmittedSuccess(false), 3000);
  };

  const isArrivedInKinshasa =
    currentOrder && (currentOrder.status === 'arrive_a_kinshasa' || currentOrder.status === 'livree');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-100 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Suivi de Colis & Acheminement Kinshasa
              </h2>
              <p className="text-xs text-slate-400">
                Suivez le passage policier, le transitaire et l'arrivée à Kinshasa
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Entrez votre numéro de commande (ex: MP-2026-1001) ou votre téléphone..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 hover:bg-red-500 font-bold text-xs text-white rounded-xl shadow-md transition"
          >
            Rechercher
          </button>
        </form>

        {/* Current Order Tracking */}
        {currentOrder ? (
          <div className="mt-5 space-y-4">
            {/* Order Card Info */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-sm">
                    {currentOrder.orderNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">({currentOrder.createdAt})</span>
                </div>
                <div className="text-slate-300 mt-0.5">
                  Destinataire : <strong>{currentOrder.customerName}</strong> ({currentOrder.customerPhone})
                </div>
                <div className="text-slate-400">
                  Destination : <strong className="text-slate-200">{currentOrder.city}</strong>, {currentOrder.deliveryAddress}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                <span className="font-mono font-black text-emerald-400 text-sm">
                  Total : ${currentOrder.total.toFixed(2)}
                </span>
                <button
                  onClick={() => onOpenReceipt(currentOrder)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    currentOrder.adminDecision === 'acceptee' ||
                    ['acceptee', 'acompte_recu', 'en_preparation', 'policier_transitaire', 'en_expedition_kinshasa', 'arrive_a_kinshasa', 'livree'].includes(currentOrder.status)
                      ? 'bg-red-600 hover:bg-red-500 text-white font-bold'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {currentOrder.adminDecision === 'acceptee' ||
                    ['acceptee', 'acompte_recu', 'en_preparation', 'policier_transitaire', 'en_expedition_kinshasa', 'arrive_a_kinshasa', 'livree'].includes(currentOrder.status)
                      ? 'Reçu PDF Officiel'
                      : 'Devis (En attente)'}
                  </span>
                </button>
              </div>
            </div>

            {/* KEY REQUIREMENT: BANNIÈRE DE COMMANDE ACCEPTÉE AVEC TÉLÉCHARGEMENT DIRECT DU REÇU PDF */}
            {(currentOrder.adminDecision === 'acceptee' ||
              ['acceptee', 'acompte_recu', 'en_preparation', 'policier_transitaire', 'en_expedition_kinshasa', 'arrive_a_kinshasa', 'livree'].includes(
                currentOrder.status
              )) && (
              <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl text-emerald-200 shadow-xl space-y-2.5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
                        Validation Direction HOUSSETECH
                      </span>
                      <h4 className="text-sm font-black text-white">
                        Commande Officiellement Acceptée par le Gérant !
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenReceipt(currentOrder)}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition active:scale-95 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger le Reçu PDF</span>
                  </button>
                </div>

                <p className="text-[11px] text-emerald-300">
                  Votre commande a été acceptée avec succès. Vous pouvez maintenant télécharger le <strong>reçu officiel PDF</strong> qui prouve votre achat chez <strong>HOUSSETECH</strong> avec la date d'enregistrement ({currentOrder.createdAt}), le prix total (${currentOrder.total.toFixed(2)} USD) et le détail complet de vos pièces.
                </p>
              </div>
            )}

            {/* BANNIÈRE SI COMMANDE EN COURS DE VÉRIFICATION PAR L'ADMINISTRATION */}
            {currentOrder.adminDecision !== 'acceptee' &&
              !['acceptee', 'acompte_recu', 'en_preparation', 'policier_transitaire', 'en_expedition_kinshasa', 'arrive_a_kinshasa', 'livree'].includes(
                currentOrder.status
              ) &&
              currentOrder.status !== 'refusee' && (
                <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-2xl text-amber-200 shadow-md space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        Commande en attente de confirmation par l'administration HOUSSETECH
                      </h4>
                      <p className="text-[11px] text-amber-300">
                        Votre commande est enregistrée. L'administrateur vérifie la disponibilité et votre versement. Dès confirmation officielle :
                      </p>
                    </div>
                  </div>
                  <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5 pl-1">
                    <li>Le <strong>reçu officiel PDF</strong> (prouvant l'achat avec date, prix et détails) sera immédiatement activé pour téléchargement sur votre compte.</li>
                    <li>Le reçu sera également transmis directement sur votre WhatsApp (<strong>{currentOrder.customerPhone}</strong>).</li>
                  </ul>
                </div>
              )}

            {/* Special Saturday Shipping Badge */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-200">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong>Calendrier des Expéditions :</strong> Tous les colis validés partent en convoi officiel <strong>chaque samedi matin</strong> vers Kinshasa.
              </div>
            </div>

            {/* If order is refused */}
            {currentOrder.status === 'refusee' ? (
              <div className="p-4 bg-rose-950/40 border border-rose-600/50 rounded-xl text-xs text-rose-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>Commande Refusée par le Gérant</span>
                </div>
                <p>
                  Motif : {currentOrder.adminDecisionReason || 'Article épuisé ou acompte non versé dans les délais.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Contactez le gérant au {settings.companyPhone} pour toute réclamation.
                </p>
              </div>
            ) : (
              /* PROGRESS TIMELINE WITH REAL STAGES */
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Étapes d'acheminement du colis
                </h3>

                <div className="space-y-4">
                  {TRACKING_STAGES.map((stg, idx) => {
                    const currentIdx = getStepProgressIndex(currentOrder.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;
                    const IconComp = stg.icon;

                    return (
                      <div key={stg.id} className="flex items-start gap-3 relative">
                        {/* Connecting Line */}
                        {idx < TRACKING_STAGES.length - 1 && (
                          <div
                            className={`absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2 ${
                              currentIdx > idx ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                          />
                        )}

                        {/* Icon Node */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold transition ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          } ${isCurrent ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>

                        {/* Label & Details */}
                        <div className="flex-1 pb-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-xs font-bold ${
                                isDone ? 'text-white' : 'text-slate-500'
                              }`}
                            >
                              {stg.title}
                            </h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black uppercase">
                                En cours
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{stg.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3-DIMENSIONAL 5-STAR RATING SYSTEM UPON ARRIVAL IN KINSHASA */}
            {isArrivedInKinshasa && (
              <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-amber-950/30 p-4 rounded-xl border border-red-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Votre colis est arrivé à Kinshasa ! Notez votre expérience
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Évaluez nos services sur les 3 critères obligatoires (5 étoiles chacun) :
                    </p>
                  </div>
                </div>

                {currentOrder.rating ? (
                  /* Display already recorded rating */
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>Avis enregistré le {currentOrder.rating.ratedAt}</span>
                      <ThumbsUp className="w-4 h-4" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="bg-slate-900 p-2 rounded-lg">
                        <span className="text-slate-400 block">1. Rapidité :</span>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= currentOrder.rating!.speedStars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2 rounded-lg">
                        <span className="text-slate-400 block">2. Qualité du colis :</span>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= currentOrder.rating!.qualityStars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2 rounded-lg">
                        <span className="text-slate-400 block">3. Livraison :</span>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= currentOrder.rating!.deliveryStars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {currentOrder.rating.comment && (
                      <p className="p-2 bg-slate-900 rounded-lg text-slate-300 italic text-[11px]">
                        « {currentOrder.rating.comment} »
                      </p>
                    )}
                  </div>
                ) : (
                  /* Form to rate on 3 dimensions */
                  <form onSubmit={handleRatingSubmit} className="space-y-3 pt-1 text-xs">
                    {ratingSubmittedSuccess && (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Merci pour votre évaluation ! Vos notes ont été enregistrées.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Rapidité */}
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1.5">
                        <span className="font-bold text-slate-200 block">1. Rapidité (1 à 5★)</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              type="button"
                              key={val}
                              onClick={() => setSpeedStars(val)}
                              className="p-1 hover:scale-110 transition"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  val <= speedStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-amber-300">{speedStars}/5 étoiles</span>
                      </div>

                      {/* 2. Qualité du colis */}
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1.5">
                        <span className="font-bold text-slate-200 block">2. Qualité colis (1 à 5★)</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              type="button"
                              key={val}
                              onClick={() => setQualityStars(val)}
                              className="p-1 hover:scale-110 transition"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  val <= qualityStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-amber-300">{qualityStars}/5 étoiles</span>
                      </div>

                      {/* 3. Livraison */}
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1.5">
                        <span className="font-bold text-slate-200 block">3. Livraison (1 à 5★)</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              type="button"
                              key={val}
                              onClick={() => setDeliveryStars(val)}
                              className="p-1 hover:scale-110 transition"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  val <= deliveryStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-amber-300">{deliveryStars}/5 étoiles</span>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Laissez un commentaire sur la livraison à Kinshasa (optionnel)..."
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 font-bold text-xs text-slate-950 rounded-xl shadow-md transition"
                    >
                      Envoyer mes 3 notes d'évaluation
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Entrez votre numéro de commande ci-dessus pour suivre votre colis en direct.
          </div>
        )}
      </div>
    </div>
  );
};
