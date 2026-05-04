/**
 * Formats a date or date string to DD-MM-YYYY format.
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date); // Fallback to raw string if invalid
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Formats a YYYY-MM-DD date key to DD-MM-YYYY.
 * @param {string} dateKey
 * @returns {string}
 */
export function formatDateKey(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return dateKey;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return formatDate(dateKey);
  
  const [y, m, d] = dateKey.split('-');
  return `${d}-${m}-${y}`;
}
