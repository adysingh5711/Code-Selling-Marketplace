import crypto from 'crypto-js';
import { promisify } from 'util';
import { createHash } from 'crypto';

const scrypt = promisify(crypto.scrypt);

// Generate a random encryption key
export const generateEncryptionKey = () => {
    return crypto.lib.WordArray.random(32).toString();
};

// Generate a random IV (Initialization Vector)
export const generateIV = () => {
    return crypto.lib.WordArray.random(16).toString();
};

// Encrypt code with AES-256-GCM
export const encryptCode = (code, key, iv) => {
    const encrypted = crypto.AES.encrypt(code, key, {
        iv: crypto.enc.Hex.parse(iv),
        mode: crypto.mode.GCM,
        padding: crypto.pad.NoPadding
    });

    return encrypted.toString();
};

// Decrypt code with AES-256-GCM
export const decryptCode = (encryptedCode, key, iv) => {
    const decrypted = crypto.AES.decrypt(encryptedCode, key, {
        iv: crypto.enc.Hex.parse(iv),
        mode: crypto.mode.GCM,
        padding: crypto.pad.NoPadding
    });

    return decrypted.toString(crypto.enc.Utf8);
};

// Generate a unique code hash
export const generateCodeHash = (code) => {
    return createHash('sha256').update(code).digest('hex');
};

// Generate a secure download token
export const generateDownloadToken = (purchaseId, buyerAddress) => {
    const tokenData = {
        purchaseId,
        buyerAddress,
        timestamp: Date.now(),
        nonce: crypto.lib.WordArray.random(16).toString()
    };

    return crypto.AES.encrypt(JSON.stringify(tokenData), process.env.JWT_SECRET).toString();
};

// Verify download token
export const verifyDownloadToken = (token) => {
    try {
        const decrypted = crypto.AES.decrypt(token, process.env.JWT_SECRET);
        return JSON.parse(decrypted.toString(crypto.enc.Utf8));
    } catch (error) {
        return null;
    }
};

// Generate a watermark for code
export const generateWatermark = (buyerAddress, purchaseId) => {
    const watermarkData = {
        buyer: buyerAddress,
        purchaseId,
        timestamp: Date.now()
    };

    return crypto.AES.encrypt(JSON.stringify(watermarkData), process.env.JWT_SECRET).toString();
};

// Verify watermark
export const verifyWatermark = (watermark) => {
    try {
        const decrypted = crypto.AES.decrypt(watermark, process.env.JWT_SECRET);
        return JSON.parse(decrypted.toString(crypto.enc.Utf8));
    } catch (error) {
        return null;
    }
};

// Generate a secure code preview
export const generateCodePreview = (code, maxLines = 10) => {
    const lines = code.split('\n');
    const previewLines = lines.slice(0, maxLines);

    // Add watermark to preview
    const watermark = generateWatermark('preview', 'preview');

    return {
        preview: previewLines.join('\n'),
        watermark,
        totalLines: lines.length
    };
}; 