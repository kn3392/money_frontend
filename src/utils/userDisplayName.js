const INVALID_NAMES = new Set(['null', 'undefined', 'nil', '']);

/** Safe greeting name from auth user (API uses `name`, `email`, `id`). */
export function getUserDisplayName(user) {
  if (!user || typeof user !== 'object') return '';
  const raw = user.name;
  if (typeof raw === 'string') {
    const t = raw.trim();
    const low = t.toLowerCase();
    if (t && !INVALID_NAMES.has(low)) return t;
  }
  const email = user.email;
  if (typeof email === 'string' && email.includes('@')) {
    return email.split('@')[0].trim() || 'User';
  }
  return 'User';
}
