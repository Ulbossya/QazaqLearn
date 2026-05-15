import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "node:path";
import { AppController } from "./app.controller";
import { PlatformService } from "./platform.service";
import { PrismaService } from "./prisma.service";
import { AuthGuard } from "./auth/auth.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "change-me",
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.UPLOAD_DIR || "uploads"),
      serveRoot: "/uploads"
    })
  ],
  controllers: [AppController],
  providers: [PrismaService, PlatformService, AuthGuard]
})
export class AppModule {}
