import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuth: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.adminAuth.login(dto.email, dto.password, {
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
  }
}
