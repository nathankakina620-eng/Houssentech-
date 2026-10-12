/**
 * Calculateur officiel de calendrier d'expédition HOUSSETECH
 * Règle :
 * - Commandes passées du Lundi matin au Mercredi avant 12h00 : Expédition le SAMEDI MATIN de la SEMAINE EN COURS.
 * - Commandes passées à partir de Mercredi 12h00 jusqu'au Dimanche : Traitées la SEMAINE PROCHAINE pour expédition le SAMEDI MATIN suivant.
 */

export interface ShippingScheduleInfo {
  isCurrentWeek: boolean;
  batch: 'cette_semaine' | 'semaine_prochaine';
  targetSaturdayDate: string; // Ex: "Samedi 17 Octobre"
  statusBadgeText: string;
  detailedNotice: string;
  cutoffExplanation: string;
}

export function computeShippingSchedule(referenceDate = new Date()): ShippingScheduleInfo {
  const d = new Date(referenceDate);
  const dayOfWeek = d.getDay(); // 0 = Dimanche, 1 = Lundi, 2 = Mardi, 3 = Mercredi, 4 = Jeudi, 5 = Vendredi, 6 = Samedi
  const hours = d.getHours();
  const minutes = d.getMinutes();

  // Déterminer si la commande est avant le cut-off de Mercredi 12h00
  let isCurrentWeek = false;

  if (dayOfWeek === 1 || dayOfWeek === 2) {
    // Lundi ou Mardi
    isCurrentWeek = true;
  } else if (dayOfWeek === 3) {
    // Mercredi : avant 12h00 ?
    isCurrentWeek = hours < 12;
  } else {
    // Mercredi >= 12h, Jeudi, Vendredi, Samedi, Dimanche -> Semaine prochaine
    isCurrentWeek = false;
  }

  // Calcul de la date du samedi cible
  const targetDate = new Date(d);
  if (isCurrentWeek) {
    // Samedi de cette semaine (jour 6)
    const daysUntilSaturday = 6 - dayOfWeek;
    targetDate.setDate(d.getDate() + daysUntilSaturday);
  } else {
    // Samedi de la semaine prochaine
    // Si c'est dimanche (0), samedi prochain = +6 jours. Si c'est mercredi (3), samedi suivant = (6 - 3) + 7 = 10 jours.
    const daysUntilThisSaturday = (6 - dayOfWeek + 7) % 7;
    const daysToAdd = daysUntilThisSaturday === 0 ? 7 : daysUntilThisSaturday + 7;
    targetDate.setDate(d.getDate() + daysToAdd);
  }

  // Formatage en français
  const formattedSaturday = targetDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const capitalizedSaturday =
    formattedSaturday.charAt(0).toUpperCase() + formattedSaturday.slice(1);

  if (isCurrentWeek) {
    return {
      isCurrentWeek: true,
      batch: 'cette_semaine',
      targetSaturdayDate: capitalizedSaturday,
      statusBadgeText: `Expédition ce ${capitalizedSaturday}`,
      detailedNotice: `Commande enregistrée avant Mercredi 12h : votre colis sera expédié ce ${capitalizedSaturday} matin vers Kinshasa.`,
      cutoffExplanation: `✅ Commande prise en compte pour l'expédition de cette semaine (${capitalizedSaturday} matin).`,
    };
  } else {
    return {
      isCurrentWeek: false,
      batch: 'semaine_prochaine',
      targetSaturdayDate: capitalizedSaturday,
      statusBadgeText: `Expédition ${capitalizedSaturday} (Semaine Prochaine)`,
      detailedNotice: `Commande passée après le Mercredi 12h : votre commande est programmée pour la semaine prochaine, avec expédition le ${capitalizedSaturday} matin vers Kinshasa.`,
      cutoffExplanation: `⏱️ Cut-off Mercredi 12h dépassé : enregistrée pour traitement semaine prochaine (expédition le ${capitalizedSaturday} matin).`,
    };
  }
}
