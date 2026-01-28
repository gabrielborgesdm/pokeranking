import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestContextService } from '../services/request-context.service';
import { SentryService } from '../../sentry/sentry.service';

interface JwtUser {
  _id: string;
  username: string;
  email: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private sentryService: SentryService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // For public routes, try to extract user if token is present (but don't fail if missing)
      await this.tryExtractUser(context);
      return true;
    }

    // For protected routes, validate JWT
    const result = await (super.canActivate(context) as Promise<boolean>);

    // Set user in request context after successful authentication
    if (result) {
      this.setUserContext(context);
    }

    return result;
  }

  private async tryExtractUser(context: ExecutionContext): Promise<void> {
    try {
      // Attempt to validate JWT - this will populate request.user if valid
      await super.canActivate(context);
      this.setUserContext(context);
    } catch {
      // Token missing or invalid - that's fine for public routes
    }
  }

  private setUserContext(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser | undefined;

    if (user) {
      RequestContextService.setUser({
        id: user._id,
        username: user.username,
        email: user.email,
      });

      this.sentryService.setUser({
        id: user._id,
        username: user.username,
        email: user.email,
      });
    }
  }
}
