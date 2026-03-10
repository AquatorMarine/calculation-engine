"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aesEncrypt = aesEncrypt;
exports.aesDecrypt = aesDecrypt;
exports.encryptObjectValues = encryptObjectValues;
exports.decryptObjectValues = decryptObjectValues;
exports.encryptData = encryptData;
exports.decryptData = decryptData;
const crypto_js_1 = __importDefault(require("crypto-js"));
function normalizeKey(key) {
    return crypto_js_1.default.enc.Utf8.parse(key.padEnd(32, "0").slice(0, 32));
}
function aesEncrypt(data, key) {
    const text = typeof data === "object" ? JSON.stringify(data) : String(data);
    const iv = crypto_js_1.default.lib.WordArray.random(16);
    const encrypted = crypto_js_1.default.AES.encrypt(text, normalizeKey(key), {
        iv,
        mode: crypto_js_1.default.mode.CBC,
        padding: crypto_js_1.default.pad.Pkcs7,
    });
    return {
        cipherText: encrypted.ciphertext.toString(crypto_js_1.default.enc.Base64),
        iv: iv.toString(crypto_js_1.default.enc.Base64),
    };
}
function aesDecrypt(cipherText, iv, key) {
    const decrypted = crypto_js_1.default.AES.decrypt({ ciphertext: crypto_js_1.default.enc.Base64.parse(cipherText) }, normalizeKey(key), {
        iv: crypto_js_1.default.enc.Base64.parse(iv),
        mode: crypto_js_1.default.mode.CBC,
        padding: crypto_js_1.default.pad.Pkcs7,
    });
    const plainText = decrypted.toString(crypto_js_1.default.enc.Utf8);
    try {
        return JSON.parse(plainText);
    }
    catch {
        return plainText;
    }
}
function encryptObjectValues(data, key, fields) {
    if (!data || typeof data !== "object")
        return data;
    const shouldEncrypt = (k) => !fields || fields.includes(k);
    return Object.fromEntries(Object.entries(data).map(([k, v]) => {
        if (!shouldEncrypt(k) || v === null || v === undefined)
            return [k, v];
        const { cipherText, iv } = aesEncrypt(String(v), key);
        return [k, `${iv}:${cipherText}`];
    }));
}
function decryptObjectValues(data, key, fields) {
    if (!data || typeof data !== "object")
        return data;
    const shouldDecrypt = (k, v) => (!fields || fields.includes(k)) && typeof v === "string" && v.includes(":");
    return Object.fromEntries(Object.entries(data).map(([k, v]) => {
        if (!shouldDecrypt(k, v))
            return [k, v];
        const raw = v;
        const colonIdx = raw.indexOf(":");
        const iv = raw.slice(0, colonIdx);
        const cipherText = raw.slice(colonIdx + 1);
        return [k, aesDecrypt(cipherText, iv, key)];
    }));
}
function encryptData(data, key) {
    if (!data || typeof data !== "object")
        return data;
    const { cipherText, iv } = aesEncrypt(data, key);
    return { encryptedData: cipherText, iv };
}
function decryptData(payload, key) {
    if (!payload?.encryptedData || !payload?.iv)
        return payload;
    return aesDecrypt(payload.encryptedData, payload.iv, key);
}
