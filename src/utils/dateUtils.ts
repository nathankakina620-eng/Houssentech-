/**
 * Utilitaires officiels de dates et heures calibrés avec précision sur l'heure de Kinshasa (UTC+1 / West Africa Time)
 * HOUSSETECH SARL — Kinshasa, RDC
 */

const kinshasaDateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function getKinshasaNow(): Date {
  return new Date();
}

/**
 * Formate une date au format standard "YYYY-MM-DD HH:mm" à l'heure exacte de Kinshasa (UTC+1).
 * Si une date déjà formatée "YYYY-MM-DD HH:mm" est passée, elle est préservée sans décalage.
 */
export function formatKinshasaDateTime(dateInput?: Date | string | number | null): string {
  if (!dateInput) {
    const parts = kinshasaDateTimeFormatter.formatToParts(new Date());
    const m: Record<string, string> = {};
    parts.forEach(({ type, value }) => {
      m[type] = value;
    });
    return `${m.year}-${m.month}-${m.day} ${m.hour}:${m.minute}`;
  }

  // Si c'est déjà une chaîne 'YYYY-MM-DD HH:mm', éviter de la ré-analyser avec un mauvais fuseau local
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(dateInput)) {
    return dateInput.substring(0, 16);
  }

  let d: Date;
  if (typeof dateInput === 'number') {
    d = new Date(dateInput);
  } else if (typeof dateInput === 'string') {
    d = new Date(dateInput);
  } else {
    d = dateInput;
  }

  if (isNaN(d.getTime())) {
    const parts = kinshasaDateTimeFormatter.formatToParts(new Date());
    const m: Record<string, string> = {};
    parts.forEach(({ type, value }) => {
      m[type] = value;
    });
    return `${m.year}-${m.month}-${m.day} ${m.hour}:${m.minute}`;
  }

  try {
    const parts = kinshasaDateTimeFormatter.formatToParts(d);
    const m: Record<string, string> = {};
    parts.forEach(({ type, value }) => {
      m[type] = value;
    });
    return `${m.year}-${m.month}-${m.day} ${m.hour}:${m.minute}`;
  } catch {
    const y = d.getFullYear();
    const mon = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${mon}-${day} ${h}:${min}`;
  }
}

export function formatKinshasaTime(dateInput?: Date | string | null): string {
  const full = formatKinshasaDateTime(dateInput);
  return full.substring(11, 16);
}

export function formatKinshasaDate(dateInput?: Date | string | null): string {
  const full = formatKinshasaDateTime(dateInput);
  const parts = full.substring(0, 10).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return full.substring(0, 10);
}

export function formatFriendlyDateTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  const full = formatKinshasaDateTime(dateStr);
  const todayStr = formatKinshasaDateTime(new Date()).substring(0, 10);
  const itemDateStr = full.substring(0, 10);
  const timeStr = full.length >= 16 ? full.substring(11, 16) : '';

  // Calcul d'hier
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = formatKinshasaDateTime(yesterday).substring(0, 10);

  if (itemDateStr === todayStr) {
    return `Aujourd'hui à ${timeStr}`;
  }
  if (itemDateStr === yesterdayStr) {
    return `Hier à ${timeStr}`;
  }
  return `${formatKinshasaDate(full)} à ${timeStr}`;
}

