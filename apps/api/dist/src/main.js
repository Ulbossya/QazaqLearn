"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const helmet_1 = require("helmet");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const express_1 = require("express");
const app_module_1 = require("./app.module");
const api_response_interceptor_1 = require("./common/api-response.interceptor");
const http_error_filter_1 = require("./common/http-error.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const appUrl = process.env.APP_URL || "http://localhost:5173";
    const port = Number(process.env.PORT) || 3000;
    app.use((0, helmet_1.default)());
    app.use((0, express_1.json)({ limit: "10mb" }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: "10mb" }));
    app.use((req, res, next) => {
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
    const webRoot = [(0, node_path_1.join)(process.cwd(), "../web/dist"), (0, node_path_1.join)(process.cwd(), "apps/web/dist")].find((path) => (0, node_fs_1.existsSync)((0, node_path_1.join)(path, "index.html")));
    if (webRoot) {
        const expressApp = app.getHttpAdapter().getInstance();
        app.use((0, express_1.static)(webRoot));
        expressApp.get(/^\/(?!api(?:\/|$)|uploads(?:\/|$)).*/, (_req, res) => {
            res.sendFile((0, node_path_1.join)(webRoot, "index.html"));
        });
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
    }));
    app.useGlobalFilters(new http_error_filter_1.HttpErrorFilter());
    app.useGlobalInterceptors(new api_response_interceptor_1.ApiResponseInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle("QazaqLearn API")
        .setDescription("Bilingual online learning platform API")
        .setVersion("0.1.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    await app.listen(port, "0.0.0.0");
}
bootstrap();
//# sourceMappingURL=main.js.map