import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../token.service';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'admin') throw new UnauthorizedException();
    const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin || !admin.isActive) throw new UnauthorizedException('Admin not found');
    return { id: admin.id, email: admin.email, role: admin.role };
  }
}
