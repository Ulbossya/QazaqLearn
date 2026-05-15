import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
export declare class AuthGuard implements CanActivate {
    private readonly jwt;
    private readonly prisma;
    private readonly reflector;
    constructor(jwt: JwtService, prisma: PrismaService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
