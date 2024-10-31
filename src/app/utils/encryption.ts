import crypto from 'crypto';

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
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
};

export const encrypt = (text: string, key: Buffer): EncryptedData => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encryptedData = cipher.update(text, 'utf8', 'hex');
  encryptedData += cipher.final('hex');

  return {
    encryptedData,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  };
};

export const decrypt = (
  encryptedData: string,
  key: Buffer,
  iv: string,
  tag: string
): string => {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

export const createEncryptedUser = (
  username: string = 'Anonymous',
  email: string = 'anonymous@user.com'
) => {
  const salt = generateSalt();
  const emailHash = hashEmail(email);
  const encryptionKey = generateEncryptionKey(email + username, salt);
  const encryptedEmail = encrypt(email, encryptionKey);
  const encryptedUsername = encrypt(username, encryptionKey);

  return {
    encrypted_name: encryptedUsername.encryptedData,
    encrypted_email: encryptedEmail.encryptedData,
    email_hash: emailHash,
    encryption_salt: salt,
    encryption_key: encryptionKey.toString('hex'),
    iv: encryptedEmail.iv,
    tag: encryptedEmail.tag,
  };
};
