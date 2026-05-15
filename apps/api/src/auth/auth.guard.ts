import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import { Errors } from "../common/app-error";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) throw Errors.unauthorized();

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, status: true, preferredLanguage: true }
      });
      if (!user) throw Errors.unauthorized();
      if (user.status === "BLOCKED") throw Errors.userBlocked();

      const roles = this.reflector.getAllAndOverride<Array<"STUDENT" | "TEACHER" | "ADMIN">>(ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ]);
      if (roles?.length && !roles.includes(user.role)) {
        throw Errors.forbidden();
      }

      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof Error && "code" in error) throw error;
      throw Errors.unauthorized();
    }
  }
}
