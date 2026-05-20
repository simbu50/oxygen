import { IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class SubmitPanDto {
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, { message: 'panNumber must match PAN format (e.g. ABCDE1234F)' })
  panNumber!: string;

  @IsString()
  @MaxLength(120)
  nameAsPerPan!: string;
}

export class SubmitAadhaarDto {
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'aadhaarLast4 must be 4 digits' })
  aadhaarLast4!: string;

  @IsString()
  @MaxLength(120)
  addressLine1!: string;

  @IsString()
  @MaxLength(60)
  city!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'pincode must be 6 digits' })
  pincode!: string;
}

export class RejectKycDto {
  @IsString()
  @MaxLength(200)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class ApproveKycDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
