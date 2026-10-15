import React, { useState, useRef } from 'react';
import {
  Wrench,
  Plus,
  Package,
  Users,
  ShoppingBag,
  Settings,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  ImagePlus,
  Save,
  LogOut,
  ExternalLink,
  Search,
  Filter,
  Check,
  Phone,
  KeyRound,
  ShieldCheck,
  Mail,
  Loader2,
  RefreshCw,
  Sparkles,
  Send,
  Eye,
  Truck,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Lock,
  Layers,
  Boxes,
  Archive,
  ArrowUpRight,
  TrendingUp,
  Info,
  FileText
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, Customer, OrderTrackingStep, StoreSettings, Order } from '../../types';
import { EnterpriseWorkingHoursBanner } from '../Chat/EnterpriseWorkingHoursBanner';
import { OrderReceiptModal } from '../Receipt/OrderReceiptModal';
import { ChatImageLightbox } from '../Chat/ChatImageLightbox';
import { ChatImageUploader } from '../Chat/ChatImageUploader';
import { ChatMessageBubbleImages } from '../Chat/ChatMessageBubbleImages';

// High quality motorcycle part presets organized by category
const MOTORCYCLE_PHOTO_PRESETS = [
  { name: 'Échappement Titane (Vue 1)', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80' },
  { name: 'Silencieux Carbone (Vue 2)', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80' },
  { name: 'Disque Frein Racing (Vue 3)', url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80' },
  { name: 'Plaquettes Frittées (Vue 4)', url: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=800&q=80' },
  { name: 'Kit Chaîne Renforcé', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pneu Sport Michelin', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
];

const CATEGORIES: ProductCategory[] = [
  'Moteur & Piston',
  'Freinage',
  'Transmission & Chaîne',
  'Échappement',
  'Électrique & Éclairage',
  'Pneumatique & Jantes',
  'Carénage & Protection',
  'Huiles & Entretien',
  'Suspension & Direction',
];

export const AdminDashboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    products,
    customers,
    orders,
    settings,
    chatMessages,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    validateCustomer,
    rejectCustomer,
    deleteCustomer,
    acceptOrder,
    rejectOrder,
    updateOrderTracking,
    markDepositPaid,
    sendChatMessage,
    markChatAsRead,
    updateSettings,
    logoutAdmin,
    resetToDefaultData,
  } = useStore();

  // Tabs: added 'stocks'
  const [activeTab, setActiveTab] = useState<'stocks' | 'orders' | 'products' | 'chat' | 'customers' | 'settings'>('stocks');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product fields
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<ProductCategory>('Moteur & Piston');
  const [pBrand, setPBrand] = useState('');
  const [pModels, setPModels] = useState('');
  const [pPrice, setPPrice] = useState<number>(50);
  const [pOriginalPrice, setPOriginalPrice] = useState<number | undefined>(undefined);
  const [pStock, setPStock] = useState<number>(10);
  const [pAvailabilityType, setPAvailabilityType] = useState<'en_stock' | 'sur_commande'>('en_stock');
  const [pShortDesc, setPShortDesc] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pSku, setPSku] = useState('');
  // 4 photos minimum required:
  const [pImages, setPImages] = useState<string[]>([
    MOTORCYCLE_PHOTO_PRESETS[0].url,
    MOTORCYCLE_PHOTO_PRESETS[1].url,
    MOTORCYCLE_PHOTO_PRESETS[2].url,
    MOTORCYCLE_PHOTO_PRESETS[3].url,
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [pCondition, setPCondition] = useState<Product['condition']>('Neuf d\'origine');

  // Stock management tab states
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [quickRestockToast, setQuickRestockToast] = useState<string | null>(null);

  // Search & filter for products tab
  const [productSearch, setProductSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'pending' | 'validated'>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Chat in admin state
  const [selectedChatCustomerId, setSelectedChatCustomerId] = useState<string>(
    customers[0]?.id || 'guest-current'
  );
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminChatImages, setAdminChatImages] = useState<string[]>([]);
  const adminFileInputRef = useRef<HTMLInputElement>(null);
  const [adminLightboxImage, setAdminLightboxImage] = useState<string | null>(null);

  // Screenshot modal preview
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Settings form
  const [companyPhoneInput, setCompanyPhoneInput] = useState(settings.companyPhone);
  const [secretPaymentPhoneInput, setSecretPaymentPhoneInput] = useState(settings.secretPaymentPhone);
  const [companyNameInput, setCompanyNameInput] = useState(settings.companyName);
  const [depositThresholdInput, setDepositThresholdInput] = useState(settings.depositThreshold);
  const [adminPinInput, setAdminPinInput] = useState(settings.adminPin);
  const [adminPasswordInput, setAdminPasswordInput] = useState(settings.adminPassword || 'Albastuz3d@');
  const [adminAuthEmailInput, setAdminAuthEmailInput] = useState(settings.adminAuthEmail || 'nathankakina620@gmail.com');
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // Stock calculations
  const totalUnitsInStock = products.reduce((acc, p) => acc + p.stock, 0);
  const inStockProductsCount = products.filter((p) => p.stock > 0).length;
  const outOfStockProductsCount = products.filter((p) => p.stock <= 0).length;
  const lowStockProductsCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;

  // Open modal for adding product with 4 photos slots and availability angle
  const handleOpenAddProduct = (defaultType: 'en_stock' | 'sur_commande' = 'en_stock') => {
    setEditingProductId(null);
    setPName('');
    setPCategory('Moteur & Piston');
    setPBrand('');
    setPModels('');
    setPPrice(75);
    setPOriginalPrice(undefined);
    setPStock(defaultType === 'en_stock' ? 10 : 0);
    setPAvailabilityType(defaultType);
    setPShortDesc('');
    setPDesc('');
    setPSku(`HT-${Math.floor(1000 + Math.random() * 9000)}`);
    // Preload 4 default preset photos
    setPImages([
      MOTORCYCLE_PHOTO_PRESETS[0].url,
      MOTORCYCLE_PHOTO_PRESETS[1].url,
      MOTORCYCLE_PHOTO_PRESETS[2].url,
      MOTORCYCLE_PHOTO_PRESETS[3].url,
    ]);
    setPCondition('Neuf d\'origine');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setPName(prod.name);
    setPCategory(prod.category);
    setPBrand(prod.brand);
    setPModels(prod.compatibleModels?.join(', ') || '');
    setPPrice(prod.price);
    setPOriginalPrice(prod.originalPrice);
    setPStock(prod.stock);
    setPAvailabilityType(prod.availabilityType || (prod.stock > 0 ? 'en_stock' : 'sur_commande'));
    setPShortDesc(prod.shortDescription);
    setPDesc(prod.description);
    setPSku(prod.sku);
    // Ensure at least 4 photos array
    setPImages(
      prod.images && prod.images.length >= 4
        ? prod.images
        : [
            ...(prod.images || []),
            MOTORCYCLE_PHOTO_PRESETS[0].url,
            MOTORCYCLE_PHOTO_PRESETS[1].url,
            MOTORCYCLE_PHOTO_PRESETS[2].url,
            MOTORCYCLE_PHOTO_PRESETS[3].url,
          ].slice(0, 4)
    );
    setPCondition(prod.condition);
    setIsProductModalOpen(true);
  };

  const [isCompressingImages, setIsCompressingImages] = useState(false);

  // Save product : souple pour permettre la publication dès 1 photo, et avertir ou compléter si nécessaire
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      alert('Veuillez entrer le nom de la pièce moto.');
      return;
    }

    if (pImages.length === 0) {
      alert("⚠️ Veuillez ajouter au moins une photo pour cette pièce moto avant de publier.");
      return;
    }

    // Si moins de 4 photos, compléter avec des vues moto de haute qualité pour garantir la présentation
    let finalImages = [...pImages];
    if (finalImages.length < 4) {
      const presetsToFill = MOTORCYCLE_PHOTO_PRESETS.map((p) => p.url);
      for (const pUrl of presetsToFill) {
        if (finalImages.length >= 4) break;
        if (!finalImages.includes(pUrl)) {
          finalImages.push(pUrl);
        }
      }
    }

    const modelsArray = pModels
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const productPayload = {
      name: pName.trim(),
      category: pCategory,
      brand: pBrand.trim() || 'Universel',
      compatibleModels: modelsArray.length > 0 ? modelsArray : ['Toutes motos'],
      price: Number(pPrice) || 0,
      originalPrice: pOriginalPrice ? Number(pOriginalPrice) : undefined,
      stock: pAvailabilityType === 'sur_commande' ? Number(pStock) || 0 : Math.max(0, Number(pStock) || 0),
      availabilityType: pAvailabilityType,
      shortDescription: pShortDesc.trim() || pName.trim(),
      description: pDesc.trim() || pShortDesc.trim() || pName.trim(),
      sku: pSku.trim() || `HT-${Date.now()}`,
      images: finalImages,
      condition: pCondition,
      specifications: {
        'État': pCondition,
        'Marque': pBrand || 'Standard',
        'Disponibilité': pAvailabilityType === 'en_stock' ? 'En stock immédiat' : 'Sur commande (Départ Samedi)',
      },
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
    };

    if (editingProductId) {
      updateProduct(editingProductId, productPayload);
    } else {
      addProduct(productPayload);
    }

    setIsProductModalOpen(false);
  };

  // Upload d'images depuis la galerie avec compression automatique (résout le problème d'affichage et de publication)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetSlot?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingImages(true);
    const compressedList: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const compressed = await compressImageFile(file, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.70,
          });
          compressedList.push(compressed);
        } catch (err) {
          console.warn(`Erreur de compression pour le fichier ${file.name}:`, err);
        }
      }

      if (compressedList.length > 0) {
        if (targetSlot !== undefined) {
          setPImages((prev) => {
            const next = [...prev];
            next[targetSlot] = compressedList[0];
            return next;
          });
        } else {
          setPImages((prev) => {
            // Si prev contient seulement les presets initiaux, remplacer directement par les vraies photos
            const isAllPresets = prev.every((url) => MOTORCYCLE_PHOTO_PRESETS.some((preset) => preset.url === url));
            if (isAllPresets) {
              return compressedList;
            }
            return [...prev, ...compressedList];
          });
        }
      }
    } finally {
      setIsCompressingImages(false);
      // Réinitialiser la valeur de l'input pour permettre de resélectionner la même photo
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setPImages([...pImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setPImages(pImages.filter((_, i) => i !== index));
  };

  const handleAutofill4Photos = () => {
    setPImages([
      MOTORCYCLE_PHOTO_PRESETS[0].url,
      MOTORCYCLE_PHOTO_PRESETS[1].url,
      MOTORCYCLE_PHOTO_PRESETS[2].url,
      MOTORCYCLE_PHOTO_PRESETS[3].url,
    ]);
  };

  // Quick Restock helper
  const handleQuickRestock = (productId: string, addedQty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const newStock = Math.max(0, prod.stock + addedQty);
      updateStock(productId, newStock);
      setQuickRestockToast(`✅ Stock mis à jour pour ${prod.name} : ${newStock} unités disponibles.`);
      setTimeout(() => setQuickRestockToast(null), 3000);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyPhone: companyPhoneInput.trim(),
      secretPaymentPhone: secretPaymentPhoneInput.trim(),
      companyName: companyNameInput.trim(),
      depositThreshold: Number(depositThresholdInput) || 200,
      depositPercentage: 70,
      adminPin: adminPasswordInput.trim() || adminPinInput.trim() || 'Albastuz3d@',
      adminPassword: adminPasswordInput.trim() || 'Albastuz3d@',
      adminAuthEmail: adminAuthEmailInput.trim() || 'nathankakina620@gmail.com',
    });
    setSettingsSavedAlert(true);
    setTimeout(() => setSettingsSavedAlert(false), 3000);
  };

  const handleSendAdminChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() && adminChatImages.length === 0) return;

    const targetCustomer = customers.find((c) => c.id === selectedChatCustomerId);
    sendChatMessage(
      adminReplyText.trim(),
      selectedChatCustomerId,
      targetCustomer?.fullName || 'Client Moto',
      targetCustomer?.phone || '',
      'admin',
      adminChatImages
    );
    setAdminReplyText('');
    setAdminChatImages([]);
  };

  // Filtered products for stock tab
  const filteredStockProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(stockSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === 'in_stock') return p.stock > 0;
    if (stockFilter === 'out_of_stock') return p.stock <= 0;
    if (stockFilter === 'low_stock') return p.stock > 0 && p.stock < 5;
    return true;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const pendingCustomers = customers.filter((c) => c.status === 'en_attente_validation');
  const filteredCustomers = customers.filter((c) => {
    if (customerFilter === 'pending') return c.status === 'en_attente_validation';
    if (customerFilter === 'validated') return c.status === 'valide';
    return true;
  });

  const pendingApprovalOrders = orders.filter((o) => o.status === 'en_attente_approbation');
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'pending_decision') return o.status === 'en_attente_approbation';
    if (orderFilter === 'pending_deposit') return o.isDepositRequired && !o.isDepositPaid;
    if (orderFilter === 'arrived_kinshasa') return o.status === 'arrive_a_kinshasa';
    return true;
  });

  const chatCustomerIds = Array.from(new Set(chatMessages.map((m) => m.customerId)));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-red-500/40 p-0.5 flex items-center justify-center shadow-md shadow-red-600/30 overflow-hidden shrink-0">
            <img
              src="/icon.svg"
              alt="HOUSSETECH"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white">Espace Administrateur Gérant</h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/60 px-2 py-0.5 rounded">
                STOCK & GESTION OFFICIELLE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              WhatsApp Gérant : <strong className="text-emerald-400 font-mono">{settings.companyPhone}</strong> | Paiement secret : <strong className="text-amber-400 font-mono">{settings.secretPaymentPhone}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logoutAdmin();
            onClose();
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span className="hidden sm:inline">Quitter Mode Admin</span>
        </button>
      </header>

      {/* Tabs Bar with dedicated "STOCK" Angle */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 sm:px-6 flex gap-2 overflow-x-auto shrink-0">
        {/* DEDICATED STOCK TAB */}
        <button
          onClick={() => setActiveTab('stocks')}
          className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'stocks'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4 text-emerald-400" />
          <span>Gestion du Stock ({inStockProductsCount} dispo)</span>
          {outOfStockProductsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-black animate-pulse">
              {outOfStockProductsCount} rupture{outOfStockProductsCount > 1 ? 's' : ''}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Commandes & Acomptes ({orders.length})</span>
          {pendingApprovalOrders.length > 0 && (
            <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-black animate-pulse">
              {pendingApprovalOrders.length} à décider
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'chat'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discussion Interne Site ({chatCustomerIds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'customers'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Inscriptions Clients ({customers.length})</span>
          {pendingCustomers.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] rounded-full font-black">
              {pendingCustomers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalogue & Fiches ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-3.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-red-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Paramètres & Numéros</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
        {/* ================= TAB 1: DEDICATED STOCK TAB (ANGLE DU STOCK) ================= */}
        {activeTab === 'stocks' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Stock KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-white font-mono">{totalUnitsInStock}</span>
                  <p className="text-[11px] text-slate-400">Unités totales en stock</p>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-white font-mono">{inStockProductsCount}</span>
                  <p className="text-[11px] text-slate-400">Références disponibles</p>
                </div>
              </div>

              <div
                onClick={() => setStockFilter('low_stock')}
                className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-amber-500/50 transition"
              >
                <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-amber-400 font-mono">{lowStockProductsCount}</span>
                  <p className="text-[11px] text-slate-400">Stock critique (&lt; 5)</p>
                </div>
              </div>

              <div
                onClick={() => setStockFilter('out_of_stock')}
                className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 cursor-pointer hover:border-rose-500/50 transition"
              >
                <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-black text-rose-400 font-mono">{outOfStockProductsCount}</span>
                  <p className="text-[11px] text-slate-400">Ruptures de stock (0)</p>
                </div>
              </div>
            </div>

            {/* Quick Restock Alert Toast */}
            {quickRestockToast && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{quickRestockToast}</span>
              </div>
            )}

            {/* Stock Actions Header & 4 Photos Requirement Notice */}
            <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-emerald-400" />
                    <span>Angle & Contrôle des Produits en Stock</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Règle administrateur : Chaque article mis en stock doit comporter <strong className="text-amber-400">minimum 4 photos</strong>, son prix en $ et sa description.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenAddProduct('en_stock')}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mettre un Produit en Stock (4 Photos Min)</span>
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrer les stocks par pièce, marque, SKU..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                  />
                </div>

                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                  <button
                    onClick={() => setStockFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      stockFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'
                    }`}
                  >
                    Tous ({products.length})
                  </button>
                  <button
                    onClick={() => setStockFilter('in_stock')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      stockFilter === 'in_stock' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    En stock ({inStockProductsCount})
                  </button>
                  <button
                    onClick={() => setStockFilter('low_stock')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      stockFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Faible ({lowStockProductsCount})
                  </button>
                  <button
                    onClick={() => setStockFilter('out_of_stock')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      stockFilter === 'out_of_stock' ? 'bg-rose-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Rupture ({outOfStockProductsCount})
                  </button>
                </div>
              </div>
            </div>

            {/* In-Stock Items Table */}
            <div className="space-y-3">
              {filteredStockProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLow = prod.stock > 0 && prod.stock < 5;

                return (
                  <div
                    key={prod.id}
                    className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isOutOfStock
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : isLow
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* Product Photo Gallery preview & info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Thumbnail with 4 photos badge */}
                      <div className="relative shrink-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-slate-950/90 text-amber-400 border border-amber-500/40">
                          {prod.images.length} photos
                        </span>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase text-red-400 bg-red-950/50 px-1.5 py-0.2 rounded">
                            {prod.brand}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{prod.sku}</span>
                          <span className="text-xs font-black text-white font-mono">${prod.price.toFixed(2)}</span>
                        </div>

                        <h3 className="font-bold text-sm text-white truncate">{prod.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{prod.shortDescription}</p>

                        {/* 4 photos thumbnails preview */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-500">Vues :</span>
                          {prod.images.slice(0, 4).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              className="w-6 h-6 rounded-md object-cover border border-slate-700"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stock Status Badge & Quick Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                      {/* Status indicator */}
                      <div className="text-left md:text-right">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-950 text-rose-300 border border-rose-800 inline-block">
                            🔴 En Rupture (0 dispo)
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-950 text-amber-300 border border-amber-800 inline-block">
                            🟠 Stock Faible ({prod.stock} dispo)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800 inline-block">
                            🟢 En Stock ({prod.stock} dispo)
                          </span>
                        )}
                      </div>

                      {/* Quick Adjust Buttons */}
                      <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button
                          onClick={() => handleQuickRestock(prod.id, -1)}
                          disabled={prod.stock <= 0}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-700 text-xs text-slate-300 rounded font-bold disabled:opacity-30"
                          title="Diminuer stock (-1)"
                        >
                          -1
                        </button>

                        <span className="px-2.5 py-1 text-xs font-mono font-black text-white">
                          {prod.stock}
                        </span>

                        <button
                          onClick={() => handleQuickRestock(prod.id, 1)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-700 text-xs text-slate-300 rounded font-bold"
                          title="Ajouter stock (+1)"
                        >
                          +1
                        </button>

                        <button
                          onClick={() => handleQuickRestock(prod.id, 5)}
                          className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs rounded font-bold transition"
                          title="Réapprovisionner (+5 pièces)"
                        >
                          +5
                        </button>

                        <button
                          onClick={() => handleQuickRestock(prod.id, 10)}
                          className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs rounded font-bold transition"
                          title="Réapprovisionner (+10 pièces)"
                        >
                          +10
                        </button>
                      </div>

                      {/* Edit with 4 photos button */}
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Modifier le produit, les 4 photos et le prix"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-red-500" />
                  <span>Validation des Commandes, Captures de Paiement & Expédition Kinshasa</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Appuyez sur <strong className="text-emerald-400">Accepter</strong> ou <strong className="text-rose-400">Refuser</strong> pour chaque commande. Expédition chaque samedi matin.
                </p>
              </div>

              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    orderFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'
                  }`}
                >
                  Toutes ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('pending_decision')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    orderFilter === 'pending_decision' ? 'bg-red-600 text-white' : 'text-slate-400'
                  }`}
                >
                  À décider ({pendingApprovalOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('pending_deposit')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    orderFilter === 'pending_deposit' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Acompte en attente
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.map((ord) => {
                const isPendingDecision = ord.status === 'en_attente_approbation';

                return (
                  <div
                    key={ord.id}
                    className={`rounded-2xl border p-4 space-y-3 transition ${
                      isPendingDecision ? 'bg-red-950/20 border-red-500/40' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-sm text-white">{ord.orderNumber}</span>
                          <span className="text-xs text-slate-400 font-mono">({ord.createdAt})</span>
                          {ord.isFreeDelivery && (
                            <span className="text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                              Livraison Gratuite (&ge; 200$)
                            </span>
                          )}
                          <span className="text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expédition samedi matin
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          Client : <strong className="text-white">{ord.customerName}</strong> ({ord.customerPhone}) — Ville : <strong>{ord.city}</strong>, {ord.deliveryAddress}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                        <button
                          onClick={() => acceptOrder(ord.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                            ord.adminDecision === 'acceptee'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>Commande Acceptée</span>
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt('Motif du refus de la commande :', 'Article indisponible ou acompte manquant');
                            if (reason !== null) {
                              rejectOrder(ord.id, reason);
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                            ord.adminDecision === 'refusee'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Commande Refusée</span>
                        </button>

                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                          title="Voir et télécharger le reçu PDF officiel remis au client"
                        >
                          <FileText className="w-4 h-4 text-red-400" />
                          <span>Reçu PDF</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="font-bold text-slate-400 block mb-1">Pièces commandées :</span>
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-300">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-mono text-white">${(it.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-slate-400">Total :</span>
                          <span className="font-black text-white text-sm font-mono">${ord.total.toFixed(2)}</span>
                        </div>

                        {ord.isDepositRequired ? (
                          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-1 text-[11px]">
                            <div className="flex justify-between text-amber-300 font-bold">
                              <span>Acompte 70% dû :</span>
                              <span className="font-mono">${ord.depositAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Solde à Kinshasa (30%) :</span>
                              <span className="font-mono">${ord.remainingBalance.toFixed(2)}</span>
                            </div>
                            <div className="pt-1 flex items-center justify-between">
                              <span className="font-semibold">
                                {ord.isDepositPaid ? (
                                  <span className="text-emerald-400">✅ Acompte Reçu</span>
                                ) : (
                                  <span className="text-amber-400">⏳ En attente versement</span>
                                )}
                              </span>
                              {!ord.isDepositPaid && (
                                <button
                                  onClick={() => markDepositPaid(ord.id)}
                                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px]"
                                >
                                  Valider 70%
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-400 block">
                            Achat &le; 200$ : Règlement standard livraison
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                        <span className="font-bold text-slate-400 block">
                          Capture d'écran du paiement ({settings.secretPaymentPhone}) :
                        </span>
                        {ord.paymentScreenshot ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={ord.paymentScreenshot}
                              alt="Capture"
                              className="w-16 h-16 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-80"
                              onClick={() => setPreviewScreenshotUrl(ord.paymentScreenshot!)}
                            />
                            <div className="text-[11px] space-y-1">
                              <span className="text-emerald-400 font-semibold block">Preuve jointe par le client</span>
                              <button
                                onClick={() => setPreviewScreenshotUrl(ord.paymentScreenshot!)}
                                className="text-slate-300 underline flex items-center gap-1 hover:text-white"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Agrandir</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic p-2 bg-slate-900 rounded-lg">
                            Aucune capture d'écran téléchargée
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-slate-400">Étape d'acheminement :</span>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderTracking(ord.id, e.target.value as OrderTrackingStep)}
                          className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-semibold focus:outline-hidden"
                        >
                          <option value="en_attente_approbation">1. En attente d'approbation</option>
                          <option value="acceptee">2. Acceptée & Acompte 70%</option>
                          <option value="policier_transitaire">3. Contrôle policier & transitaire</option>
                          <option value="en_expedition_kinshasa">4. En expédition vers Kinshasa (Samedi)</option>
                          <option value="arrive_a_kinshasa">5. Arrivé à Kinshasa (Prêt pour remise)</option>
                          <option value="livree">6. Livrée & Soldée</option>
                          <option value="refusee">Commande Refusée</option>
                        </select>
                      </div>

                      {ord.rating && (
                        <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 text-[11px] text-amber-300">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>
                            Notes : Rapidité ({ord.rating.speedStars}★), Qualité ({ord.rating.qualityStars}★), Livraison ({ord.rating.deliveryStars}★)
                          </span>
                        </div>
                      )}

                      {ord.adminDecision === 'acceptee' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-600/50 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Reçu PDF débloqué pour le client</span>
                          </span>

                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `🏍️ *CONFIRMATION & REÇU OFFICIEL HOUSSETECH*\nBonjour ${ord.customerName},\n\nVotre commande *${ord.orderNumber}* a été officiellement ACCEPTÉE par le gérant !\nVotre versement est validé.\n\nVous pouvez dès maintenant télécharger votre reçu officiel PDF sur votre compte dans l'application HOUSSETECH.\n\n📄 *Récapitulatif de votre achat* :\n• Date : ${ord.createdAt}\n• Total : $${ord.total.toFixed(2)} USD\n• Articles : ${ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}\n• Expédition Kinshasa : ${ord.shippingSchedule || 'Samedi matin'}\n\nMerci pour votre confiance chez HOUSSETECH SARL !`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1.5 shadow transition"
                            title="Envoyer le reçu directement sur le WhatsApp du client"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Envoyer Reçu WhatsApp ({ord.customerPhone})</span>
                          </a>
                        </div>
                      ) : (
                        <a
                          href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Bonjour ${ord.customerName}, nous examinons actuellement votre commande ${ord.orderNumber} chez HOUSSETECH...`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 self-end sm:self-auto text-[11px]"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Client</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: INTERNAL CHAT ================= */}
        {activeTab === 'chat' && (
          <div className="max-w-5xl mx-auto h-[600px] bg-slate-900 rounded-2xl border border-slate-800 flex overflow-hidden">
            <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/50">
              <div className="p-3 border-b border-slate-800 text-xs font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-500" />
                <span>Discussions Clients ({chatCustomerIds.length})</span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                {chatCustomerIds.map((cId) => {
                  const msgs = chatMessages.filter((m) => m.customerId === cId);
                  const lastMsg = msgs[msgs.length - 1];
                  const clientName = lastMsg?.customerName || 'Client';
                  const clientPhone = lastMsg?.customerPhone || '';
                  const unread = msgs.some((m) => m.sender === 'client' && !m.read);

                  return (
                    <button
                      key={cId}
                      onClick={() => {
                        setSelectedChatCustomerId(cId);
                        markChatAsRead(cId);
                      }}
                      className={`w-full text-left p-3 hover:bg-slate-800/80 transition flex items-center justify-between ${
                        selectedChatCustomerId === cId ? 'bg-slate-800 border-l-2 border-red-500' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">{clientName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{clientPhone}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{lastMsg?.text}</p>
                      </div>
                      {unread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-slate-900">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">Discussion active</h3>
                  <p className="text-[10px] text-slate-400">ID : {selectedChatCustomerId}</p>
                </div>
              </div>

              {/* Message officiel des horaires (Lun-Ven 8h-16h30, Sam 8h-14h) et modes de travail épinglé */}
              <EnterpriseWorkingHoursBanner compact={true} />

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/70 text-xs">
                {chatMessages
                  .filter((m) => m.customerId === selectedChatCustomerId)
                  .map((msg) => {
                    const isFromAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isFromAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            isFromAdmin
                              ? 'bg-red-600 text-white rounded-br-xs'
                              : 'bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700'
                          }`}
                        >
                          {msg.text && <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>}
                          <ChatMessageBubbleImages
                            images={msg.images}
                            onImageClick={(url) => setAdminLightboxImage(url)}
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5 font-mono">
                          {isFromAdmin ? 'Moi (Gérant) • ' : `${msg.customerName} • `}
                          {msg.createdAt}
                        </span>
                      </div>
                    );
                  })}
              </div>

              <form onSubmit={handleSendAdminChatReply} className="p-3 border-t border-slate-800 space-y-2">
                <ChatImageUploader
                  images={adminChatImages}
                  onImagesChange={setAdminChatImages}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adminFileInputRef.current?.click()}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title="Joindre une ou plusieurs photos"
                  >
                    <ImagePlus className="w-4 h-4 text-red-500" />
                    <span className="hidden sm:inline text-xs font-semibold">Photo</span>
                  </button>

                  <input
                    ref={adminFileInputRef}
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
                        setAdminChatImages((prev) => [...prev, ...imgs]);
                        if (adminFileInputRef.current) adminFileInputRef.current.value = '';
                      });
                    }}
                    className="hidden"
                  />

                  <input
                    type="text"
                    placeholder="Répondre au client ou envoyer des photos..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                  />

                  <button
                    type="submit"
                    disabled={!adminReplyText.trim() && adminChatImages.length === 0}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" />
                  <span>Validation des Inscriptions par le Numéro de l'Entreprise</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Les clients envoient leur demande au <strong className="text-white font-mono">{settings.companyPhone}</strong>. Activez les comptes ici.
                </p>
              </div>

              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setCustomerFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    customerFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'
                  }`}
                >
                  Tous ({customers.length})
                </button>
                <button
                  onClick={() => setCustomerFilter('pending')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    customerFilter === 'pending' ? 'bg-red-600 text-white' : 'text-slate-400'
                  }`}
                >
                  En attente ({pendingCustomers.length})
                </button>
                <button
                  onClick={() => setCustomerFilter('validated')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    customerFilter === 'validated' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Validés
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCustomers.map((cust) => {
                const isPending = cust.status === 'en_attente_validation';
                return (
                  <div
                    key={cust.id}
                    className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isPending ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-white">{cust.fullName}</span>
                        <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {cust.phone}
                        </span>
                        {isPending ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            En attente validation
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Validé
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Ville : <strong className="text-slate-300">{cust.city}</strong></span>
                        <span>• Code : <strong className="font-mono text-amber-400">{cust.validationCode}</strong></span>
                        <span>• Date : {cust.registeredAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {isPending && (
                        <button
                          onClick={() => validateCustomer(cust.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white rounded-xl shadow-md transition flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Valider l'Inscription</span>
                        </button>
                      )}

                      <a
                        href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Bonjour ${cust.fullName}, votre compte client chez ${settings.companyName} a bien été validé par le gérant !`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp Client</span>
                      </a>

                      <button
                        onClick={() => deleteCustomer(cust.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 5: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="space-y-4 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une pièce moto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => handleOpenAddProduct('en_stock')}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-500 font-bold text-xs text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Nouvelle Pièce</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-20 h-20 rounded-xl object-cover bg-slate-950 shrink-0 border border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase text-red-400 block">{p.brand}</span>
                      <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
                      <p className="text-[11px] text-slate-400">{p.category}</p>
                      <div className="mt-1 font-black text-base text-white font-mono">${p.price}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Stock :</span>
                      <span className="font-mono font-bold text-white">{p.stock}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer ${p.name} ?`)) deleteProduct(p.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <form onSubmit={handleSaveSettings} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                <Settings className="w-4 h-4 text-red-500" />
                <span>Paramètres des Numéros & Logistique</span>
              </h2>

              {settingsSavedAlert && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                  Paramètres enregistrés avec succès !
                </div>
              )}

              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                <label className="block text-xs font-bold text-emerald-400">
                  Numéro Public Officiel & WhatsApp Direct du Gérant *
                </label>
                <input
                  type="text"
                  required
                  value={companyPhoneInput}
                  onChange={(e) => setCompanyPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400">
                  Utilisé pour les contacts WhatsApp et la réception des demandes d'inscription.
                </p>
              </div>

              <div className="p-3.5 bg-red-950/30 border border-red-500/40 rounded-xl space-y-1">
                <label className="block text-xs font-bold text-red-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Numéro Secret Pour Réception des Paiements Mobile Money *</span>
                </label>
                <input
                  type="text"
                  required
                  value={secretPaymentPhoneInput}
                  onChange={(e) => setSecretPaymentPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-red-500/40 rounded-xl text-sm font-mono text-white focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400">
                  Visible uniquement lors du paiement de commande pour que le client envoie l'argent et sa capture d'écran.
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  Règle d'expédition : Les colis sont expédiés chaque samedi matin par convoi transitaire vers Kinshasa.
                </span>
              </div>

              {/* SÉCURITÉ & MODIFICATION DU MOT DE PASSE ADMINISTRATEUR */}
              <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-700 text-amber-400 font-bold text-xs">
                  <KeyRound className="w-4 h-4" />
                  <span>Modification de mon mot de passe Administrateur & 2FA Google</span>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-200 text-xs">
                    Mon mot de passe Administrateur *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminPasswordInput}
                      onChange={(e) => {
                        setAdminPasswordInput(e.target.value);
                        setAdminPinInput(e.target.value);
                      }}
                      placeholder="Albastuz3d@"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mot de passe officiel : <code className="text-amber-300 font-bold font-mono">Albastuz3d@</code>. Vous pouvez le modifier à tout moment selon votre convenance.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-200 text-xs">
                    Compte Google pour la réception du code de connexion 2FA *
                  </label>
                  <input
                    type="email"
                    required
                    value={adminAuthEmailInput}
                    onChange={(e) => setAdminAuthEmailInput(e.target.value)}
                    placeholder="nathankakina620@gmail.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Email officiel d'authentification : <strong className="text-white font-mono">{adminAuthEmailInput || 'nathankakina620@gmail.com'}</strong>. Le code de vérification est transmis à cette adresse.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/60">
                  <label className="block font-bold text-slate-300 mb-1 text-xs">Seuil pour déclencher l'acompte obligatoire de 70% ($ USD)</label>
                  <input
                    type="number"
                    value={depositThresholdInput}
                    onChange={(e) => setDepositThresholdInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Par défaut : 200$. Tout panier supérieur à 200$ requiert 70% d'acompte à la commande.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold text-sm text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les paramètres</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Screenshot Preview Modal */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-lg w-full bg-slate-900 rounded-2xl p-4 border border-slate-700 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white">Capture d'écran du transfert Mobile Money</h4>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewScreenshotUrl}
              alt="Preuve"
              className="w-full max-h-[70vh] object-contain rounded-xl bg-black"
            />
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT WITH MINIMUM 4 PHOTOS ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-100 my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-white">
                  {editingProductId ? 'Modifier la Pièce Moto en Stock' : 'Mettre un Produit en Stock'}
                </h2>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">
                  Obligation : Minimum 4 photos réelles exigées par produit
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4 text-xs">
              {/* Choix d'angle : En Stock vs Sur Commande */}
              <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-2">
                <label className="block font-black text-slate-200">
                  Angle du produit dans la boutique HOUSSETECH *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPAvailabilityType('en_stock');
                      if (pStock === 0) setPStock(10);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition ${
                      pAvailabilityType === 'en_stock'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">📦 Angle : EN STOCK (Dispo immédiate)</p>
                      <p className="text-[10px] text-slate-400">Présent en dépôt, livraison express</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPAvailabilityType('sur_commande');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition ${
                      pAvailabilityType === 'sur_commande'
                        ? 'bg-blue-950/80 border-blue-500 text-blue-200 ring-2 ring-blue-500/30'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">✈️ Angle : SUR COMMANDE (À commander)</p>
                      <p className="text-[10px] text-slate-400">Expédié le samedi matin vers Kinshasa</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Product name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nom de la pièce moto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Disque de frein avant racing"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Marque / Fabricant *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Brembo, Akrapovic, DID..."
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Catégorie *</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">État de la pièce</label>
                  <select
                    value={pCondition}
                    onChange={(e) => setPCondition(e.target.value as Product['condition'])}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                  >
                    <option value="Neuf d'origine">Neuf d'origine constructeur</option>
                    <option value="Performance Racing">Performance Racing</option>
                    <option value="Adaptable Haute Qualité">Adaptable Haute Qualité</option>
                  </select>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Prix de vente ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Prix barré / Promo ($)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optionnel"
                    value={pOriginalPrice || ''}
                    onChange={(e) => setPOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-400 mb-1">Quantité en Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-emerald-500/50 rounded-xl text-white font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* MANDATORY 4 PHOTOS MANAGEMENT */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-black text-amber-300 flex items-center gap-1.5 text-xs">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>Photos du produit en stock (MINIMUM 4 PHOTOS OBLIGATOIRES) *</span>
                    </label>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Statut actuel :{' '}
                      <strong className={pImages.length >= 4 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {pImages.length} photo{pImages.length > 1 ? 's' : ''} sur 4 minimum
                      </strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutofill4Photos}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold border border-amber-500/30"
                  >
                    Remplir avec 4 photos moto
                  </button>
                </div>

                {/* Indicateur de chargement / compression */}
                {isCompressingImages && (
                  <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                    <span>Chargement et compression des photos de votre galerie en cours...</span>
                  </div>
                )}

                {/* 4 slots preview avec choix direct depuis la galerie */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const imgUrl = pImages[slotIdx];
                    const slotLabels = ['Photo 1 (Face/Principale)', 'Photo 2 (Sous angle)', 'Photo 3 (Détail/Gros plan)', 'Photo 4 (Emballage/Accessoires)'];

                    return (
                      <div
                        key={slotIdx}
                        className={`rounded-xl border p-1.5 flex flex-col justify-between aspect-square relative ${
                          imgUrl ? 'bg-slate-900 border-emerald-500/60' : 'bg-slate-900/60 border-dashed border-slate-700 hover:border-emerald-500/60'
                        }`}
                      >
                        {imgUrl ? (
                          <div className="relative h-full w-full">
                            <img src={imgUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                            <span className="absolute bottom-1 inset-x-1 text-center bg-black/85 text-[9px] text-emerald-300 rounded py-0.5 truncate">
                              {slotLabels[slotIdx]}
                            </span>
                            <div className="absolute top-1 right-1 flex gap-1">
                              <label className="bg-black/80 hover:bg-black text-white p-1 rounded-full cursor-pointer" title="Changer cette photo">
                                <Upload className="w-3 h-3 text-emerald-400" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileUpload(e, slotIdx)}
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(slotIdx)}
                                className="bg-black/80 hover:bg-black text-rose-400 p-1 rounded-full"
                                title="Supprimer cette photo"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="h-full w-full flex flex-col items-center justify-center text-center p-2 text-slate-300 space-y-1.5 cursor-pointer hover:bg-slate-800/80 rounded-lg transition">
                            <Upload className="w-5 h-5 text-emerald-400" />
                            <span className="text-[10px] font-bold text-slate-200">{slotLabels[slotIdx]}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                              + Galerie
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageFileUpload(e, slotIdx)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Additional photos if any */}
                {pImages.length > 4 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block mb-1">Photos supplémentaires :</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {pImages.slice(4).map((extraImg, extraIdx) => (
                        <div key={extraIdx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                          <img src={extraImg} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(4 + extraIdx)}
                            className="absolute top-0.5 right-0.5 bg-black/80 text-rose-400 p-0.5 rounded-full"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Photo Tools */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-700/60">
                  <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-md">
                    <Upload className="w-4 h-4 text-white" />
                    <span>Choisir photos depuis ma galerie (Multiple)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageFileUpload(e)}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Ou coller une URL d'image web..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Quick Motorcycle Preset Photos Picker */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400">Cliquez pour ajouter des photos de pièces moto prédéfinies :</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {MOTORCYCLE_PHOTO_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setPImages([...pImages, preset.url])}
                        className="rounded-lg overflow-hidden border border-slate-700 aspect-square hover:border-emerald-500 transition relative group"
                      >
                        <img src={preset.url} alt="" className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/80 text-[8px] text-white py-0.5 truncate block text-center">
                          {preset.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Short & Detailed Descriptions */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Description courte du produit *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Silencieux d'échappement titane racing en stock disponible..."
                  value={pShortDesc}
                  onChange={(e) => setPShortDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description complète & Spécifications *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Détails techniques, matière, compatibilité des motos, diamètre..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer en Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Order Receipt Modal */}
      {selectedReceiptOrder && (
        <OrderReceiptModal
          order={selectedReceiptOrder}
          isOpen={true}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

      {/* Lightbox photo plein écran */}
      <ChatImageLightbox
        imageUrl={adminLightboxImage}
        onClose={() => setAdminLightboxImage(null)}
      />
    </div>
  );
};
