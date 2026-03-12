/**
 * Convert VN local phone number to E.164
 * 07888765568 -> +847888765568
 */
export const normalizeVNPhoneToE164 = (phone) => {
  if (!phone) return '';
  let p = phone.trim().replace(/\s|-/g, '');
  if (p.startsWith('+84')) return p;
  if (p.startsWith('0')) return '+84' + p.slice(1);
  return p;
};

export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  const p = String(phone).trim();
  if (p.startsWith('+84')) return '0' + p.slice(3);
  return p;
};
