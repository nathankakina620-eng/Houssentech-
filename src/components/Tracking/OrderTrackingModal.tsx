import React, { useState, useRef, useEffect } from 'react';
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
  Download,
  Send,
  Phone,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  User,
  Lock,
  ImagePlus,
  Camera,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderTrackingStep, OrderRating } from '../../types';
import { EnterpriseWorkingHoursBanner } from '../Chat/EnterpriseWorkingHoursBanner';
import { ChatImageLightbox } from '../Chat/ChatImageLightbox';
import { ChatImageUploader } from '../Chat/ChatImageUploader';
import { ChatMessageBubbleImages } from '../Chat/ChatMessageBubbleImages';
import { CustomerFAQSection } from './CustomerFAQSection';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenReceipt: (order: Order) => void;
  initialTab?: 'orders' | 'tracking' | 'chat' | 'faq';
}

export const OrderTrackingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenReceipt,
  initialTab = 'orders',
}) => {
  const {
    orders,
    currentUser,
    submitOrderRating,
    settings,
    getWhatsAppUrl,
    chatMessages,
    sendChatMessage,
    markChatAsRead,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'chat' | 'faq'>(initialTab);
  const [orderFilter, setOrderFilter] = useState<'all' | 'accepted' | 'pending'>('all');
  const [searchCode, setSearchCode] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatImages, setChatImages] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rating state for arrived parcel
  const [speedStars, setSpeedStars] = useState(5);
  const [qualityStars, setQualityStars] = useState(5);
  const [deliveryStars, setDeliveryStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmittedSuccess, setRatingSubmittedSuccess] = useState(false);

  // Synchroniser l'onglet initial lors de l'ouverture
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Filtrer les commandes pour le client courant
  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.customerId === currentUser.id ||
          o.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '')
      )
    : orders;

  const currentOrder = selectedOrder || (userOrders.length > 0 ? userOrders[0] : null);

  // Identifier le client pour la discussion avec l'administrateur
  const activeCustId =
    currentUser?.id ||
    (currentOrder?.customerId) ||
    (currentOrder?.customerPhone ? `guest-${currentOrder.customerPhone.replace(/[^0-9]/g, '')}` : 'guest-current');

  const customerDisplayName = currentUser?.fullName || currentOrder?.customerName || 'Client Moto';
  const customerDisplayPhone = currentUser?.phone || currentOrder?.customerPhone || '';

  // Historique de la conversation entre ce client et l'administrateur
  const conversation = chatMessages.filter(
    (m) =>
      m.customerId === activeCustId ||
      (currentUser && m.customerId === currentUser.id) ||
      (currentOrder && m.customerPhone && currentOrder.customerPhone && m.customerPhone.replace(/[^0-9]/g, '') === currentOrder.customerPhone.replace(/[^0-9]/g, ''))
  );

  // Défilement automatique vers le bas de la conversation
  useEffect(() => {
    if (activeTab === 'chat') {
      markChatAsRead(activeCustId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, conversation.length, activeCustId, markChatAsRead]);

  // Envoi d'un message avec ou sans photo au gérant
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && chatImages.length === 0) return;

    sendChatMessage(
      chatInput.trim(),
      activeCustId,
      customerDisplayName,
      customerDisplayPhone,
      'client',
      chatImages
    );
    setChatInput('');
    setChatImages([]);
  };

  // Recherche de commande
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
      setActiveTab('orders');
    } else {
      alert(`Aucune commande trouvée pour "${searchCode}". Vérifiez votre numéro de commande.`);
    }
  };

  // Helper pour savoir si une commande est officiellement acceptée
  const isOrderAccepted = (order: Order) => {
    return (
      order.adminDecision === 'acceptee' ||
      ['acceptee', 'acompte_recu', 'en_preparation', 'policier_transitaire', 'en_expedition_kinshasa', 'arrive_a_kinshasa', 'livree'].includes(
        order.status
      )
    );
  };

  // Séparation des commandes pour les compteurs
  const acceptedOrdersList = userOrders.filter(isOrderAccepted);
  const pendingOrdersList = userOrders.filter(
    (o) => !isOrderAccepted(o) && o.status !== 'refusee'
  );

  // Filtrage selon le filtre actif
  const displayedOrders = userOrders.filter((order) => {
    if (orderFilter === 'accepted') return isOrderAccepted(order);
    if (orderFilter === 'pending') return !isOrderAccepted(order) && order.status !== 'refusee';
    return true;
  });

  // Tracking stages definition
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
      desc: 'Acompte obligatoire vérifié et stock réservé au dépôt',
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
      desc: 'Départ sécurisé par convoi transitaire (chaque samedi matin)',
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
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-100 my-6 max-h-[94vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header principal de l'Angle Client */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-500 rounded-2xl border border-red-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Mon Angle Client — HOUSSETECH
                </h2>
                {currentUser && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    Compte Validé
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {currentUser
                  ? `Connecté en tant que ${currentUser.fullName} (${currentUser.phone})`
                  : 'Suivi de vos commandes, articles commandés & échange avec le gérant'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
              title="Quitter et revenir voir les articles sur la page d'accueil"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter & voir les articles</span>
              <span className="sm:hidden">Articles</span>
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barre de navigation interne de l'Espace Client avec FAQ Dynamique */}
        <div className="mt-3 flex items-center justify-between gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[120px] py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="truncate">Mes Articles</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-mono">
              {userOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 min-w-[105px] py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'tracking'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="truncate">Suivi Colis</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 min-w-[130px] py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 relative ${
              activeTab === 'chat'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="truncate">Conversation</span>
            {conversation.some((m) => m.sender === 'admin' && !m.read) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 min-w-[145px] py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="truncate">FAQ Délais & Paiements</span>
            <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded-md text-[9px] font-bold">
              Auto
            </span>
          </button>
        </div>

        {/* Zone de recherche rapide si le client a un autre numéro de commande */}
        <form onSubmit={handleSearch} className="mt-3 flex gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par N° de commande (ex: HT-2026-...) ou téléphone..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 rounded-xl transition"
          >
            Chercher
          </button>
        </form>

        {/* Corps principal défilable avec les 3 onglets */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-4">
          {/* ================= ONGLET 1 : ARTICLES COMMANDÉS & STATUTS (ACCEPTÉ VS EN ATTENTE) ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Deux grandes cartes récapitulatives demandées par le gérant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderFilter('accepted')}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-start justify-between gap-3 ${
                    orderFilter === 'accepted'
                      ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-950/30 ring-2 ring-emerald-500/40'
                      : 'bg-emerald-950/40 border-emerald-500/30 hover:bg-emerald-950/60'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                      Articles Acceptés par l'Admin
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {acceptedOrdersList.length} <span className="text-xs font-semibold text-emerald-300">commande(s) validée(s)</span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Reçu officiel PDF débloqué • Réservé au dépôt pour convoi transitaire samedi matin
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderFilter('pending')}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-start justify-between gap-3 ${
                    orderFilter === 'pending'
                      ? 'bg-amber-950/80 border-amber-500 shadow-lg shadow-amber-950/30 ring-2 ring-amber-500/40'
                      : 'bg-amber-950/40 border-amber-500/30 hover:bg-amber-950/60'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                      En attente d'acceptation chez l'Admin
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {pendingOrdersList.length} <span className="text-xs font-semibold text-amber-300">commande(s) en attente</span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Vérification des pièces et acompte par l'administrateur • Notification dès accord
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 shadow-md font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                </button>
              </div>

              {/* Filtres par statuts d'acceptation */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 font-bold">Vue des articles :</span>
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    orderFilter === 'all'
                      ? 'bg-slate-200 text-slate-900 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Tous ({userOrders.length})
                </button>

                <button
                  onClick={() => setOrderFilter('accepted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    orderFilter === 'accepted'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-950/70'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Articles Acceptés ({acceptedOrdersList.length})</span>
                </button>

                <button
                  onClick={() => setOrderFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    orderFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'bg-amber-950/40 text-amber-400 border border-amber-500/30 hover:bg-amber-950/70'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>En attente d'acceptation ({pendingOrdersList.length})</span>
                </button>
              </div>

              {/* Liste détaillée des commandes */}
              {displayedOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800 p-6 space-y-2">
                  <Package className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-300">Aucun article dans cette catégorie</p>
                  <p className="text-xs text-slate-500">
                    Vos commandes passées apparaîtront ici avec la liste complète des articles et le statut d'acceptation.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedOrders.map((order) => {
                    const accepted = isOrderAccepted(order);

                    return (
                      <div
                        key={order.id}
                        className={`rounded-2xl border p-4 space-y-4 transition ${
                          accepted
                            ? 'bg-slate-900/95 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                            : 'bg-slate-900/90 border-slate-700'
                        }`}
                      >
                        {/* En-tête de la commande */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-white">
                                {order.orderNumber}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Passée le {order.createdAt}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Destinataire : <strong className="text-slate-200">{order.customerName}</strong> ({order.customerPhone}) • {order.city}
                            </p>
                          </div>

                          {/* Badge de statut d'acceptation officiel */}
                          <div>
                            {accepted ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-black shadow-md">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                                <span>OFFICIELLEMENT ACCEPTÉE PAR L'ADMINISTRATEUR</span>
                              </div>
                            ) : order.status === 'refusee' ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-black">
                                <XCircle className="w-4 h-4 text-rose-400" />
                                <span>COMMANDE REFUSÉE</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-300 text-xs font-black">
                                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                                <span>EN ATTENTE D'ACCEPTATION CHEZ L'ADMINISTRATEUR</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bannière explicative d'acceptation et actions reçus */}
                        {accepted ? (
                          <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200">
                            <div>
                              <p className="font-bold text-white flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Commande validée & Versement confirmé</span>
                              </p>
                              <p className="text-[11px] text-emerald-300/90 mt-0.5">
                                Votre reçu officiel certifié HOUSSETECH (date, prix et détails des articles) est débloqué.
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => onOpenReceipt(order)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Télécharger le Reçu PDF</span>
                              </button>
                              <button
                                onClick={() => {
                                  const text = `Bonjour HOUSSETECH, voici mon reçu officiel pour la commande acceptée ${order.orderNumber} ($${order.total.toFixed(2)} USD).`;
                                  window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                                title="Envoyer le reçu sur mon WhatsApp"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Mon WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        ) : order.status !== 'refusee' ? (
                          <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/40 text-xs text-amber-200 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-amber-300">
                              <Clock className="w-4 h-4 text-amber-400" />
                              <span>En cours d'examen par la direction</span>
                            </div>
                            <p className="text-[11px] text-slate-300">
                              Votre commande est enregistrée dans le système. L'administrateur vérifie la disponibilité de vos pièces et votre acompte. Dès confirmation officielle :
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-300">
                              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Le reçu officiel PDF sera activé automatiquement pour téléchargement sur votre compte et envoyé sur votre WhatsApp ({order.customerPhone}).</span>
                            </div>
                          </div>
                        ) : null}

                        {/* LISTE COMPLÈTE DES ARTICLES COMMANDÉS AVEC TOUS LES DÉTAILS */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-red-500" />
                            <span>Articles commandés ({order.items.length})</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.items.map((item, itIdx) => (
                              <div
                                key={itIdx}
                                className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 text-xs"
                              >
                                <img
                                  src={item.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80'}
                                  alt={item.name}
                                  className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-[9px] font-black uppercase text-red-400 block truncate">
                                    {item.brand}
                                  </span>
                                  <h5 className="font-bold text-white text-xs truncate">
                                    {item.name}
                                  </h5>
                                  <div className="flex items-center justify-between mt-1 text-[11px]">
                                    <span className="text-slate-400">
                                      Quantité : <strong className="text-white font-mono">{item.quantity}</strong>
                                    </span>
                                    <span className="font-mono font-black text-white">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Récapitulatif financier & logistique */}
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-0.5 text-[11px] text-slate-300">
                            <div>Sous-total : <strong className="font-mono text-white">${order.subtotal.toFixed(2)}</strong></div>
                            <div>Livraison : <strong className={order.isFreeDelivery ? 'text-emerald-400 font-bold' : 'text-white font-mono'}>{order.isFreeDelivery ? 'OFFERTE (>= 200$)' : `$${order.deliveryFee.toFixed(2)}`}</strong></div>
                            <div className="text-xs pt-0.5">
                              PRIX TOTAL : <strong className="font-mono font-black text-red-400 text-sm">${order.total.toFixed(2)} USD</strong>
                            </div>
                            {order.isDepositRequired && (
                              <div className="text-[10px] text-amber-300 pt-0.5">
                                Acompte 70% : <strong>${order.depositAmount.toFixed(2)}</strong> • Solde à Kinshasa (30%) : <strong>${order.remainingBalance.toFixed(2)}</strong>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setActiveTab('tracking');
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                            >
                              <Truck className="w-3.5 h-3.5 text-red-400" />
                              <span>Suivre ce colis</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setActiveTab('chat');
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                              <span>Discuter avec le gérant</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= ONGLET 2 : SUIVI DU COLIS EN TEMPS RÉEL ================= */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              {currentOrder ? (
                <>
                  {/* Carte info commande sélectionnée pour suivi */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-sm">
                          {currentOrder.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">({currentOrder.createdAt})</span>
                      </div>
                      <div className="text-slate-300 mt-0.5">
                        Client : <strong>{currentOrder.customerName}</strong> ({currentOrder.customerPhone})
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                          isOrderAccepted(currentOrder)
                            ? 'bg-red-600 hover:bg-red-500 text-white font-bold'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {isOrderAccepted(currentOrder) ? 'Reçu PDF Officiel' : 'Devis (En attente)'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Règle expédition samedi */}
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-amber-200">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <strong>Départ Convoi Transitaire :</strong> Tous les colis validés partent en convoi officiel <strong>chaque samedi matin</strong> vers Kinshasa.
                    </div>
                  </div>

                  {/* TIMELINE DES 5 ÉTAPES */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
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
                            {idx < TRACKING_STAGES.length - 1 && (
                              <div
                                className={`absolute left-4 top-8 bottom-0 w-0.5 -translate-x-1/2 ${
                                  currentIdx > idx ? 'bg-emerald-500' : 'bg-slate-800'
                                }`}
                              />
                            )}

                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold transition ${
                                isDone
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              } ${isCurrent ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                            >
                              <IconComp className="w-4 h-4" />
                            </div>

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

                  {/* NOTATION EN 3 CRITÈRES DÈS ARRIVÉE À KINSHASA */}
                  {isArrivedInKinshasa && (
                    <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-amber-950/30 p-4 rounded-2xl border border-red-500/40 space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase">
                          Colis arrivé à Kinshasa ! Évaluez notre service
                        </h4>
                      </div>

                      {currentOrder.rating ? (
                        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1 text-xs">
                          <p className="text-emerald-400 font-bold">Avis enregistré avec succès</p>
                          <p className="text-[11px] text-slate-300">Rapidité : {currentOrder.rating.speedStars}/5★ • Qualité : {currentOrder.rating.qualityStars}/5★ • Livraison : {currentOrder.rating.deliveryStars}/5★</p>
                        </div>
                      ) : (
                        <form onSubmit={handleRatingSubmit} className="space-y-3 text-xs">
                          {ratingSubmittedSuccess && (
                            <div className="p-2 bg-emerald-950 text-emerald-300 rounded-lg">
                              Merci pour votre évaluation !
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-800 p-2 rounded-xl text-center">
                              <span className="text-[10px] text-slate-400 block">1. Rapidité</span>
                              <div className="flex justify-center gap-0.5 mt-1">
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <button type="button" key={val} onClick={() => setSpeedStars(val)}>
                                    <Star className={`w-3.5 h-3.5 ${val <= speedStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="bg-slate-800 p-2 rounded-xl text-center">
                              <span className="text-[10px] text-slate-400 block">2. Qualité</span>
                              <div className="flex justify-center gap-0.5 mt-1">
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <button type="button" key={val} onClick={() => setQualityStars(val)}>
                                    <Star className={`w-3.5 h-3.5 ${val <= qualityStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="bg-slate-800 p-2 rounded-xl text-center">
                              <span className="text-[10px] text-slate-400 block">3. Livraison</span>
                              <div className="flex justify-center gap-0.5 mt-1">
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <button type="button" key={val} onClick={() => setDeliveryStars(val)}>
                                    <Star className={`w-3.5 h-3.5 ${val <= deliveryStars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <input
                            type="text"
                            placeholder="Votre commentaire sur la livraison (optionnel)..."
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                          />

                          <button
                            type="submit"
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                          >
                            Envoyer mes notes d'évaluation
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Sélectionnez ou recherchez une commande ci-dessus pour afficher le suivi en direct.
                </div>
              )}
            </div>
          )}

          {/* ================= ONGLET 3 : NOTRE CONVERSATION ENTRE LUI ET MOI L'ADMINISTRATEUR ================= */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[520px] bg-slate-950/70 rounded-2xl border border-slate-800 overflow-hidden">
              {/* En-tête de conversation */}
              <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                    HT
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <span>Direction HOUSSETECH (Administrateur)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Vos échanges officiels, confirmations d'acompte et notifications
                    </p>
                  </div>
                </div>

                <a
                  href={getWhatsAppUrl(`Bonjour Administrateur HOUSSETECH, je suis ${customerDisplayName} (${customerDisplayPhone}) et je vous écris depuis mon Angle Client...`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-xl shadow-xs flex items-center gap-1 transition"
                  title="Ouvrir WhatsApp direct"
                >
                  <Phone className="w-3 h-3" />
                  <span>WhatsApp ({settings.companyPhone})</span>
                </a>
              </div>

              {/* MESSAGE PERMANENT ÉPINGLÉ EN PREMIÈRE POSITION AU-DESSUS DE TOUTES NOS CONVERSATIONS */}
              {/* Visible dès l'inscription du client pour qu'il ait toujours recours à nos horaires (Lun-Ven 8h-16h30, Sam 8h-14h) et modes de travail */}
              {currentUser ? (
                <EnterpriseWorkingHoursBanner />
              ) : (
                <div className="p-2.5 bg-amber-950/40 border-b border-amber-800/40 text-[11px] text-amber-200 flex items-center justify-between">
                  <span>🔒 Les horaires officiels (Lun-Ven 8h-16h30, Sam 8h-14h) et modes de travail sont activés dès votre inscription client.</span>
                </div>
              )}

              {/* Messages échangés */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                {conversation.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-600" />
                    <p className="font-semibold text-slate-300">Aucun message pour le moment</p>
                    <p className="text-[11px] text-slate-500 max-w-sm">
                      Dès qu'une commande est acceptée, l'administrateur vous envoie la notification ici. Vous pouvez aussi lui écrire directement ci-dessous.
                    </p>
                  </div>
                ) : (
                  conversation.map((msg) => {
                    const isAdminMsg = msg.sender === 'admin';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdminMsg ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-slate-400">
                            {isAdminMsg ? '👑 Administrateur HOUSSETECH' : customerDisplayName}
                          </span>
                          <span className="text-[9px] text-slate-500">{msg.createdAt}</span>
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl p-3 shadow-md text-xs leading-relaxed ${
                            isAdminMsg
                              ? 'bg-slate-800 border border-red-500/30 text-slate-100 rounded-tl-xs'
                              : 'bg-red-600 text-white rounded-tr-xs'
                          }`}
                        >
                          {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}
                          <ChatMessageBubbleImages
                            images={msg.images}
                            onImageClick={(url) => setLightboxImage(url)}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulaire d'envoi de message avec support d'une ou plusieurs photos */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-900 border-t border-slate-800 space-y-2">
                {/* Prévisualisation des photos sélectionnées */}
                <ChatImageUploader
                  images={chatImages}
                  onImagesChange={setChatImages}
                />

                <div className="flex items-center gap-2">
                  {/* Bouton pour joindre des photos */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title="Joindre une ou plusieurs photos"
                  >
                    <ImagePlus className="w-4 h-4 text-red-500" />
                    <span className="hidden sm:inline text-[11px] font-semibold">Photo</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const promises = Array.from(files).map((f) => {
                        return new Promise<string>((res) => {
                          const r = new FileReader();
                          r.onload = (ev) => res(ev.target?.result as string);
                          r.readAsDataURL(f);
                        });
                      });
                      Promise.all(promises).then((imgs) => {
                        setChatImages((prev) => [...prev, ...imgs]);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      });
                    }}
                    className="hidden"
                  />

                  <input
                    type="text"
                    placeholder="Écrivez votre message ou envoyez vos photos à l'administrateur..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim() && chatImages.length === 0}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Envoyer</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= ONGLET 4 : FAQ DYNAMIQUE (DÉLAIS DE LIVRAISON & MODALITÉS DE PAIEMENT) ================= */}
          {activeTab === 'faq' && (
            <CustomerFAQSection
              onGoToChat={(prefill) => {
                if (prefill) {
                  setChatInput(prefill);
                }
                setActiveTab('chat');
              }}
              onGoToTracking={() => setActiveTab('tracking')}
            />
          )}
        </div>
      </div>

      {/* Lightbox plein écran pour agrandir les photos envoyées */}
      <ChatImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};
