import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { AppError } from "./app-error";

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof AppError) {
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

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();
      const message = typeof raw === "object" && raw && "message" in raw ? String((raw as { message: unknown }).message) : exception.message;
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
}
