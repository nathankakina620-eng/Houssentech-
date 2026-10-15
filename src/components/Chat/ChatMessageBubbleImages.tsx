import React from 'react';
import { ZoomIn, Image as ImageIcon } from 'lucide-react';

interface Props {
  images?: string[];
  onImageClick: (url: string) => void;
}

export const ChatMessageBubbleImages: React.FC<Props> = ({ images, onImageClick }) => {
  if (!images || images.length === 0) return null;

  // Single image
  if (images.length === 1) {
    return (
      <div className="mt-2 relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer max-w-sm">
        <img
          src={images[0]}
          alt="Photo attachée"
          onClick={() => onImageClick(images[0])}
          className="w-full max-h-64 object-cover rounded-xl hover:scale-[1.02] transition duration-200"
        />
        <div
          onClick={() => onImageClick(images[0])}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold"
        >
          <ZoomIn className="w-4 h-4 text-white" />
          <span>Agrandir</span>
        </div>
      </div>
    );
  }

  // 2 images
  if (images.length === 2) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-1.5 max-w-sm">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer aspect-square"
          >
            <img
              src={img}
              alt={`Photo ${idx + 1}`}
              onClick={() => onImageClick(img)}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-200"
            />
            <div
              onClick={() => onImageClick(img)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-semibold"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Voir</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 3 or more images: grid
  return (
    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-w-md">
      {images.map((img, idx) => (
        <div
          key={idx}
          className="relative rounded-xl overflow-hidden border border-white/10 group cursor-pointer aspect-square"
        >
          <img
            src={img}
            alt={`Photo ${idx + 1}`}
            onClick={() => onImageClick(img)}
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-200"
          />
          <div
            onClick={() => onImageClick(img)}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[10px] font-semibold"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Voir</span>
          </div>
        </div>
      ))}
    </div>
  );
};
