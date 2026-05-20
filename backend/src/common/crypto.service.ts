import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * AES-256-GCM PII field encryption.
 * Output format: <ivHex>:<authTagHex>:<cipherHex>
 *
 * Use for fields like PAN, Aadhaar, account numbers stored at rest.
 * For larger blobs (images, statements) keep them in S3 with KMS-managed keys
 * and only encrypt the storage key with this service.
 */
@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const hex = config.getOrThrow<string>('PII_ENCRYPTION_KEY');
    this.key = Buffer.from(hex, 'hex');
    if (this.key.length !== 32) {
      throw new Error('PII_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
    }
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
  }

  decrypt(payload: string): string {
    const [ivHex, tagHex, encHex] = payload.split(':');
    if (!ivHex || !tagHex || !encHex) throw new Error('Invalid ciphertext format');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(encHex, 'hex')),
      decipher.final(),
    ]);
    return dec.toString('utf8');
  }

  encryptJSON<T>(obj: T): string {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptJSON<T>(payload: string): T {
    return JSON.parse(this.decrypt(payload)) as T;
  }

  /** One-way hash for OTPs and refresh tokens; uses scrypt with random salt. */
  hash(value: string, saltHex?: string): string {
    const salt = saltHex ? Buffer.from(saltHex, 'hex') : randomBytes(16);
    const derived = scryptSync(value, salt, 32);
    return `${salt.toString('hex')}:${derived.toString('hex')}`;
  }

  verifyHash(value: string, stored: string): boolean {
    const [saltHex, derivedHex] = stored.split(':');
    if (!saltHex || !derivedHex) return false;
    const computed = scryptSync(value, Buffer.from(saltHex, 'hex'), 32).toString('hex');
    return computed === derivedHex;
  }
}
