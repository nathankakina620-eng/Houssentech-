import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, ShieldCheck, User, MessageCircle, Phone, ExternalLink, ImagePlus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { EnterpriseWorkingHoursBanner } from './EnterpriseWorkingHoursBanner';
import { ChatImageLightbox } from './ChatImageLightbox';
import { ChatImageUploader } from './ChatImageUploader';
import { ChatMessageBubbleImages } from './ChatMessageBubbleImages';

export const InSiteChatModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { chatMessages, sendChatMessage, currentUser, settings, getWhatsAppUrl, markChatAsRead } = useStore();
  const [inputText, setInputText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [guestName, setGuestName] = useState(currentUser?.fullName || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCustId = currentUser?.id || (guestPhone ? `guest-${guestPhone.replace(/[^0-9]/g, '')}` : 'guest-current');

  // Filter messages for current user/guest
  const conversation = chatMessages.filter(
    (m) => m.customerId === activeCustId || (currentUser && m.customerId === currentUser.id)
  );

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
    if (!inputText.trim() && images.length === 0) return;

    sendChatMessage(
      inputText.trim(),
      activeCustId,
      currentUser?.fullName || guestName || 'Client Moto',
      currentUser?.phone || guestPhone || 'Non renseigné',
      'client',
      images
    );
    setInputText('');
    setImages([]);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-100 max-h-[540px] animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              HT
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <span>Gérant HOUSSETECH</span>
              <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded border border-red-800">
                Direct Site
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Discussion privée en direct sur le site</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Switch to WhatsApp Shortcut Button */}
      <div className="bg-emerald-950/60 px-3 py-2 border-b border-emerald-800/50 flex items-center justify-between text-xs text-emerald-200">
        <span className="text-[11px] flex items-center gap-1">
          <Phone className="w-3 h-3 text-emerald-400" />
          WhatsApp : <strong className="font-mono text-white">{settings.companyPhone}</strong>
        </span>
        <a
          href={getWhatsAppUrl(`Bonjour Gérant HOUSSETECH (${settings.companyPhone}), je vous écris depuis le site...`)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-xs flex items-center gap-1 transition active:scale-95"
        >
          <MessageCircle className="w-3 h-3" />
          <span>Basculer sur WhatsApp</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* MESSAGE ÉPINGLÉ AU-DESSUS DE TOUTES LES CONVERSATIONS : Heures de travail et Modes de commande */}
      {currentUser ? (
        <EnterpriseWorkingHoursBanner compact={true} />
      ) : (
        <div className="p-2.5 bg-amber-950/40 border-b border-amber-800/40 text-[10.5px] text-amber-200">
          <span>🔒 Horaires officiels (Lun-Ven 8h-16h30, Sam 8h-14h) & modes de travail activés dès l'inscription.</span>
        </div>
      )}

      {/* Message history */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-slate-950/70 text-xs min-h-[220px]">
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600" />
            <p className="font-semibold text-slate-300">Bienvenue dans la messagerie du site !</p>
            <p className="text-[11px] text-slate-500">
              Posez directement vos questions sur les pièces, disponibilités, prix ou suivi de votre commande. Le gérant vous répond ici.
            </p>
          </div>
        ) : (
          conversation.map((msg) => {
            const isMe = msg.sender === 'client';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-red-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700'
                  }`}
                >
                  {msg.text && <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>}
                  <ChatMessageBubbleImages
                    images={msg.images}
                    onImageClick={(url) => setLightboxImage(url)}
                  />
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">
                  {msg.sender === 'admin' ? 'Gérant • ' : 'Moi • '}
                  {msg.createdAt.substring(11, 16)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form with Photo Upload */}
      <form onSubmit={handleSend} className="p-2.5 bg-slate-900 border-t border-slate-800 space-y-2">
        {!currentUser && !guestPhone && (
          <div className="grid grid-cols-2 gap-1.5 pb-1">
            <input
              type="text"
              placeholder="Votre Nom..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="px-2 py-1 text-[11px] bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
            <input
              type="tel"
              placeholder="Votre Téléphone..."
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="px-2 py-1 text-[11px] bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
        )}

        {/* Prévisualisation des photos sélectionnées */}
        <ChatImageUploader
          images={images}
          onImagesChange={setImages}
        />

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition shrink-0 cursor-pointer"
            title="Joindre une ou plusieurs photos"
          >
            <ImagePlus className="w-4 h-4 text-red-500" />
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
                setImages((prev) => [...prev, ...imgs]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              });
            }}
            className="hidden"
          />

          <input
            type="text"
            placeholder="Écrivez un message ou envoyez des photos..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && images.length === 0}
            className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl shadow-md transition active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Lightbox photo plein écran */}
      <ChatImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};
