import "reflect-metadata";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { json, urlencoded, Request, Response, NextFunction, static as serveStatic } from "express";
import { AppModule } from "./app.module";
import { ApiResponseInterceptor } from "./common/api-response.interceptor";
import { HttpErrorFilter } from "./common/http-error.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const port = Number(process.env.PORT) || 3000;

  app.use(helmet());
  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ extended: true, limit: "10mb" }));
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
  });
  app.enableCors({
    origin: appUrl,
    credentials: true
  });
  app.setGlobalPrefix("api/v1");
  const webRoot = [join(process.cwd(), "../web/dist"), join(process.cwd(), "apps/web/dist")].find((path) =>
    existsSync(join(path, "index.html"))
  );
  if (webRoot) {
    const expressApp = app.getHttpAdapter().getInstance();
    app.use(serveStatic(webRoot));
    expressApp.get(/^\/(?!api(?:\/|$)|uploads(?:\/|$)).*/, (_req: Request, res: Response) => {
      res.sendFile(join(webRoot, "index.html"));
    });
  }
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(new HttpErrorFilter());
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle("QazaqLearn API")
    .setDescription("Bilingual online learning platform API")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(port, "0.0.0.0");
}

bootstrap();
