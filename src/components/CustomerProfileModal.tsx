import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Camera,
  MapPin,
  Navigation,
  Save,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerLocation } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
];

export const CustomerProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, updateCustomerProfile } = useStore();

  const [avatar, setAvatar] = useState<string>(currentUser?.avatar || '');
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || '');
  const [city, setCity] = useState<string>(currentUser?.city || 'Kinshasa');
  const [address, setAddress] = useState<string>(currentUser?.address || '');
  const [commune, setCommune] = useState<string>(currentUser?.location?.commune || '');
  const [landmark, setLandmark] = useState<string>(currentUser?.location?.landmark || '');
  const [latitude, setLatitude] = useState<number>(currentUser?.location?.latitude || -4.3276); // Kinshasa center
  const [longitude, setLongitude] = useState<number>(currentUser?.location?.longitude || 15.3136);

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  // Upload photo personnalisée
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionnement pour avatar compact base64
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const scale = MAX_WIDTH / Math.max(img.width, img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressed);
          setErrorMessage('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Détection GPS en temps réel
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMessage("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsDetectingLocation(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setIsDetectingLocation(false);
      },
      (err) => {
        setIsDetectingLocation(false);
        setErrorMessage(
          err.code === 1
            ? "Veuillez autoriser l'accès à la localisation dans les réglages de votre appareil."
            : "Impossible de déterminer votre position GPS précise. Vous pouvez la saisir manuellement."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Enregistrer le profil et l'emplacement map
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    const newLocation: CustomerLocation = {
      latitude,
      longitude,
      commune: commune.trim() || undefined,
      address: address.trim() || undefined,
      landmark: landmark.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateCustomerProfile({
        avatar: avatar || undefined,
        fullName: fullName.trim() || currentUser.fullName,
        city: city.trim() || currentUser.city,
        address: address.trim() || undefined,
        location: newLocation,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la sauvegarde du profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 text-slate-100 my-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Mon Profil Client & Emplacement Map
              </h2>
              <p className="text-xs text-slate-400">
                Personnalisez votre photo et votre localisation de livraison
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-600/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Votre photo et votre emplacement ont été enregistrés avec succès !</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 1 : PHOTO DE PROFIL DU CLIENT */}
          {/* ============================================================ */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <label className="block text-xs font-bold text-white uppercase tracking-wider">
              Photo de Profil Client
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                    <span className="text-[9px] mt-1">Aucune</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition cursor-pointer"
                  title="Changer ma photo de profil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-red-400" />
                    <span>Choisir une photo de mon téléphone</span>
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                {/* Avatars prédéfinis motard stylés */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Ou choisissez un avatar pilote motard :
                  </span>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    {PRESET_AVATARS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(presetUrl)}
                        className={`w-8 h-8 rounded-xl overflow-hidden border transition ${
                          avatar === presetUrl ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={presetUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 2 : COORDONNÉES DE BASE */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Ville principale
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 3 : EMPLACEMENT MAP & LOCALISATION GPS */}
          {/* ============================================================ */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Emplacement Map & Position GPS pour Livraison</span>
              </label>

              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingLocation}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer active:scale-95"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                <span>{isDetectingLocation ? 'Détection en cours...' : 'Détecter ma position GPS'}</span>
              </button>
            </div>

            {/* Carte interactive OpenStreetMap en direct */}
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video relative">
              <iframe
                title="Emplacement Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.015}%2C${latitude - 0.015}%2C${longitude + 0.015}%2C${latitude + 0.015}&layer=mapnik&marker=${latitude}%2C${longitude}`}
                className="w-full h-full filter saturate-150 contrast-105"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                <span>GPS : {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                <a
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:underline flex items-center gap-0.5 ml-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Détails d'adresse de livraison pour Kinshasa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Commune de livraison
                </label>
                <input
                  type="text"
                  placeholder="Ex : Gombe, Limete, Lemba, Bandal..."
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Point de repère connu
                </label>
                <input
                  type="text"
                  placeholder="Ex : En face station Total, croisement Victoire"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Adresse précise / Avenue & N°
              </label>
              <input
                type="text"
                placeholder="Ex : Av. de la Paix N° 42, Quartier résidentiel"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer mon Profil & Emplacement'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
