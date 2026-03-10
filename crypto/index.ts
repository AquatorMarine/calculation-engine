import CryptoJS from "crypto-js";


function normalizeKey(key: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Utf8.parse(key.padEnd(32, "0").slice(0, 32));
}

export interface AesPayload {
  cipherText: string;
  iv: string;
}

export function aesEncrypt(
  data: string | object,
  key: string,
): AesPayload {
  const text = typeof data === "object" ? JSON.stringify(data) : String(data);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(text, normalizeKey(key), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    cipherText: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
  };
}

export function aesDecrypt(
  cipherText: string,
  iv: string,
  key: string,
): unknown {
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(cipherText) } as CryptoJS.lib.CipherParams,
    normalizeKey(key),
    {
      iv: CryptoJS.enc.Base64.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  const plainText = decrypted.toString(CryptoJS.enc.Utf8);

  try {
    return JSON.parse(plainText);
  } catch {
    return plainText;
  }
}

export function encryptObjectValues(
  data: Record<string, unknown>,
  key: string,
  fields?: string[],
): Record<string, unknown> {
  if (!data || typeof data !== "object") return data;

  const shouldEncrypt = (k: string) => !fields || fields.includes(k);

  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => {
      if (!shouldEncrypt(k) || v === null || v === undefined) return [k, v];
      const { cipherText, iv } = aesEncrypt(String(v), key);
      return [k, `${iv}:${cipherText}`];
    }),
  );
}

export function decryptObjectValues(
  data: Record<string, unknown>,
  key: string,
  fields?: string[],
): Record<string, unknown> {
  if (!data || typeof data !== "object") return data;

  const shouldDecrypt = (k: string, v: unknown) =>
    (!fields || fields.includes(k)) && typeof v === "string" && v.includes(":");

  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => {
      if (!shouldDecrypt(k, v)) return [k, v];
      const raw = v as string;
      const colonIdx = raw.indexOf(":");
      const iv = raw.slice(0, colonIdx);
      const cipherText = raw.slice(colonIdx + 1);
      return [k, aesDecrypt(cipherText, iv, key)];
    }),
  );
}

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
}

export function encryptData(
  data: unknown,
  key: string,
): EncryptedPayload | unknown {
  if (!data || typeof data !== "object") return data;
  const { cipherText, iv } = aesEncrypt(data, key);
  return { encryptedData: cipherText, iv };
}

export function decryptData(
  payload: { encryptedData?: string; iv?: string },
  key: string,
): unknown {
  if (!payload?.encryptedData || !payload?.iv) return payload;
  return aesDecrypt(payload.encryptedData, payload.iv, key);
}
