"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const app_error_1 = require("../common/app-error");
const roles_decorator_1 = require("./roles.decorator");
let AuthGuard = class AuthGuard {
    jwt;
    prisma;
    reflector;
    constructor(jwt, prisma, reflector) {
        this.jwt = jwt;
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!token)
            throw app_error_1.Errors.unauthorized();
        try {
            const payload = await this.jwt.verifyAsync(token);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { id: true, email: true, role: true, status: true, preferredLanguage: true }
            });
            if (!user)
                throw app_error_1.Errors.unauthorized();
            if (user.status === "BLOCKED")
                throw app_error_1.Errors.userBlocked();
            const roles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
                context.getHandler(),
                context.getClass()
            ]);
            if (roles?.length && !roles.includes(user.role)) {
                throw app_error_1.Errors.forbidden();
            }
            request.user = user;
            return true;
        }
        catch (error) {
            if (error instanceof Error && "code" in error)
                throw error;
            throw app_error_1.Errors.unauthorized();
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService,
        core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map