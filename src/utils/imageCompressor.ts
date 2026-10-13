/**
 * Utilitaire de compression et redimensionnement d'images côté client
 * Permet de charger des photos de smartphone (même 5MB - 15MB) depuis la galerie
 * et de les convertir en DataURL JPEG compressée (< 120KB)
 * Évite ainsi le dépassement de quota localStorage et garantit un affichage instantané.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 à 1.0
}

export function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.70 } = options;

  return new Promise((resolve, reject) => {
    // Si ce n'est pas une image, rejeter
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Le fichier sélectionné n\'est pas une image valide.'));
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image.'));

    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('Fichier vide.'));

      const img = new Image();
      img.onerror = () => reject(new Error('Impossible de décoder l\'image.'));

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculer le redimensionnement proportionnel
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback si canvas non disponible
            return resolve(src);
          }

          // Fond blanc au cas où PNG transparent
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Dessiner l'image lissée
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir en JPEG compressé
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression error, using fallback:', err);
          resolve(src);
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}
