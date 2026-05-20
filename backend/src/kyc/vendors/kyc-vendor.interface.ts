export interface PanVerificationRequest {
  panNumber: string;
  nameAsPerPan: string;
}

export interface AadhaarVerificationRequest {
  aadhaarLast4: string;
  addressLine1: string;
  city: string;
  pincode: string;
}

export interface VendorResult {
  vendorRequestId: string;
  status: 'verified' | 'rejected' | 'pending';
  vendorRaw: Record<string, unknown>;
  rejectionReason?: string;
}

/**
 * All third-party KYC vendors implement this interface.
 * Swap MockKycVendor with DigioKycVendor / IdfyKycVendor / HypervergeKycVendor
 * by changing the KYC_VENDOR env var. No business-logic changes needed.
 */
export interface KycVendor {
  verifyPan(req: PanVerificationRequest): Promise<VendorResult>;
  verifyAadhaar(req: AadhaarVerificationRequest): Promise<VendorResult>;
  verifySelfie(buffer: Buffer, mimetype: string): Promise<VendorResult>;
}
