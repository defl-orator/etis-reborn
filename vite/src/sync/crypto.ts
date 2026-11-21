import { base64ToUint8, uint8ToBase64 } from '../utils/base64.js';

// Базовый URL базы данных Firebase Realtime Database для облачной синхронизации
export const FIREBASE_DB_URL = 'https://etisreborn-fab19-default-rtdb.europe-west1.firebasedatabase.app/';

// Вспомогательный метод безопасного чтения JSON, предотвращающий падение импорта
export const safeParseJSON = <T>(val: unknown, fallback: T): T => {
    if (!val) return fallback;
    if (typeof val === 'object') return val as T;
    if (typeof val !== 'string') return fallback;
    try {
        return JSON.parse(val) as T;
    } catch (e) {
        return fallback;
    }
};

// Модуль сквозного шифрования (AES-GCM, PBKDF2) и генерации мастер-ключа
export const EtisCrypto = {
    // 1. Энтропия 125 бит (5 блоков по 5 символов: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX)
    generateMasterKey(): string {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        const bytes = crypto.getRandomValues(new Uint8Array(25));
        let res = '';
        for (let i = 0; i < 25; i++) {
            if (i > 0 && i % 5 === 0) res += '-';
            res += chars[bytes[i] % chars.length];
        }
        return res;
    },

    // 2. Разделение ключей через HKDF/PBKDF2 для исключения перебора по Vault ID
    async deriveKeyMaterial(masterKey: string, salt: string, info: string): Promise<ArrayBuffer> {
        const enc = new TextEncoder();
        const cleanKey = masterKey.replace(/[^A-Z0-9]/g, '');
        const baseKey = await crypto.subtle.importKey(
            "raw",
            enc.encode(cleanKey),
            { name: "PBKDF2" },
            false,
            ["deriveKey", "deriveBits"]
        );

        return crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: enc.encode(salt + "_" + info),
                iterations: 150000,
                hash: "SHA-256"
            },
            baseKey,
            256
        );
    },

    // Публичный ID хранилища
    async getCloudVaultId(masterKey: string): Promise<string> {
        const bits = await this.deriveKeyMaterial(masterKey, "global_vault_domain", "id");
        return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 24);
    },

    // Секретный токен для права на запись в Firebase
    async getWriteToken(masterKey: string): Promise<string> {
        const bits = await this.deriveKeyMaterial(masterKey, "global_write_guard", "token");
        return uint8ToBase64(new Uint8Array(bits));
    },

    // 3. Вывод ключа AES-GCM с ДИНАМИЧЕСКОЙ солью хранилища
    async deriveAesKey(masterKey: string, dynamicSaltBytes: Uint8Array): Promise<CryptoKey> {
        const enc = new TextEncoder();
        const cleanKey = masterKey.replace(/[^A-Z0-9]/g, '');
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(cleanKey),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: dynamicSaltBytes as BufferSource,
                iterations: 150000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    },

    // Шифрование данных готовым CryptoKey
    async encryptWithKey(plainText: string, key: CryptoKey): Promise<string> {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();

        const cipher = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            enc.encode(plainText)
        );

        const combined = new Uint8Array(iv.length + cipher.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(cipher), iv.length);

        return uint8ToBase64(combined);
    },

    // Шифрование данных
    async encrypt(plainText: string, masterKey: string, dynamicSaltBytes: Uint8Array): Promise<string> {
        const key = await this.deriveAesKey(masterKey, dynamicSaltBytes);
        return this.encryptWithKey(plainText, key);
    },

    // Расшифровка готовым CryptoKey
    async decryptWithKey(cipherBase64: string, key: CryptoKey): Promise<string> {
        const combined = base64ToUint8(cipherBase64);

        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );
        return new TextDecoder().decode(decrypted);
    },

    // Расшифровка с использованием соли хранилища
    async decrypt(cipherBase64: string, masterKey: string, dynamicSaltBytes: Uint8Array): Promise<string> {
        const key = await this.deriveAesKey(masterKey, dynamicSaltBytes);
        return this.decryptWithKey(cipherBase64, key);
    }
};