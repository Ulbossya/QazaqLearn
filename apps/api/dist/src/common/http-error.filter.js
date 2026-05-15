"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpErrorFilter = void 0;
const common_1 = require("@nestjs/common");
const app_error_1 = require("./app-error");
let HttpErrorFilter = class HttpErrorFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        if (exception instanceof app_error_1.AppError) {
            response.status(exception.statusCode).json({
                success: false,
                error: {
                    code: exception.code,
                    messageRu: exception.messageRu,
                    messageKz: exception.messageKz
                }
            });
            return;
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const raw = exception.getResponse();
            const message = typeof raw === "object" && raw && "message" in raw ? String(raw.message) : exception.message;
            response.status(status).json({
                success: false,
                error: {
                    code: status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : "VALIDATION_ERROR",
                    messageRu: message,
                    messageKz: message
                }
            });
            return;
        }
        response.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_SERVER_ERROR",
                messageRu: "Внутренняя ошибка сервера",
                messageKz: "Сервердің ішкі қатесі"
            }
        });
    }
};
exports.HttpErrorFilter = HttpErrorFilter;
exports.HttpErrorFilter = HttpErrorFilter = __decorate([
    (0, common_1.Catch)()
], HttpErrorFilter);
//# sourceMappingURL=http-error.filter.js.map