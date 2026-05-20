import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { SendOtpDto, VerifyOtpDto, RefreshDto } from './dto';
import { JwtUserGuard } from './guards/jwt-user.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokenService,
  ) {}

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  send(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phone);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verify(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    return this.auth.verifyOtp(dto.requestId, dto.phone, dto.otp, {
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.tokens.rotate(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtUserGuard)
  logout(@CurrentUser() user: { id: string }) {
    return this.auth.logout(user.id);
  }
}
