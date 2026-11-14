// Encryption for what the app keeps on the phone (S-05, D113): XChaCha20-Poly1305 from @noble/ciphers
// (audited, pure JavaScript, so it runs in Expo Go). Each value gets a fresh random 24-byte nonce;
// Poly1305 makes any change to the stored text detectable. Pure functions: the key and the nonce
// are passed in (localStore.ts supplies them), so these are unit-tested.
import { xchacha20poly1305 } from "@noble/ciphers/chacha";

/** Marks a value as sealed with this scheme; anything else is a plain value from an older build. */
export const SEALED = "enc1:";
export const KEY_BYTES = 32;
export const NONCE_BYTES = 24;

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function toBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n =
      (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out +=
      B64[(n >> 18) & 63] +
      B64[(n >> 12) & 63] +
      (i + 1 < bytes.length ? B64[(n >> 6) & 63] : "=") +
      (i + 2 < bytes.length ? B64[n & 63] : "=");
  }
  return out;
}

export function fromBase64(text: string): Uint8Array {
  const clean = text.replace(/=+$/, "");
  if (/[^A-Za-z0-9+/]/.test(clean)) throw new Error("bad base64");
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (B64.indexOf(clean[i]) << 18) |
      (B64.indexOf(clean[i + 1] ?? "A") << 12) |
      (B64.indexOf(clean[i + 2] ?? "A") << 6) |
      B64.indexOf(clean[i + 3] ?? "A");
    out[o++] = (n >> 16) & 255;
    if (i + 2 < clean.length) out[o++] = (n >> 8) & 255;
    if (i + 3 < clean.length) out[o++] = n & 255;
  }
  return out;
}

/** UTF-8 without TextEncoder/TextDecoder, which Hermes doesn't always provide. */
export function utf8(text: string): Uint8Array {
  const out: number[] = [];
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000)
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else
      out.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 63),
        0x80 | ((c >> 6) & 63),
        0x80 | (c & 63),
      );
  }
  return Uint8Array.from(out);
}

export function fromUtf8(bytes: Uint8Array): string {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    const more = b < 0x80 ? 0 : b < 0xe0 ? 1 : b < 0xf0 ? 2 : 3;
    let c = more === 0 ? b : b & (0x3f >> more);
    for (let k = 1; k <= more; k++) c = (c << 6) | (bytes[i + k] & 63);
    out += String.fromCodePoint(c);
    i += more + 1;
  }
  return out;
}

/** Encrypts text: "enc1:" + base64(nonce ‖ ciphertext and tag). */
export function seal(key: Uint8Array, nonce: Uint8Array, text: string) {
  if (key.length !== KEY_BYTES) throw new Error("key size");
  if (nonce.length !== NONCE_BYTES) throw new Error("nonce size");
  const box = xchacha20poly1305(key, nonce).encrypt(utf8(text));
  const all = new Uint8Array(NONCE_BYTES + box.length);
  all.set(nonce);
  all.set(box, NONCE_BYTES);
  return SEALED + toBase64(all);
}

/**
 * Reads a stored value. Sealed values are decrypted (throws if the key is wrong or the text was
 * changed); a value from before encryption comes back as it is, marked `legacy` so it can be
 * re-saved sealed.
 */
export function open(
  key: Uint8Array,
  stored: string,
): { text: string; legacy: boolean } {
  if (!stored.startsWith(SEALED)) return { text: stored, legacy: true };
  const all = fromBase64(stored.slice(SEALED.length));
  if (all.length < NONCE_BYTES + 16) throw new Error("too short");
  const plain = xchacha20poly1305(key, all.subarray(0, NONCE_BYTES)).decrypt(
    all.subarray(NONCE_BYTES),
  );
  return { text: fromUtf8(plain), legacy: false };
}
