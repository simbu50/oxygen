import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, mixin, Type } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAdminGuard extends AuthGuard('jwt-admin') {}

export const ADMIN_ROLES_KEY = 'adminRoles';
export const AdminRoles = (...roles: string[]) => SetMetadata(ADMIN_ROLES_KEY, roles);

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ADMIN_ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const req = ctx.switchToHttp().getRequest<{ user: { role: string } }>();
    if (!required.includes(req.user.role)) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
