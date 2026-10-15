import React, { useRef } from 'react';
import { ImagePlus, X, AlertCircle } from 'lucide-react';

interface Props {
  images: string[];
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
}

export const ChatImageUploader: React.FC<Props> = ({
  images,
  onImagesChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newImagePromises: Promise<string>[] = [];

    fileList.forEach((file) => {
      // Validate file is image
      if (!file.type.startsWith('image/')) return;

      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          resolve(result);
        };
        reader.readAsDataURL(file);
      });

      newImagePromises.push(promise);
    });

    Promise.all(newImagePromises).then((results) => {
      onImagesChange([...images, ...results]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-1.5">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelected}
        className="hidden"
        disabled={disabled}
      />

      {/* Thumbnails preview if images are selected */}
      {images.length > 0 && (
        <div className="p-2 bg-slate-900/95 dark:bg-slate-900/95 light:bg-slate-100 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold px-0.5">
            <span>
              📸 {images.length} photo{images.length > 1 ? 's' : ''} prête{images.length > 1 ? 's' : ''} à envoyer
            </span>
            <button
              type="button"
              onClick={() => onImagesChange([])}
              className="text-[10px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Tout effacer
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-600 dark:border-slate-600 light:border-slate-400 bg-slate-950 shadow-sm"
              >
                <img
                  src={img}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition shadow-md cursor-pointer"
                  title="Supprimer cette photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-700 hover:border-red-500 text-slate-400 hover:text-white flex flex-col items-center justify-center gap-1 transition text-[9px] shrink-0 cursor-pointer"
              title="Ajouter d'autres photos"
            >
              <ImagePlus className="w-4 h-4 text-red-500" />
              <span>+ Photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
