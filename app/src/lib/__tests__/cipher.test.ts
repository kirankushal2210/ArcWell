// Phone-cache encryption (S-05, D113): XChaCha20-Poly1305 with a fresh nonce per value; tampering and
// wrong keys are caught; values from older builds are recognised as plain.
import { describe, expect, it } from "@jest/globals";
import { randomBytes } from "@noble/ciphers/webcrypto";

import {
  fromBase64,
  fromUtf8,
  KEY_BYTES,
  NONCE_BYTES,
  open,
  SEALED,
  seal,
  toBase64,
  utf8,
} from "@/lib/cipher";

const key = () => randomBytes(KEY_BYTES);
const nonce = () => randomBytes(NONCE_BYTES);
const TEXT = JSON.stringify({
  name: "Priya Sharma",
  weights: [61.2, 60.8],
  note: "Knee feels better · ಧನ್ಯವಾದ · 💪",
});

describe("base64 and UTF-8", () => {
  it("round-trip every length and byte", () => {
    for (let n = 0; n < 40; n++) {
      const b = randomBytes(n);
      expect(fromBase64(toBase64(b))).toEqual(b);
    }
  });

  it("match the standard on known values", () => {
    const bytes = (t: string) => Uint8Array.from(t, (c) => c.charCodeAt(0));
    expect(toBase64(bytes("Man"))).toBe("TWFu");
    expect(toBase64(bytes("Ma"))).toBe("TWE=");
    expect(toBase64(bytes("M"))).toBe("TQ==");
    expect(utf8("₹")).toEqual(Uint8Array.from([0xe2, 0x82, 0xb9]));
    expect(utf8("é")).toEqual(Uint8Array.from([0xc3, 0xa9]));
    expect(utf8("💪")).toEqual(Uint8Array.from([0xf0, 0x9f, 0x92, 0xaa]));
    for (const t of ["", "abc", "₹1,25,000", "ಧನ್ಯವಾದ", "💪🏽", TEXT])
      expect(fromUtf8(utf8(t))).toBe(t);
  });

  it("rejects text that isn't base64", () => {
    expect(() => fromBase64("not base64!")).toThrow();
  });
});

describe("seal and open", () => {
  it("round-trips, and the stored text reveals nothing", () => {
    const k = key();
    const s = seal(k, nonce(), TEXT);
    expect(s.startsWith(SEALED)).toBe(true);
    expect(s).not.toContain("Priya");
    expect(open(k, s)).toEqual({ text: TEXT, legacy: false });
  });

  it("uses a fresh nonce, so the same value never looks the same twice", () => {
    const k = key();
    expect(seal(k, nonce(), TEXT)).not.toBe(seal(k, nonce(), TEXT));
  });

  it("refuses a changed value", () => {
    const k = key();
    const s = seal(k, nonce(), TEXT);
    const body = fromBase64(s.slice(SEALED.length));
    body[body.length - 5] ^= 1;
    expect(() => open(k, SEALED + toBase64(body))).toThrow();
  });

  it("refuses the wrong key", () => {
    expect(() => open(key(), seal(key(), nonce(), TEXT))).toThrow();
  });

  it("refuses a value too short to be real", () => {
    expect(() => open(key(), SEALED + toBase64(new Uint8Array(10)))).toThrow();
  });

  it("reads a plain value from an older build as legacy", () => {
    expect(open(key(), TEXT)).toEqual({ text: TEXT, legacy: true });
  });

  it("checks key and nonce sizes", () => {
    expect(() => seal(new Uint8Array(16), nonce(), "x")).toThrow("key size");
    expect(() => seal(key(), new Uint8Array(12), "x")).toThrow("nonce size");
  });
});
