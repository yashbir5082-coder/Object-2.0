/**
 * Calculates age from a birth date string.
 * @param {string} birthDate - Date string in YYYY-MM-DD format
 * @returns {number} Age in years
 */
export function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Formats a birth date for display.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date like "May 28, 2000"
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Validates a date input against the expected birth date.
 * Compares day, month, and year.
 * @param {string} inputDate - User-entered date in YYYY-MM-DD format
 * @param {string} expectedDate - Expected birth date in YYYY-MM-DD format
 * @returns {boolean}
 */
export function validateBirthDate(inputDate, expectedDate) {
  if (!inputDate || !expectedDate) return false;
  const input = new Date(inputDate);
  const expected = new Date(expectedDate);
  return (
    input.getFullYear() === expected.getFullYear() &&
    input.getMonth() === expected.getMonth() &&
    input.getDate() === expected.getDate()
  );
}

/**
 * Gets the zodiac sign for a given date.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Zodiac sign emoji + name
 */
export function getZodiacSign(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const signs = [
    { name: '♑ Capricorn', end: [1, 19] },
    { name: '♒ Aquarius', end: [2, 18] },
    { name: '♓ Pisces', end: [3, 20] },
    { name: '♈ Aries', end: [4, 19] },
    { name: '♉ Taurus', end: [5, 20] },
    { name: '♊ Gemini', end: [6, 20] },
    { name: '♋ Cancer', end: [7, 22] },
    { name: '♌ Leo', end: [8, 22] },
    { name: '♍ Virgo', end: [9, 22] },
    { name: '♎ Libra', end: [10, 22] },
    { name: '♏ Scorpio', end: [11, 21] },
    { name: '♐ Sagittarius', end: [12, 21] },
    { name: '♑ Capricorn', end: [12, 31] },
  ];

  for (const sign of signs) {
    if (month < sign.end[0] || (month === sign.end[0] && day <= sign.end[1])) {
      return sign.name;
    }
  }
  return '♑ Capricorn';
}
