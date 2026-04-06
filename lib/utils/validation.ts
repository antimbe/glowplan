/**
 * Validates an email address using a standard regex.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a French or international phone number.
 * Supports:
 * - FR: 0123456789, 01 23 45 67 89, 01.23.45.67.89
 * - International: +33123456789, +33 1 23 45 67 89
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces, dots, and dashes for validation
  const cleanPhone = phone.replace(/[\s\.\-]/g, "");
  
  // Basic regex for international and local French numbers
  // Matches + followed by 7-15 digits OR starts with 0 and has 10 digits
  const phoneRegex = /^(\+|0)[1-9][0-9]{7,14}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Validates a SIRET number using the Luhn algorithm.
 * A SIRET is 14 digits long.
 */
export function isValidSIRET(siret: string): boolean {
  const cleanSiret = siret.replace(/[\s\.\-]/g, "");
  
  if (cleanSiret.length !== 14 || !/^\d+$/.test(cleanSiret)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let tmp = parseInt(cleanSiret.charAt(i), 10);
    // Multiply every even-indexed digit (from right, 1-indexed) by 2
    // Which means every odd-indexed digit in 0-indexed array from left for 14 digits length
    if (i % 2 === 0) {
      tmp *= 2;
      if (tmp > 9) {
        tmp -= 9;
      }
    }
    sum += tmp;
  }

  return sum % 10 === 0;
}
