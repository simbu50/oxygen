import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let crypto: CryptoService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: () =>
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          },
        },
      ],
    }).compile();
    crypto = moduleRef.get(CryptoService);
  });

  it('round-trips a string', () => {
    const ct = crypto.encrypt('hello PAN ABCDE1234F');
    expect(ct).not.toContain('hello');
    expect(crypto.decrypt(ct)).toBe('hello PAN ABCDE1234F');
  });

  it('round-trips JSON', () => {
    const ct = crypto.encryptJSON({ pan: 'ABCDE1234F', name: 'Simbu' });
    expect(crypto.decryptJSON<{ pan: string }>(ct).pan).toBe('ABCDE1234F');
  });

  it('hash + verify match', () => {
    const h = crypto.hash('123456');
    expect(crypto.verifyHash('123456', h)).toBe(true);
    expect(crypto.verifyHash('000000', h)).toBe(false);
  });
});
