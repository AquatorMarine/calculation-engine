export interface AesPayload {
    cipherText: string;
    iv: string;
}
export declare function aesEncrypt(data: string | object, key: string): AesPayload;
export declare function aesDecrypt(cipherText: string, iv: string, key: string): unknown;
export declare function encryptObjectValues(data: Record<string, unknown>, key: string, fields?: string[]): Record<string, unknown>;
export declare function decryptObjectValues(data: Record<string, unknown>, key: string, fields?: string[]): Record<string, unknown>;
export interface EncryptedPayload {
    encryptedData: string;
    iv: string;
}
export declare function encryptData(data: unknown, key: string): EncryptedPayload | unknown;
export declare function decryptData(payload: {
    encryptedData?: string;
    iv?: string;
}, key: string): unknown;
//# sourceMappingURL=index.d.ts.map