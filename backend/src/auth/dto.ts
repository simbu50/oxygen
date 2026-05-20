import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'phone must be in E.164 format' })
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  requestId!: string;

  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'phone must be in E.164 format' })
  phone!: string;

  @IsString()
  @Length(6, 6, { message: 'otp must be 6 digits' })
  @Matches(/^\d{6}$/)
  otp!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

export class AdminLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
