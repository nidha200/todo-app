import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true; // no role restriction

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');
    const [type, token] = authHeader.split(' ');
    if (!token || type !== 'Bearer') throw new UnauthorizedException('Invalid Authorization header');

    try {
      const payload: any = this.jwtService.verify(token);
      // attach user payload to request for downstream use
      request.user = payload;
      const userRole = payload.role || 'user';
      if (requiredRoles.includes(userRole)) return true;
      throw new ForbiddenException('Insufficient role');
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') throw new UnauthorizedException('Token expired');
      throw new UnauthorizedException('Invalid token');
    }
  }
}
