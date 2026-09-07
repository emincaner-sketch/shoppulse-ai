import crypto from 'crypto';

/**
 * Derives a deterministic 32-byte encryption key for AES-256-GCM.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET_KEY || 'shoppulse_aes256_super_secure_vault_key_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive credentials (such as Shopify OAuth access tokens) using AES-256-GCM.
 * Output format: ivHex:authTagHex:encryptedHex
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // Standard 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted token.
 * Input format: ivHex:authTagHex:encryptedHex
 */
export function decryptToken(cipherText: string): string {
  if (!cipherText) return '';

  // If token is not yet encrypted (legacy plain text), return as-is
  if (!cipherText.includes(':')) {
    return cipherText;
  }

  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format: expected iv:authTag:payload');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Utility to verify token encryption health
 */
export function testEncryptionCycle(sample: string): boolean {
  try {
    const encrypted = encryptToken(sample);
    const decrypted = decryptToken(encrypted);
    return decrypted === sample;
  } catch {
    return false;
  }
}
