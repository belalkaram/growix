import crypto from 'crypto';

/**
 * Utility for symmetric encryption / decryption of sensitive configuration items (e.g. Telegram tokens)
 * using AES-256-GCM with authentication tags to ensure confidentiality and integrity.
 */

// Derive a 32-byte key from AUTH_SECRET or a fallback system secret
function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET || process.env.DATABASE_URL || 'growix-secure-default-encryption-salt-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plain-text string to an encrypted payload format:
 * "enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 */
export function encryptSensitiveData(plainText: string | null | undefined): string {
  if (!plainText || typeof plainText !== 'string' || !plainText.trim()) {
    return '';
  }

  // If already encrypted, return as is
  if (plainText.startsWith('enc:v1:')) {
    return plainText;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plainText.trim(), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return plainText; // Fallback gracefully if encryption fails
  }
}

/**
 * Decrypts an encrypted payload formatted as "enc:v1:<iv>:<authTag>:<ciphertext>"
 * If the string is plain-text (not encrypted), it returns the original string.
 */
export function decryptSensitiveData(cipherText: string | null | undefined): string {
  if (!cipherText || typeof cipherText !== 'string') {
    return '';
  }

  if (!cipherText.startsWith('enc:v1:')) {
    return cipherText; // Return plain text legacy data
  }

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 5) {
      return cipherText;
    }

    const iv = Buffer.from(parts[2], 'hex');
    const authTag = Buffer.from(parts[3], 'hex');
    const encryptedHex = parts[4];
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

/**
 * Masks a sensitive string for display purposes, showing only the last 4 characters.
 * Example: "123456789:ABCdef" -> "••••••••def"
 */
export function maskSensitiveData(value: string | null | undefined): string {
  if (!value) return '';
  const decrypted = decryptSensitiveData(value);
  if (!decrypted) return '';
  if (decrypted.length <= 6) return '••••••';
  const visible = decrypted.slice(-4);
  return `${'•'.repeat(Math.min(12, decrypted.length - 4))}${visible}`;
}
