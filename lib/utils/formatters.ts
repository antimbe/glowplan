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

/**
 * Formate une date en français (ex: "Lundi 15 janvier 2024")
 */
export const formatDateFull = (date: Date): string => {
  return `${DAYS_JS[date.getDay()]} ${date.getDate()} ${MONTHS_LOWER[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Formate une date courte (ex: "15 janvier")
 */
export const formatDateShort = (date: Date): string => {
  return `${date.getDate()} ${MONTHS_LOWER[date.getMonth()]}`;
};

/**
 * Formate une heure (ex: "14:30")
 */
export const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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
