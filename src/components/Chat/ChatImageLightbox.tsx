import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface Props {
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

export const ChatImageLightbox: React.FC<Props> = ({ imageUrl, onClose, title = 'Photo partagée' }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div
        className="w-full max-w-4xl flex items-center justify-between pb-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <ZoomIn className="w-4 h-4 text-red-500" />
          <span className="text-xs sm:text-sm font-bold truncate">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={imageUrl}
            download="photo-houssetech.jpg"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer text-xs flex items-center gap-1.5"
            title="Télécharger l'image"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Télécharger</span>
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        className="relative max-w-4xl max-h-[85vh] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title}
          className="max-h-[85vh] max-w-full object-contain rounded-xl select-none"
        />
      </div>

      <p className="text-[11px] text-slate-400 mt-2 select-none">
        Cliquez n'importe où à l'extérieur ou sur la croix pour fermer
      </p>
    </div>
  );
};
