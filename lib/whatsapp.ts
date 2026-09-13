// Builds a click-to-chat wa.me link from a display phone number like
// "+91 7300120250" -> "https://wa.me/917300120250". Returns null for
// placeholder/empty values so callers can hide the link entirely.
export function toWhatsAppLink(rawNumber: string, message?: string): string | null {
  const digits = rawNumber.replace(/[^\d]/g, "");
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
