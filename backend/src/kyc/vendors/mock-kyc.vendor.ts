import { v4 as uuidv4 } from 'uuid';
import {
  AadhaarVerificationRequest,
  KycVendor,
  PanVerificationRequest,
  VendorResult,
} from './kyc-vendor.interface';

/**
 * Dev/test KYC vendor.
 * Always returns "verified" except:
 *  - PAN starting with "FAIL" -> rejected
 *  - Aadhaar last4 = "0000" -> rejected
 *  - Selfie smaller than 1 KB -> rejected
 */
export class MockKycVendor implements KycVendor {
  async verifyPan(req: PanVerificationRequest): Promise<VendorResult> {
    const id = uuidv4();
    if (req.panNumber.startsWith('FAIL')) {
      return {
        vendorRequestId: id,
        status: 'rejected',
        vendorRaw: { reason: 'name-mismatch' },
        rejectionReason: 'PAN name does not match',
      };
    }
    return {
      vendorRequestId: id,
      status: 'verified',
      vendorRaw: { matchedName: req.nameAsPerPan, source: 'mock-nsdl' },
    };
  }

  async verifyAadhaar(req: AadhaarVerificationRequest): Promise<VendorResult> {
    const id = uuidv4();
    if (req.aadhaarLast4 === '0000') {
      return {
        vendorRequestId: id,
        status: 'rejected',
        vendorRaw: {},
        rejectionReason: 'Aadhaar not found',
      };
    }
    return { vendorRequestId: id, status: 'verified', vendorRaw: { source: 'mock-uidai' } };
  }

  async verifySelfie(buffer: Buffer, mimetype: string): Promise<VendorResult> {
    const id = uuidv4();
    if (buffer.length < 1024) {
      return {
        vendorRequestId: id,
        status: 'rejected',
        vendorRaw: { size: buffer.length },
        rejectionReason: 'Selfie too small / corrupt',
      };
    }
    return {
      vendorRequestId: id,
      status: 'verified',
      vendorRaw: { mimetype, size: buffer.length, livenessScore: 0.97 },
    };
  }
}
