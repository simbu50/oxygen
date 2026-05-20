import { IsDateString, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(60)
  firstName!: string;

  @IsString()
  @MaxLength(60)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsDateString()
  dateOfBirth!: string;
}

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}
