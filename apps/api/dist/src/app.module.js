"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const serve_static_1 = require("@nestjs/serve-static");
const node_path_1 = require("node:path");
const app_controller_1 = require("./app.controller");
const platform_service_1 = require("./platform.service");
const prisma_service_1 = require("./prisma.service");
const auth_guard_1 = require("./auth/auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || "change-me",
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, node_path_1.join)(process.cwd(), process.env.UPLOAD_DIR || "uploads"),
                serveRoot: "/uploads"
            })
        ],
        controllers: [app_controller_1.AppController],
        providers: [prisma_service_1.PrismaService, platform_service_1.PlatformService, auth_guard_1.AuthGuard]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map