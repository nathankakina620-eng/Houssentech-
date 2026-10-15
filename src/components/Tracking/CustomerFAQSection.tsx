import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  Truck,
  CreditCard,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ThumbsUp,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export interface FAQItem {
  id: string;
  category: 'delais' | 'paiement' | 'transit' | 'horaires';
  question: string;
  answer: string;
  keyPoints: string[];
  keywords: string[];
  badge?: string;
}

const FAQ_DATABASE: FAQItem[] = [
  {
    id: 'delais-convoi',
    category: 'delais',
    badge: 'Expédition Clé',
    question: "Quand et comment mon colis ou ma moto part-il vers Kinshasa ?",
    answer:
      "Toutes les expéditions de convois sécurisés vers Kinshasa s'effectuent chaque samedi matin au départ de notre plateforme transitaire en Angola. Pour qu'une commande parte le samedi, l'acompte de 70% doit avoir été validé avant le vendredi 16h30, permettant d'effectuer les contrôles policiers et formalités transitaires préalables.",
    keyPoints: [
      "Départ officiel : Chaque Samedi Matin sans exception.",
      "Clôture d'intégration : Vendredi avant 16h30.",
      "Acompte obligatoire : 70% validé par le gérant.",
    ],
    keywords: [
      'délai', 'délais', 'quand', 'part', 'départ', 'convoi', 'samedi', 'kinshasa', 'angola', 'transport', 'expédition', 'camion', 'route'
    ],
  },
  {
    id: 'delais-duree',
    category: 'delais',
    badge: 'Délais 4-7 Jours',
    question: "Combien de temps dure le transport jusqu'à Kinshasa ?",
    answer:
      "Le délai moyen d'acheminement entre le départ du convoi en Angola et l'arrivée au dépôt central à Kinshasa est de 4 à 7 jours ouvrés. Ce délai intègre la traversée du corridor routier transfrontalier, le passage du poste frontalier et le déchargement sécurisé.",
    keyPoints: [
      "Durée constatée : 4 à 7 jours ouvrés après le départ du samedi.",
      "Trajet sécurisé avec escorte transitaire agréée.",
      "Notification automatique dès l'arrivée physique à Kinshasa.",
    ],
    keywords: [
      'combien', 'temps', 'durée', 'délai', 'jours', 'quand', 'recevoir', 'kinshasa', 'arrivée', 'attente'
    ],
  },
  {
    id: 'paiement-acompte',
    category: 'paiement',
    badge: 'Obligatoire 70%',
    question: "Pourquoi un acompte obligatoire de 70% est-il exigé avant l'expédition ?",
    answer:
      "L'acompte de 70% est strictement obligatoire pour toute commande acceptée. Il permet de : 1) Réserver physiquement les motos ou pièces détachées au dépôt central d'Angola ; 2) Payer les taxes de transit douanier et les frais de contrôle policier transitaire ; 3) Sécuriser la place de votre matériel dans le convoi du samedi matin.",
    keyPoints: [
      "70% payés à la validation : pour stock & dédouanement officiel.",
      "Le solde de 30% restant : payé UNIQUEMENT à Kinshasa à la réception.",
      "Protection mutuelle contre les désistements et faux numéros.",
    ],
    keywords: [
      'acompte', '70%', 'pourquoi', 'avance', 'payer', 'modalités', 'paiement', 'argent', 'montant', 'obligation'
    ],
  },
  {
    id: 'paiement-moyens',
    category: 'paiement',
    badge: 'Mobile Money & Cash',
    question: "Quels sont les moyens de paiement acceptés pour verser l'acompte ?",
    answer:
      "Nous acceptons les paiements sécurisés par Mobile Money en RDC (Vodacom M-Pesa, Airtel Money, Orange Money) ainsi que les règlements directs ou virements validés avec la direction. Les coordonnées exactes vous sont communiquées lors de la confirmation.",
    keyPoints: [
      "Vodacom M-Pesa, Airtel Money, Orange Money.",
      "Numéro officiel de l'entreprise : +243 897 662 089.",
      "Toute transaction donne lieu à un bordereau/facture proforma avec numéro unique.",
    ],
    keywords: [
      'm-pesa', 'airtel', 'orange', 'mobile money', 'comment payer', 'banque', 'espèces', 'dollar', 'cdf', 'devises', 'numéro'
    ],
  },
  {
    id: 'paiement-preuve',
    category: 'paiement',
    badge: 'Envoi Photos',
    question: "Comment envoyer ma preuve de paiement ou mon reçu d'acompte ?",
    answer:
      "Dès que vous effectuez le transfert, vous pouvez envoyer la capture d'écran ou la photo du reçu directement dans l'onglet « Notre Conversation Admin » de votre Espace Client (icône Photo / Joindre des images), ou par WhatsApp au +243 897 662 089. L'administrateur valide alors votre statut en moins de 30 minutes pendant les heures ouvrables.",
    keyPoints: [
      "Nouveau : joignez directement une ou plusieurs photos dans la messagerie du site !",
      "Ou envoi direct sur WhatsApp au numéro officiel.",
      "Validation rapide par l'administrateur avec mise à jour du suivi.",
    ],
    keywords: [
      'preuve', 'capture', 'reçu', 'photo', 'screenshot', 'justificatif', 'envoi', 'valider', 'confirmation'
    ],
  },
  {
    id: 'paiement-solde-30',
    category: 'paiement',
    badge: 'Solde à l’Arrivée',
    question: "À quel moment et où dois-je régler le solde restant de 30% ?",
    answer:
      "Le solde de 30% restant n'est exigible que lorsque votre colis est physiquement arrivé à Kinshasa (Étape 5 du suivi). Vous pouvez l'acquitter au moment du retrait au dépôt de Kinshasa ou lors de la remise en main propre par notre livreur, après avoir inspecté votre matériel.",
    keyPoints: [
      "0 risque pour le client : solde réglé uniquement après vérification visuelle.",
      "Règlement en espèces ou Mobile Money sur place.",
      "Délivrance de la facture finale acquittée.",
    ],
    keywords: [
      'solde', '30%', 'reste', 'fin', 'quand payer', 'réception', 'dépôt', 'kinshasa', 'livraison'
    ],
  },
  {
    id: 'transit-police',
    category: 'transit',
    badge: 'Étape 3 Officielle',
    question: "En quoi consiste l'étape Contrôle Policier & Transitaire ?",
    answer:
      "Pour chaque moto et lot de pièces détachées, nos transitaires agréés effectuent un contrôle légal strict en collaboration avec les services de police aux frontières et la douane. Cela garantit la conformité des numéros de châssis, l'authenticité des pièces d'origine et la légalité totale du transport sans blocage routier.",
    keyPoints: [
      "Vérification des numéros de cadre / moteur et déclarations.",
      "Délivrance du bordereau de transit sécurisé.",
      "Assurance du trajet sans encombre jusqu'à Kinshasa.",
    ],
    keywords: [
      'police', 'policier', 'transitaire', 'douane', 'frontière', 'contrôle', 'légal', 'papiers', 'châssis'
    ],
  },
  {
    id: 'horaires-entreprise',
    category: 'horaires',
    badge: 'Horaires Officiels',
    question: "Quelles sont les heures de travail et de traitement des commandes ?",
    answer:
      "HOUSSETECH opère officiellement du Lundi au Samedi : Du Lundi au Vendredi de 08h00 juste à 16h30, et le Samedi de 08h00 juste à 14h00. Les dimanches sont chômés pour repos technique. Toute demande ou commande passée hors de ces heures est traitée en priorité dès 08h00 le jour ouvrable suivant.",
    keyPoints: [
      "Lundi au Vendredi : 08h00 - 16h30.",
      "Samedi : 08h00 - 14h00.",
      "Dimanche : Fermé (Départs des convois préparés pour le samedi).",
    ],
    keywords: [
      'horaires', 'heures', 'ouverture', 'fermeture', 'travail', 'disponible', 'lundi', 'vendredi', 'samedi', 'dimanche'
    ],
  },
  {
    id: 'suivi-etapes',
    category: 'transit',
    badge: 'Temps Réel',
    question: "Comment fonctionne la barre de progression en 5 étapes du colis ?",
    answer:
      "Dès que vous soumettez votre commande, elle passe successivement par 5 jalons visibles en temps réel dans votre onglet « Suivi du Colis » : 1. Commande reçue ; 2. Commande acceptée & Acompte 70% ; 3. Contrôle Policier & Transitaire ; 4. En expédition vers Kinshasa (convoi samedi) ; 5. Arrivé à Kinshasa (prêt pour retrait/livraison).",
    keyPoints: [
      "Mise à jour en temps réel par l'administrateur.",
      "Bouton d'évaluation et notation par étoiles disponible dès l'étape 5.",
      "Historique horodaté des décisions.",
    ],
    keywords: [
      'suivi', 'étapes', 'statut', 'progression', 'colis', 'livraison', 'marquage', 'où est', 'avancement'
    ],
  },
];

