import React, { useRef, useState } from 'react';
import { X, Printer, Download, MessageSquare, CheckCircle2, ShieldCheck, FileCheck, Building2, Lock, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { HOUSSETECH_LOGO_BASE64, HOUSSETECH_LOGO_URL } from '../../assets/logoBase64';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<Props> = ({ order, isOpen, onClose }) => {
  const { settings } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const isAccepted =
    order.adminDecision === 'acceptee' ||
    ['acceptee', 'acompte_recu', 'en_preparation', 'policier_transitaire', 'en_expedition_kinshasa', 'arrive_a_kinshasa', 'livree'].includes(
      order.status
    );

  const handlePrint = () => {
    if (!isAccepted) {
      alert("⚠️ Téléchargement bloqué : Votre reçu officiel ne sera disponible au téléchargement qu'une fois votre commande officiellement acceptée par l'administration HOUSSETECH.");
      return;
    }
    window.print();
  };

  // Generate real downloadable PDF with jsPDF (uniquement si acceptée)
  const handleDownloadPDF = () => {
    if (!isAccepted) {
      alert("⚠️ Téléchargement bloqué : Votre reçu officiel ne sera disponible au téléchargement qu'une fois votre commande officiellement acceptée par l'administration HOUSSETECH.");
      return;
    }
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
      let y = 14;

      // BACKGROUND WATERMARK (FILIGRANE DE FOND OFFICIEL SUR LA FICHE DE TÉLÉCHARGEMENT)
      try {
        // Filigrane discret centré en fond de page
        if (typeof (doc as any).saveGraphicsState === 'function') {
          (doc as any).saveGraphicsState();
          (doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
          doc.addImage(HOUSSETECH_LOGO_BASE64, 'PNG', pageWidth / 2 - 45, pageHeight / 2 - 45, 90, 90);
          (doc as any).restoreGraphicsState();
        } else {
          // Fallback if GState not directly supported
          doc.addImage(HOUSSETECH_LOGO_BASE64, 'PNG', pageWidth / 2 - 45, pageHeight / 2 - 45, 90, 90);
        }
      } catch (e) {
        console.warn('Watermark background notice:', e);
      }

      // Header Banner (Red & Dark)
      doc.setFillColor(220, 38, 38); // Red #dc2626
      doc.rect(0, 0, pageWidth, 7, 'F');

      // LOGO OFFICIEL EN HAUT À GAUCHE DU REÇU
      const logoSize = 16; // 16mm x 16mm
      try {
        doc.addImage(HOUSSETECH_LOGO_BASE64, 'PNG', 14, y, logoSize, logoSize);
      } catch (e) {
        console.warn('Header logo notice:', e);
      }

      // Company Title & Badge (à droite du logo)
      const brandX = 14 + logoSize + 3; // 33mm
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(brandX, y + 1, 38, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('HOUSSETECH', brandX + 3, y + 6.5);

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('PIÈCES MOTO & ENVOI KINSHASA', brandX, y + 13.5);

      // Document Title on Right
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('REÇU OFFICIEL DE COMMANDE', pageWidth - 14, y + 5, { align: 'right' });

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`N° ${order.orderNumber}`, pageWidth - 14, y + 10.5, { align: 'right' });

      y += 20;

      // Thin separator line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;

      // Acceptance Stamp Banner in PDF
      if (isAccepted) {
        doc.setFillColor(240, 253, 244); // Light emerald green
        doc.setDrawColor(34, 197, 94); // Emerald border
        doc.roundedRect(14, y, pageWidth - 28, 12, 2, 2, 'FD');

        doc.setTextColor(22, 101, 52);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text('COMMANDE ACCEPTÉE & VALIDÉE PAR LA DIRECTION HOUSSETECH', 20, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Ce reçu officiel certifie l\'achat ferme des articles listés ci-dessous pour acheminement vers Kinshasa.', 20, y + 9.5);
        y += 16;
      } else {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(239, 68, 68);
        doc.roundedRect(14, y, pageWidth - 28, 10, 2, 2, 'FD');

        doc.setTextColor(153, 27, 27);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('COMMANDE ENREGISTRÉE — EN ATTENTE DE VALIDATION FINALE PAR LE GÉRANT', 20, y + 6);
        y += 14;
      }

      // 2 Columns: Client Information & Logistical Details
      const colWidth = (pageWidth - 32) / 2;

      // Col 1: Client Info Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, colWidth, 26, 2, 2, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('CLIENT & DESTINATAIRE', 18, y + 5);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(order.customerName, 18, y + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Tél : ${order.customerPhone}`, 18, y + 15);
      doc.text(`Ville : ${order.city}`, 18, y + 19.5);
      doc.text(`Adresse : ${order.deliveryAddress || 'Dépôt Kinshasa'}`, 18, y + 24);

      // Col 2: Order Date & Logistical Terms Box
      doc.roundedRect(14 + colWidth + 4, y, colWidth, 26, 2, 2, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('DÉTAILS & LOGISTIQUE KINSHASA', 18 + colWidth + 4, y + 5);

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Date de commande : ${order.createdAt}`, 18 + colWidth + 4, y + 10.5);
      doc.text(`Expédition : Samedi matin par convoi`, 18 + colWidth + 4, y + 15);
      doc.text(`Règlement : ${order.paymentMethod.toUpperCase()}`, 18 + colWidth + 4, y + 19.5);
      doc.text(`Contact HOUSSETECH : ${settings.companyPhone}`, 18 + colWidth + 4, y + 24);

      y += 31;

      // Table Header
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.rect(14, y, pageWidth - 28, 7.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('DÉSIGNATION DE L\'ARTICLE / PIÈCE MOTO', 18, y + 5);
      doc.text('MARQUE', 105, y + 5);
      doc.text('QTÉ', 135, y + 5, { align: 'center' });
      doc.text('PRIX UNIT.', 160, y + 5, { align: 'right' });
      doc.text('TOTAL USD', pageWidth - 18, y + 5, { align: 'right' });

      y += 7.5;

      // Table Rows
      order.items.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? 255 : 248;
        doc.setFillColor(rowBg, rowBg, rowBg);
        doc.rect(14, y, pageWidth - 28, 7.5, 'F');

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(14, y + 7.5, pageWidth - 14, y + 7.5);

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);

        // Truncate name if too long
        const itemName = item.name.length > 42 ? item.name.substring(0, 40) + '...' : item.name;
        doc.text(itemName, 18, y + 5);

        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(item.brand || 'D\'origine', 105, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(String(item.quantity), 135, y + 5, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.text(`$${item.price.toFixed(2)}`, 160, y + 5, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.text(`$${(item.price * item.quantity).toFixed(2)}`, pageWidth - 18, y + 5, { align: 'right' });

        y += 7.5;
      });

      y += 4;

      // Totals Box
      const totalsBoxWidth = 85;
      const totalsBoxX = pageWidth - 14 - totalsBoxWidth;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(totalsBoxX, y, totalsBoxWidth, order.isDepositRequired ? 34 : 22, 2, 2, 'FD');

      let ty = y + 5;
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Sous-total articles :', totalsBoxX + 4, ty);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${order.subtotal.toFixed(2)}`, pageWidth - 18, ty, { align: 'right' });

      ty += 5;
      doc.setFont('helvetica', 'normal');
      doc.text('Livraison Kinshasa :', totalsBoxX + 4, ty);
      if (order.isFreeDelivery) {
        doc.setTextColor(22, 101, 52);
        doc.setFont('helvetica', 'bold');
        doc.text('GRATUITE (>= 200$)', pageWidth - 18, ty, { align: 'right' });
      } else {
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'bold');
        doc.text(`$${order.deliveryFee.toFixed(2)}`, pageWidth - 18, ty, { align: 'right' });
      }

      ty += 5.5;
      doc.setDrawColor(203, 213, 225);
      doc.line(totalsBoxX + 4, ty - 1.5, pageWidth - 18, ty - 1.5);

      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('TOTAL À PAYER :', totalsBoxX + 4, ty + 2);
      doc.text(`$${order.total.toFixed(2)} USD`, pageWidth - 18, ty + 2, { align: 'right' });

      if (order.isDepositRequired) {
        ty += 7.5;
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('Acompte obligatoire (70%) :', totalsBoxX + 4, ty);
        doc.text(`$${order.depositAmount.toFixed(2)}`, pageWidth - 18, ty, { align: 'right' });

        ty += 4.5;
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        doc.text('Solde à l\'arrivée à Kinshasa (30%) :', totalsBoxX + 4, ty);
        doc.setFont('helvetica', 'bold');
        doc.text(`$${order.remainingBalance.toFixed(2)}`, pageWidth - 18, ty, { align: 'right' });
      }

      // Left Notice Box (Rules & Guarantees)
      const noticeBoxWidth = totalsBoxX - 18;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, noticeBoxWidth, order.isDepositRequired ? 34 : 22, 2, 2, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('CONDITIONS & GARANTIES HOUSSETECH', 18, y + 5);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('• Expédition hebdomadaire sécurisée chaque samedi matin.', 18, y + 10);
      doc.text('• Frais de port offerts pour toute commande égale ou supérieure à 200$.', 18, y + 14);
      doc.text('• Contrôle policier et douane transitaire intégrés.', 18, y + 18);
      if (order.isDepositRequired) {
        doc.text('• Acompte de 70% requis pour validation ferme avant expédition.', 18, y + 22);
        doc.text('• Le solde de 30% est réglé à la remise du colis à Kinshasa.', 18, y + 26);
      }

      y += (order.isDepositRequired ? 38 : 26) + 4;

      // Digital Certification & Seal Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('CACHE DE CONTRÔLE & SIGNATURE ÉLECTRONIQUE', 18, y + 5);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Document délivré par le système HOUSSETECH SARL le ${new Date().toLocaleDateString('fr-FR')} à Kinshasa.`, 18, y + 9.5);
      doc.text(`Statut actuel de la commande : ${isAccepted ? 'ACCEPTÉE ET ENREGISTRÉE AU DÉPÔT' : 'ENREGISTRÉE / EN VALIDATION'}`, 18, y + 13.5);
      doc.text(`Numéro de référence officiel : ${order.orderNumber} - Réf client : ${order.customerPhone}`, 18, y + 17.5);

      // Stamp box
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.8);
      doc.roundedRect(pageWidth - 62, y + 3, 44, 14, 1.5, 1.5, 'D');
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('HOUSSETECH SARL', pageWidth - 40, y + 7.5, { align: 'center' });
      doc.setFontSize(6.5);
      doc.text('CERTIFIÉ CONFORME', pageWidth - 40, y + 11.5, { align: 'center' });
      doc.text('KINSHASA - RDC', pageWidth - 40, y + 15, { align: 'center' });

      // Bottom footer bar
      doc.setFillColor(15, 23, 42);
      doc.rect(0, doc.internal.pageSize.getHeight() - 7, pageWidth, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`HOUSSETECH SARL — Contact : ${settings.companyPhone} — Reçu officiel N° ${order.orderNumber}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 2.5, { align: 'center' });

      // Save PDF file
      const fileName = `Recu-HOUSSETECH-${order.orderNumber}.pdf`;
      doc.save(fileName);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Erreur de génération PDF:', err);
      // Fallback to window.print if pdf generation fails
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendWhatsAppReceipt = () => {
    // Numéro WhatsApp du client fourni lors de la commande
    const cleanCustomerPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const cleanCompanyPhone = settings.companyPhone.replace(/[^0-9]/g, '');
    const targetPhone = cleanCustomerPhone || cleanCompanyPhone;

    const text = `🏍️ *REÇU OFFICIEL DE COMMANDE — HOUSSETECH SARL*
Bonjour *${order.customerName}*,

Votre commande a été *officiellement acceptée* par la direction de HOUSSETECH !
Voici le récapitulatif de votre reçu officiel prouvant votre achat :

📄 *N° de Reçu* : ${order.orderNumber}
📅 *Date* : ${order.createdAt}
✅ *Statut Officiel* : ACCEPTÉE & ENREGISTRÉE AU DÉPÔT
👤 *Client* : ${order.customerName}
📱 *Numéro WhatsApp* : ${order.customerPhone}
📍 *Destination* : ${order.city}, ${order.deliveryAddress}

📦 *Détails des articles commandés* :
${order.items.map((it) => `• ${it.quantity}x ${it.name} (${it.brand}) — $${(it.price * it.quantity).toFixed(2)}`).join('\n')}

💰 *Sous-total* : $${order.subtotal.toFixed(2)}
🚚 *Livraison* : ${order.isFreeDelivery ? 'GRATUITE (>= 200$)' : '$15'}
💵 *PRIX TOTAL* : $${order.total.toFixed(2)} USD
${order.isDepositRequired ? `🔴 *Acompte 70% versé / validé* : $${order.depositAmount.toFixed(2)}\n⚪ *Solde à payer à Kinshasa (30%)* : $${order.remainingBalance.toFixed(2)}` : '💳 *Règlement standard convenu*'}

🚢 *Expédition sécurisée* : Chaque samedi matin vers Kinshasa (contrôle policier et douane transitaire inclus).

Ce reçu officiel certifie l'authenticité de vos pièces commandées chez HOUSSETECH SARL (Tél / WhatsApp : ${settings.companyPhone}).`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-100 my-6 max-h-[94vh] overflow-y-auto">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-red-500 bg-red-950/80 px-2.5 py-1 rounded-lg border border-red-800">
              Reçu Officiel HOUSSETECH
            </span>
            <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAccepted ? (
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md active:scale-95 disabled:opacity-50"
                title="Télécharger le fichier PDF officiel (Commande acceptée)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}</span>
              </button>
            ) : (
              <button
                disabled
                className="px-3.5 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed opacity-75"
                title="Téléchargement verrouillé : commande en cours de vérification par l'administration"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Téléchargement verrouillé</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              disabled={!isAccepted}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isAccepted
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer'
                  : 'bg-slate-800/60 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              title={isAccepted ? 'Imprimer ou enregistrer via le navigateur' : "Disponible après acceptation par l'administration"}
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast upon downloading PDF */}
        {downloadSuccess && (
          <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Reçu PDF téléchargé avec succès !</strong> Le fichier <code>Recu-HOUSSETECH-{order.orderNumber}.pdf</code> prouve votre commande avec date, prix et détails.
            </span>
          </div>
        )}

        {/* Acceptance Notice Banner */}
        {isAccepted ? (
          <div className="mt-3 p-3.5 bg-emerald-950/70 border border-emerald-500/60 rounded-2xl text-emerald-200 text-xs space-y-1 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-black text-sm text-white">
                Commande Officiellement Acceptée par HOUSSETECH
              </span>
            </div>
            <p className="text-[11px] text-emerald-300">
              Votre commande a été approuvée par le gérant. Ce document fait office de <strong>reçu officiel et preuve d'achat</strong> avec la date, le prix et le détail des articles commandés.
            </p>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2 print:hidden">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Commande enregistrée. Dès l'acceptation par l'administrateur, votre reçu certifie définitivement votre réservation.
            </span>
          </div>
        )}

        {/* Printable Invoice / Devis Card avec filigrane de fond et logo officiel */}
        <div
          ref={printRef}
          className="relative mt-4 p-5 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 space-y-4 print:p-0 print:border-none print:shadow-none overflow-hidden"
        >
          {/* IMAGE EN FOND DE LA FICHE DU DEVIS / REÇU (FILIGRANE OFFICIEL DE LA MARQUE) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 opacity-[0.06] select-none">
            <img
              src="/houssetech-logo.svg"
              alt=""
              className="w-80 h-80 object-contain grayscale"
            />
          </div>

          {/* Header avec logo officiel en haut à gauche */}
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-300 gap-3">
            <div className="flex items-center gap-3">
              {/* IMAGE EN HAUT À GAUCHE DU REÇU */}
              <div className="w-14 h-14 rounded-xl bg-slate-900 p-1 border border-slate-300 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src="/icon.svg"
                  alt="Logo Officiel HOUSSETECH"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-red-600 text-white font-black text-sm rounded tracking-wider shadow-xs">
                    HOUSSETECH
                  </span>
                  <span className="text-xs font-bold text-slate-700 tracking-wider">PIÈCES MOTO & ACCESSOIRES</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Boutique officielle & convoi d'expédition hebdomadaire vers Kinshasa
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  Tél / WhatsApp : {settings.companyPhone} • Kinshasa RDC
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Reçu Officiel de Commande
              </h2>
              <p className="font-mono font-bold text-xs text-red-600">{order.orderNumber}</p>
              <p className="text-[11px] text-slate-500">Date : {order.createdAt}</p>
              {isAccepted && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] rounded uppercase">
                  ✓ Statut : Acceptée par le Gérant
                </span>
              )}
            </div>
          </div>

          {/* Client & Shipping info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Facturé & Expédié à :
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{order.customerName}</p>
              <p className="font-mono text-slate-700">{order.customerPhone}</p>
              <p className="text-slate-600">{order.city}, {order.deliveryAddress || 'Point retrait Kinshasa'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Modalités Logistiques & Convoi :
              </span>
              <p className="text-slate-800 font-medium mt-0.5">
                📦 <strong>Expédition {order.shippingSchedule || 'Samedi matin'}</strong>
              </p>
              <p className="text-slate-700 text-[11px]">
                {order.orderCutoffNotice || 'Départ convoi sécurisé chaque samedi matin vers Kinshasa.'}
              </p>
              <p className="text-slate-700 text-[11px]">
                Paiement : <strong className="uppercase">{order.paymentMethod}</strong> (Contrôle policier & transitaire inclus)
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Article / Pièce Moto</th>
                  <th className="py-2.5 px-2 text-center">Qté</th>
                  <th className="py-2.5 px-3 text-right">Prix Unit.</th>
                  <th className="py-2.5 px-3 text-right">Total USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {order.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <div className="text-[10px] text-slate-500">{it.brand || 'Original'}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${it.price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      ${(it.price * it.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & 70% rule calculations */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pt-1 text-xs">
            <div className="space-y-1 text-[11px] text-slate-600 max-w-xs">
              <p>
                * Les commandes d'un montant de 200$ ou plus bénéficient de la <strong>livraison 100% GRATUITE</strong>.
              </p>
              <p>
                * Tous les colis partent par convoi transitaire chaque samedi matin vers Kinshasa.
              </p>
              <p className="text-slate-500">
                * Document certifiant la commande passée auprès de HOUSSETECH.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total articles :</span>
                <span className="font-mono font-bold">${order.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Frais de livraison :</span>
                {order.isFreeDelivery ? (
                  <span className="font-bold text-emerald-600 uppercase text-[10px]">
                    OFFERTE (GRATUITE)
                  </span>
                ) : (
                  <span className="font-mono font-bold">${order.deliveryFee.toFixed(2)}</span>
                )}
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                <span>TOTAL :</span>
                <span className="font-mono text-red-600">${order.total.toFixed(2)} USD</span>
              </div>

              {/* Deposit breakdown if applicable */}
              {order.isDepositRequired ? (
                <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Acompte obligatoire (70%) :</span>
                    <span className="font-mono">${order.depositAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Solde à payer à Kinshasa (30%) :</span>
                    <span className="font-mono font-bold">${order.remainingBalance.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic pt-0.5">
                    Statut acompte : {order.isDepositPaid ? '✅ Acompte validé' : '⏳ En attente de paiement'}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  Règlement standard convenu (&le; 200$).
                </div>
              )}
            </div>
          </div>

          {/* Footer certification note */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
            <div>
              <strong>HOUSSETECH SARL</strong> — Boutique & Dépôt Kinshasa — Document officiel généré par le système.
            </div>
            <div className="font-mono font-bold text-slate-700">
              RÉFÉRENCE : {order.orderNumber}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 print:hidden">
          {isAccepted ? (
            <>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isGeneratingPdf
                    ? 'Génération du PDF en cours...'
                    : 'Télécharger le PDF du Reçu (Preuve officielle)'}
                </span>
              </button>

              <button
                onClick={handleSendWhatsAppReceipt}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                title={`Envoyer le reçu au client (${order.customerPhone}) et à la boutique`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Envoyer sur WhatsApp Client ({order.customerPhone})</span>
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Téléchargement non autorisé pour le moment :</strong> Cette commande est en attente d'examen et d'acceptation par l'administration HOUSSETECH.
                </span>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-slate-700 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-not-allowed shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Reçu en attente</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
