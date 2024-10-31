import crypto from 'crypto';
import { logger } from './logger';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  tag: string;
}

export const generateSalt = (): string => {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
};

export const hashEmail = (email: string): string => {
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex');
};

export const generateEncryptionKey = (
  password: string,
  salt: string
): Buffer => {
  return crypto.pbkdf2Sync(
    Buffer.from(password, 'utf8'),
    Buffer.from(salt, 'hex'),
    100000,
    KEY_LENGTH,
    'sha512'
  );
};

export const encrypt = (text: string, key: Buffer): EncryptedData => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return {
      encryptedData: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decrypt = (
  encryptedData: string,
  key: Buffer,
  iv: string,
  tag: string
): string => {
  try {
    if (!encryptedData || !key || !iv || !tag) {
      logger.error('Missing decrypt parameters:', {
        hasEncryptedData: !!encryptedData,
        hasKey: !!key,
        hasIv: !!iv,
        hasTag: !!tag,
      });
      throw new Error('Missing required encryption parameters');
    }

    const encryptedBuffer = Buffer.from(encryptedData, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const tagBuffer = Buffer.from(tag, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(tagBuffer);

    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Decryption failed:', {
      error,
      encryptedDataLength: encryptedData?.length,
      keyLength: key?.length,
      ivLength: iv?.length,
      tagLength: tag?.length,
    });
    throw new Error('Failed to decrypt data');
  }
};

export const createEncryptedUser = (
  username: string = 'Anonymous',
  email: string = 'anonymous@user.com'
) => {
  const salt = generateSalt();
  const emailHash = hashEmail(email);

  const combinedString = `${email.toLowerCase().trim()}:${username.trim()}`;
  const encryptionKey = generateEncryptionKey(combinedString, salt);

  const encryptedUsername = encrypt(username, encryptionKey);

  return {
    encrypted_name: encryptedUsername.encryptedData,
    encrypted_email: encrypt(email, encryptionKey).encryptedData,
    email_hash: emailHash,
    encryption_salt: salt,
    encryption_key: encryptionKey.toString('hex'),
    iv: encryptedUsername.iv,
    tag: encryptedUsername.tag,
  };
};
