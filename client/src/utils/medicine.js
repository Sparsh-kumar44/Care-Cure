const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** @returns {'expired' | 'soon' | 'ok'} */
export function expiryStatus(expiry) {
  const exp = new Date(expiry);
  exp.setHours(0, 0, 0, 0);
  const today = startOfToday();
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  if (exp < today) return 'expired';
  if (exp <= in30) return 'soon';
  return 'ok';
}

export const totalTablets = (m) => Math.round((m.strips || 0) * (m.tabletsPerStrip || 0));
export const pricePerTablet = (m) => (m.tabletsPerStrip ? m.price / m.tabletsPerStrip : 0);
export const toDateInput = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');
