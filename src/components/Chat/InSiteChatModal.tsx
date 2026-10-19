import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Phone,
  ExternalLink,
  ImagePlus,
  ArrowLeft,
  ShoppingBag,
  ShieldAlert,
  Crown,
  User,
  Sparkles,
  FileText,
  Download,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { EnterpriseWorkingHoursBanner } from './EnterpriseWorkingHoursBanner';
import { ChatImageLightbox } from './ChatImageLightbox';
import { ChatImageUploader } from './ChatImageUploader';
import { ChatMessageBubbleImages } from './ChatMessageBubbleImages';
import { formatFriendlyDateTime } from '../../utils/dateUtils';
import { Order } from '../../types';

export const InSiteChatModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenReceipt?: (order: Order) => void;
}> = ({ isOpen, onClose, onOpenReceipt }) => {
  const {
    chatMessages,
    sendChatMessage,
    currentUser,
    orders,
    settings,
    getWhatsAppUrl,
    markChatAsRead,
  } = useStore();

  const [inputText, setInputText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Identifiant persistant de l'appareil client pour que le client retrouve sa conversation même sans compte
  const [deviceSessionId] = useState<string>(() => {
    try {
      let saved = localStorage.getItem('houssetech_client_session_id');
      if (!saved) {
        saved = `client-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem('houssetech_client_session_id', saved);
      }
      return saved;
    } catch {
      return `client-${Date.now()}`;
    }
  });

  const [guestName, setGuestName] = useState(() => {
    if (currentUser?.fullName) return currentUser.fullName;
    try {
      return localStorage.getItem('houssetech_client_name') || '';
    } catch {
      return '';
    }
  });

  const [guestPhone, setGuestPhone] = useState(() => {
    if (currentUser?.phone) return currentUser.phone;
    try {
      return localStorage.getItem('houssetech_client_phone') || '';
    } catch {
      return '';
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (guestName.trim()) {
      try {
        localStorage.setItem('houssetech_client_name', guestName.trim());
      } catch {}
    }
  }, [guestName]);

  useEffect(() => {
    if (guestPhone.trim()) {
      try {
        localStorage.setItem('houssetech_client_phone', guestPhone.trim());
      } catch {}
    }
  }, [guestPhone]);

  const activeCustId =
    currentUser?.id ||
    (guestPhone.trim() ? `guest-${guestPhone.replace(/[^0-9]/g, '')}` : deviceSessionId);

  // Filtrer les messages pour le client connecté ou invité (par identifiant appareil, identifiant client et téléphone)
  const conversation = chatMessages.filter((m) => {
    if (m.customerId === activeCustId) return true;
    if (m.customerId === deviceSessionId) return true;
    if (currentUser && m.customerId === currentUser.id) return true;
    const cleanMsgPhone = (m.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanUserPhone = (currentUser?.phone || '').replace(/[^0-9]/g, '');
    const cleanGuestPhone = (guestPhone || '').replace(/[^0-9]/g, '');
    if (cleanUserPhone && cleanMsgPhone && cleanUserPhone === cleanMsgPhone) return true;
    if (cleanGuestPhone && cleanMsgPhone && cleanGuestPhone === cleanMsgPhone) return true;
    if (m.customerId === 'guest-current' && !currentUser) return true;
    return false;
  });

  const isBlocked = currentUser?.status === 'bloque' || currentUser?.isBlocked;

  useEffect(() => {
    if (isOpen) {
      markChatAsRead(activeCustId);
    }
  }, [isOpen, activeCustId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;
    if (!inputText.trim() && images.length === 0) return;

    const effectiveName = currentUser?.fullName || guestName.trim() || 'Client Moto';
    const effectivePhone = currentUser?.phone || guestPhone.trim() || 'Non renseigné';

    sendChatMessage(
      inputText.trim(),
      activeCustId,
      effectiveName,
      effectivePhone,
      'client',
      images
    );
    setInputText('');
    setImages([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      {/* Fenêtre non flottante, élégante, centrée avec bouton de sortie immédiat */}
      <div className="relative w-full max-w-3xl h-[94vh] sm:h-[88vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-fadeIn">
        
        {/* BARRE DE SORTIE OBLIGATOIRE : Permet de quitter la conversation et voir les articles sur la page d'accueil */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-red-600/30 transition active:scale-95 cursor-pointer"
            title="Quitter la conversation et revenir aux articles du catalogue"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quitter la conversation & voir les articles</span>
            <ShoppingBag className="w-4 h-4 hidden sm:inline" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* En-tête de conversation officiel avec statut du Gérant */}
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                👑
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Direction & Administration HOUSSETECH
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Support Officiel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Discussion directe en tête-à-tête avec le gérant pour vos questions, pièces et commandes
              </p>
            </div>
          </div>

          <a
            href={getWhatsAppUrl(`Bonjour Gérant HOUSSETECH (${settings.companyPhone}), je vous écris depuis la messagerie du site.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-xs font-bold rounded-xl transition"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp : {settings.companyPhone}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* MESSAGE ÉPINGLÉ : Heures de travail et modes de commande */}
        <EnterpriseWorkingHoursBanner compact={true} />

        {/* Avertissement de compte bloqué si applicable */}
        {isBlocked && (
          <div className="p-3 bg-red-950/70 border-b border-red-700/60 text-xs text-red-200 flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <strong>Compte client suspendu :</strong> Votre compte a été temporairement bloqué par l'administrateur. L'envoi de nouveaux messages est restreint. Veuillez contacter le support.
            </div>
          </div>
        )}

        {/* HISTORIQUE DE CONVERSATION : DISTINCTION NETTE DES MESSAGES ADMINISTRATEUR VS CLIENT */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-950/70 text-xs">
          {conversation.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-red-500">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h4 className="font-bold text-base text-slate-200">
                Bienvenue dans votre messagerie privée HOUSSETECH
              </h4>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Posez vos questions sur la disponibilité des pièces, les tarifs, ou le suivi de vos commandes. Le gérant et l'administrateur vous répondent directement ici.
              </p>
            </div>
          ) : (
            conversation.map((msg) => {
              const isFromAdmin = msg.sender === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isFromAdmin ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[78%] p-3.5 rounded-2xl shadow-lg transition ${
                      isFromAdmin
                        ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-slate-100 rounded-tl-xs border-2 border-amber-500/40 shadow-amber-500/5'
                        : 'bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-tr-xs shadow-red-600/20'
                    }`}
                  >
                    {/* EN-TÊTE DE BULLE DISTINCTIF */}
                    {isFromAdmin ? (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-500/20">
                        <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>ADMINISTRATEUR</span>
                        </span>
                        <span className="text-[11px] font-black text-amber-300">
                          Direction HOUSSETECH
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 mb-2 pb-1.5 border-b border-white/20">
                        <span className="text-[11px] font-bold text-white/95">
                          {currentUser?.fullName || msg.customerName || 'Client'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-black/25 text-red-200 text-[10px] font-bold flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Client</span>
                        </span>
                      </div>
                    )}

                    {/* TEXTE DU MESSAGE */}
                    {msg.text && (
                      <p className="leading-relaxed whitespace-pre-line text-xs sm:text-sm font-normal">
                        {msg.text}
                      </p>
                    )}

                    {/* CARTE D'ACHAT & FACTURE TÉLÉCHARGEABLE DANS LE CHAT */}
                    {(() => {
                      const matchingOrder = orders.find(
                        (o) =>
                          o.id === msg.orderId ||
                          (msg.text && o.orderNumber && msg.text.includes(o.orderNumber))
                      );
                      if (!matchingOrder && !msg.orderId) return null;
                      const ord = matchingOrder;
                      return (
                        <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border-2 border-red-500/60 text-left space-y-2 shadow-inner">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-black text-red-400 flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-red-500" />
                              <span>Facture Officielle {ord ? ord.orderNumber : ''}</span>
                            </span>
                            {ord && (
                              <span className="font-mono text-xs font-black text-emerald-400">
                                ${ord.total.toFixed(2)} USD
                              </span>
                            )}
                          </div>
                          {ord && (
                            <p className="text-[10px] text-slate-300 leading-tight">
                              {ord.items.length} article(s) • Expédition : {ord.shippingSchedule}
                              {ord.isDepositRequired ? ` • Acompte 70% : $${ord.depositAmount.toFixed(2)}` : ' • Réglé'}
                            </p>
                          )}
                          {onOpenReceipt && ord && (
                            <button
                              type="button"
                              onClick={() => onOpenReceipt(ord)}
                              className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Télécharger la Facture / Reçu PDF</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* PHOTOS JOINTES */}
                    <ChatMessageBubbleImages
                      images={msg.images}
                      onImageClick={(url) => setLightboxImage(url)}
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono flex items-center gap-1">
                    <span>{isFromAdmin ? '👑 Administrateur' : '👤 Vous'}</span>
                    <span>•</span>
                    <span>{formatFriendlyDateTime(msg.createdAt)}</span>
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* FORMULAIRE DE SAISIE DE MESSAGE */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 space-y-2.5 shrink-0">
          {!currentUser && !guestPhone && (
            <div className="grid grid-cols-2 gap-2 pb-1">
              <input
                type="text"
                placeholder="Votre Nom..."
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400"
              />
              <input
                type="tel"
                placeholder="Votre Téléphone..."
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400"
              />
            </div>
          )}

          {/* Prévisualisation des photos attachées */}
          <ChatImageUploader images={images} onImagesChange={setImages} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isBlocked}
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition shrink-0 cursor-pointer flex items-center gap-1.5"
              title="Joindre une ou plusieurs photos"
            >
              <ImagePlus className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline text-xs font-semibold">Photo</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              disabled={isBlocked}
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
                  setImages((prev) => [...prev, ...imgs]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                });
              }}
              className="hidden"
            />

            <input
              type="text"
              disabled={isBlocked}
              placeholder={
                isBlocked
                  ? 'Compte bloqué : Envoi temporairement restreint'
                  : 'Écrivez votre message à l\'administrateur HOUSSETECH...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isBlocked || (!inputText.trim() && images.length === 0)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl shadow-md shadow-red-600/30 transition active:scale-95 shrink-0 flex items-center gap-1.5 font-bold text-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
        </form>

        {/* Lightbox photo plein écran */}
        <ChatImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      </div>
    </div>
  );
};
