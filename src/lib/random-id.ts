/**
 * UUID v4 that also works in insecure contexts, where `crypto.randomUUID` is
 * undefined. The dev server binds 0.0.0.0 precisely so a phone on the couple's
 * LAN can open it over plain http — and there, every save that minted an id
 * (check-in, custom negotiation limit, journal entry, capture batch) threw a
 * TypeError instead of saving. getRandomValues is available in insecure
 * contexts and keeps the fallback cryptographically random; the Math.random
 * tail exists only for environments with no crypto object at all.
 */
export function randomId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c?.getRandomValues) {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
