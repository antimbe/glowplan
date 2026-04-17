/**
 * Utilitaires de formatage partagés
 * Centralise toutes les fonctions de formatage pour éviter la duplication
 */

// Format JavaScript: 0=Dimanche, 1=Lundi, ..., 6=Samedi
export const DAYS_JS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const DAYS_JS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

// Format BDD: 0=Lundi, 1=Mardi, ..., 6=Dimanche
export const DAYS_DB = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
export const MONTHS_LOWER = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/**
 * Convertit le jour JavaScript (0=Dimanche) vers le format BDD (0=Lundi)
 */
export const jsDayToDbDay = (jsDay: number): number => {
  return jsDay === 0 ? 6 : jsDay - 1;
};

/**
 * Convertit le jour BDD (0=Lundi) vers le format JavaScript (0=Dimanche)
 */
export const dbDayToJsDay = (dbDay: number): number => {
  return dbDay === 6 ? 0 : dbDay + 1;
};

const TZ = "Europe/Paris";

/**
 * Retourne les parties d'une date dans le fuseau Europe/Paris
 */
const getParisParts = (date: Date) => {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  return parts;
};

/**
 * Formate une date en français (ex: "Lundi 15 janvier 2024")
 */
export const formatDateFull = (date: Date): string => {
  const p = getParisParts(date);
  // Capitalize weekday
  const weekday = p.weekday ? p.weekday.charAt(0).toUpperCase() + p.weekday.slice(1) : "";
  const month = p.month ? p.month.toLowerCase() : "";
  return `${weekday} ${p.day} ${month} ${p.year}`;
};

/**
 * Formate une date courte (ex: "15 janvier")
 */
export const formatDateShort = (date: Date): string => {
  const p = getParisParts(date);
  return `${p.day} ${p.month?.toLowerCase() ?? ""}`;
};

/**
 * Formate une heure (ex: "14:30") — toujours en heure de Paris
 */
export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(":", ":");
};

/**
 * Formate une durée en minutes (ex: "1h30" ou "45 min")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
};

/**
 * Formate un prix en euros
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

/**
 * Formate un prix simple (ex: "25€")
 */
export const formatPriceSimple = (price: number): string => {
  return `${price}€`;
};
