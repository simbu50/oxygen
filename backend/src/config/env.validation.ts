import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvSchema {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  PORT = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_TTL = '15m';

  @IsString()
  JWT_REFRESH_TTL = '7d';

  // Accepts any string of >=32 chars; CryptoService derives a 32-byte key via scrypt
  @IsString()
  @MinLength(32)
  PII_ENCRYPTION_KEY!: string;

  @Type(() => Number)
  @IsNumber()
  OTP_TTL_SECONDS = 300;

  @Type(() => Number)
  @IsNumber()
  OTP_MAX_ATTEMPTS = 3;

  @IsString()
  @IsOptional()
  OTP_DEV_FIXED?: string;

  @IsString()
  @IsOptional()
  ADMIN_WEB_ORIGIN?: string;

  @IsString()
  @IsOptional()
  KYC_VENDOR?: string;
}

export function configValidator(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvSchema, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) {
    throw new Error('Env validation failed:\n' + errors.map((e: { toString(): string }) => e.toString()).join('\n'));
  }
  return validated;
}