const POPULAR_QUESTIONS = [
  { label: '🚚 Quand part le prochain convoi ?', query: 'samedi convoi départ' },
  { label: '💳 Modalités de l\'acompte 70%', query: 'acompte 70% pourquoi payer' },
  { label: '⏳ Délais pour Kinshasa', query: 'délais 4 7 jours kinshasa' },
  { label: '📱 Moyens de paiement M-Pesa', query: 'm-pesa airtel paiement' },
  { label: '🏢 Nos heures d\'ouverture', query: 'horaires 8h 16h30 travail' },
];

interface Props {
  onGoToChat: (prefilledText?: string) => void;
  onGoToTracking: () => void;
}

export const CustomerFAQSection: React.FC<Props> = ({ onGoToChat, onGoToTracking }) => {
  const { settings, getWhatsAppUrl } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'delais' | 'paiement' | 'transit' | 'horaires'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'delais-convoi': true,
    'paiement-acompte': true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    FAQ_DATABASE.forEach((item) => (next[item.id] = true));
    setExpandedIds(next);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Filtrage intelligent dynamique
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_DATABASE.filter((item) => {
      // Filtre catégorie
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      if (!q) return true;

      // Recherche multi-champs : question, réponse, mot-clés, points clés
      const inQuestion = item.question.toLowerCase().includes(q);
      const inAnswer = item.answer.toLowerCase().includes(q);
      const inKeywords = item.keywords.some((k) => k.includes(q) || q.includes(k));
      const inPoints = item.keyPoints.some((p) => p.toLowerCase().includes(q));

      return inQuestion || inAnswer || inKeywords || inPoints;
    });
  }, [searchQuery, selectedCategory]);

  // Détection d'une question récurrente directe ou suggestion auto
  const bestAutoMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 3) return null;

    // Trouver le meilleur score
    let best: { item: FAQItem; score: number } | null = null;
    FAQ_DATABASE.forEach((item) => {
      let score = 0;
      if (item.question.toLowerCase().includes(q)) score += 10;
      item.keywords.forEach((kw) => {
        if (q.includes(kw)) score += 5;
        if (kw.includes(q)) score += 3;
      });
      if (item.answer.toLowerCase().includes(q)) score += 2;

      if (score > 0 && (!best || score > best.score)) {
        best = { item, score };
      }
    });

    return best ? (best as { item: FAQItem; score: number }).item : null;
  }, [searchQuery]);

  const handleAskInChat = (text: string) => {
    onGoToChat(text);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Bannière d'en-tête FAQ Dynamique */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>Assistance Dynamique & FAQ Réponses Immédiates</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  24h/24 Instantané
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Trouvez une réponse immédiate aux questions fréquentes sur nos <strong className="text-white">délais d'acheminement vers Kinshasa (convois du samedi)</strong> et nos <strong className="text-white">modalités de paiement (acompte 70% et solde 30%)</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={expandAll}
              className="text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              title="Tout déplier"
            >
              Tout afficher
            </button>
            <button
              onClick={collapseAll}
              className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 border border-slate-700 transition"
              title="Tout replier"
            >
              Replier
            </button>
          </div>
        </div>

        {/* Champ de recherche interactive en temps réel */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tapez un mot-clé ou votre question (ex: délai, convoi samedi, acompte 70%, solde 30%, M-Pesa)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-slate-950/90 border border-red-500/30 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Raccourcis de questions populaires */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Populaire :</span>
          {POPULAR_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(pq.query);
                setSelectedCategory('all');
              }}
              className="text-[11px] font-medium bg-slate-800/80 hover:bg-red-600/20 hover:text-red-300 text-slate-300 border border-slate-700 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition"
            >
              {pq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion / Réponse automatique immédiate si recherche active */}
      {bestAutoMatch && searchQuery.trim() && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-500/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-red-400 uppercase tracking-wide">
                Réponse Automatique Recommandée
              </span>
            </div>
            <p className="text-xs font-bold text-white">{bestAutoMatch.question}</p>
            <p className="text-xs text-slate-300 line-clamp-2">{bestAutoMatch.answer}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setExpandedIds((prev) => ({ ...prev, [bestAutoMatch.id]: true }));
                const el = document.getElementById(`faq-${bestAutoMatch.id}`);
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Lire la réponse complète</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filtres par catégories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Toutes ({FAQ_DATABASE.length})</span>
        </button>

        <button
          onClick={() => setSelectedCategory('delais')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            selectedCategory === 'delais'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>🚚 Délais & Expéditions (Samedi)</span>
        </button>

        <button
          onClick={() => setSelectedCategory('paiement')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            selectedCategory === 'paiement'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>💳 Modalités Paiement (70% & Solde)</span>
        </button>

        <button
          onClick={() => setSelectedCategory('transit')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            selectedCategory === 'transit'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>👮 Contrôles Police & Transit</span>
        </button>

        <button
          onClick={() => setSelectedCategory('horaires')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            selectedCategory === 'horaires'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>🕒 Heures d'Ouverture & Dépôt</span>
        </button>
      </div>

      {/* Liste des Questions / Réponses accordéons */}
      <div className="space-y-2.5">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Aucune réponse FAQ exacte trouvée pour « {searchQuery} »
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Posez directement votre question spécifique à notre administrateur dans votre messagerie privée ou contactez notre gérant sur WhatsApp.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => handleAskInChat(`Bonjour administrateur, j'ai une question spécifique concernant : "${searchQuery}"`)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-red-600/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Poser à l'Administrateur en privé</span>
              </button>
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Réinitialiser la recherche
              </button>
            </div>
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isExpanded = !!expandedIds[item.id];
            return (
              <div
                key={item.id}
                id={`faq-${item.id}`}
                className={`rounded-2xl border transition overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-900/95 border-red-500/40 shadow-lg'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full p-3.5 sm:p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        item.category === 'delais'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : item.category === 'paiement'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.category === 'transit'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {item.category === 'delais' && <Truck className="w-4 h-4" />}
                      {item.category === 'paiement' && <CreditCard className="w-4 h-4" />}
                      {item.category === 'transit' && <ShieldCheck className="w-4 h-4" />}
                      {item.category === 'horaires' && <Clock className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition">
                          {item.question}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {item.category === 'delais' && 'Délais & Expédition Kinshasa'}
                        {item.category === 'paiement' && 'Modalités & Acompte 70%'}
                        {item.category === 'transit' && 'Contrôles Douane & Police'}
                        {item.category === 'horaires' && 'Horaires Officiels de Travail'}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3 text-xs leading-relaxed text-slate-300">
                    <p className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-white font-medium">
                      {item.answer}
                    </p>

                    {/* Points clés à retenir */}
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Points Essentiels à Revenir :
                      </span>
                      {item.keyPoints.map((point, pidx) => (
                        <div key={pidx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions contextuelles pour le client */}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        {item.category === 'delais' && (
                          <button
                            onClick={onGoToTracking}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5 text-red-500" />
                            <span>Voir le Suivi de mon Colis</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleAskInChat(`Bonjour, j'aimerais plus de précisions concernant : "${item.question}"`)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Poser cette question au Gérant</span>
                        </button>
                      </div>

                      <a
                        href={getWhatsAppUrl(`Bonjour HOUSSETECH, concernant votre FAQ : "${item.question}"`)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Assistance WhatsApp directe</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bannière de contact personnalisé au pied de la FAQ */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
            <MessageSquare className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              Votre question n'est pas répertoriée ?
            </h4>
            <p className="text-[11px] text-slate-400">
              Notre équipe répond directement dans votre messagerie privée HOUSSETECH.
            </p>
          </div>
        </div>

        <button
          onClick={() => onGoToChat("Bonjour administrateur, j'ai une question spécifique à propos de ma commande...")}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-red-600/30 shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Écrire à l'Administrateur</span>
        </button>
      </div>
    </div>
  );
};
