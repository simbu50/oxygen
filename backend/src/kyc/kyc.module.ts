import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KycController } from './kyc.controller';
import { AdminKycController } from './admin-kyc.controller';
import { KycService } from './kyc.service';
import { KYC_VENDOR } from './vendors/kyc-vendor.token';
import { MockKycVendor } from './vendors/mock-kyc.vendor';
import { KycVendor } from './vendors/kyc-vendor.interface';

@Module({
  controllers: [KycController, AdminKycController],
  providers: [
    KycService,
    {
      provide: KYC_VENDOR,
      inject: [ConfigService],
      useFactory: (config: ConfigService): KycVendor => {
        const vendor = config.get<string>('KYC_VENDOR') ?? 'mock';
        switch (vendor) {
          case 'mock':
            return new MockKycVendor();
          // case 'digio': return new DigioKycVendor(config);
          // case 'idfy': return new IdfyKycVendor(config);
          default:
            throw new Error(`Unknown KYC vendor: ${vendor}`);
        }
      },
    },
  ],
})
export class KycModule {}
