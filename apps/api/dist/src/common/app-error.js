"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.AppError = void 0;
class AppError extends Error {
    code;
    messageRu;
    messageKz;
    statusCode;
    constructor(code, messageRu, messageKz, statusCode = 400) {
        super(messageRu);
        this.code = code;
        this.messageRu = messageRu;
        this.messageKz = messageKz;
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
exports.Errors = {
    validation: () => new AppError("VALIDATION_ERROR", "Ошибка валидации", "Валидация қатесі", 400),
    unauthorized: () => new AppError("UNAUTHORIZED", "Требуется авторизация", "Авторизация қажет", 401),
    forbidden: () => new AppError("FORBIDDEN", "Недостаточно прав", "Құқық жеткіліксіз", 403),
    userNotFound: () => new AppError("USER_NOT_FOUND", "Пользователь не найден", "Пайдаланушы табылмады", 404),
    userBlocked: () => new AppError("USER_BLOCKED", "Пользователь заблокирован", "Пайдаланушы бұғатталған", 403),
    courseNotFound: () => new AppError("COURSE_NOT_FOUND", "Курс не найден", "Курс табылмады", 404),
    courseNotPublished: () => new AppError("COURSE_NOT_PUBLISHED", "Курс не опубликован", "Курс жарияланбаған", 403),
    notEnrolled: () => new AppError("NOT_ENROLLED", "Студент не записан на курс", "Студент курсқа жазылмаған", 403),
    alreadyEnrolled: () => new AppError("ALREADY_ENROLLED", "Вы уже записаны на курс", "Сіз бұл курсқа жазылғансыз", 409),
    materialNotFound: () => new AppError("MATERIAL_NOT_FOUND", "Материал не найден", "Материал табылмады", 404),
    testNotFound: () => new AppError("TEST_NOT_FOUND", "Тест не найден", "Тест табылмады", 404),
    aiRateLimit: () => new AppError("AI_RATE_LIMIT_EXCEEDED", "Превышен лимит AI-запросов. Попробуйте позже.", "AI сұрауларының лимиті асып кетті. Кейінірек қайталап көріңіз.", 429),
    aiUnavailable: () => new AppError("AI_PROVIDER_UNAVAILABLE", "AI-сервис временно недоступен.", "AI қызметі уақытша қолжетімсіз.", 503),
    fileTooLarge: () => new AppError("FILE_TOO_LARGE", "Файл слишком большой", "Файл тым үлкен", 413),
    unsupportedFileType: () => new AppError("UNSUPPORTED_FILE_TYPE", "Неподдерживаемый тип файла", "Файл түріне қолдау көрсетілмейді", 415)
};
//# sourceMappingURL=app-error.js.map