// Ids for rows the app creates (D107). Messages have no id in the store, so their row id is a hash of
// who sent what when: the same message always maps to the same row, and it's never inserted twice.

/** Four 32-bit FNV-1a-style hashes with different seeds, formatted as a version-4-shaped UUID. */
export function hashUuid(text: string) {
  const h = [0x811c9dc5, 0x01000193, 0x9e3779b9, 0x85ebca6b];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    for (let k = 0; k < 4; k++)
      h[k] = Math.imul(h[k] ^ (c + k), 0x01000193 + k * 2);
  }
  const hex = h.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${((parseInt(hex[16], 16) & 3) | 8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A file still on this device (picked or taken), not yet in storage. */
export const isLocalUri = (v: string) =>
  /^(file:|blob:|content:|ph:|assets-library:|data:image\/|data:application\/pdf)/.test(
    v,
  );

/** Where a stored file lives, as written into rows: "sb:<bucket>/<path>". */
export const STORED = "sb:";
export const isStored = (v: string) => v.startsWith(STORED);

/**
 * The personal invite code for a client the coach added (D56): derived from the client's id, so the
 * invite is saved as soon as the client is added and keeps the same code however often it syncs.
 * Letters and digits only, no easily confused characters.
 */
export function inviteCodeFor(clientId: string) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const hex = hashUuid(`invite|${clientId}`).replace(/-/g, "");
  let out = "";
  for (let i = 0; i < 8; i++)
    out +=
      alphabet[parseInt(hex.slice(i * 2, i * 2 + 2), 16) % alphabet.length];
  return out;
}
