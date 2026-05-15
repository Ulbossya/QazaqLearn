package kz.qazaqlearn.ai.error;

public class AppException extends RuntimeException {
    private final String code;
    private final int statusCode;
    private final String messageRu;
    private final String messageKz;

    public AppException(String code, int statusCode, String messageRu, String messageKz) {
        super(messageRu);
        this.code = code;
        this.statusCode = statusCode;
        this.messageRu = messageRu;
        this.messageKz = messageKz;
    }

    public String getCode() { return code; }
    public int getStatusCode() { return statusCode; }
    public String getMessageRu() { return messageRu; }
    public String getMessageKz() { return messageKz; }

    public static AppException unauthorized() {
        return new AppException(AppErrorCodes.UNAUTHORIZED, 401, "Требуется авторизация", "Авторизация қажет");
    }

    public static AppException userBlocked() {
        return new AppException(AppErrorCodes.USER_BLOCKED, 403, "Пользователь заблокирован", "Пайдаланушы бұғатталған");
    }

    public static AppException forbidden() {
        return new AppException(AppErrorCodes.FORBIDDEN, 403, "Доступ запрещён", "Қол жеткізуге тыйым салынған");
    }

    public static AppException validation(String reason) {
        return new AppException(AppErrorCodes.VALIDATION_ERROR, 422,
                "Ошибка валидации: " + reason,
                "Тексеру қатесі: " + reason);
    }

    public static AppException courseNotFound() {
        return new AppException(AppErrorCodes.COURSE_NOT_FOUND, 404, "Курс не найден", "Курс табылмады");
    }

    public static AppException materialNotFound() {
        return new AppException(AppErrorCodes.MATERIAL_NOT_FOUND, 404, "Материал не найден", "Материал табылмады");
    }

    public static AppException notEnrolled() {
        return new AppException(AppErrorCodes.NOT_ENROLLED, 403, "Вы не записаны на курс", "Сіз курсқа жазылмағансыз");
    }

    public static AppException aiRateLimit() {
        return new AppException(AppErrorCodes.AI_RATE_LIMIT, 429,
                "Превышен лимит AI-запросов в час",
                "Сағатына AI сұраулар шегінен асты");
    }

    public static AppException aiUnavailable() {
        return new AppException(AppErrorCodes.AI_PROVIDER_UNAVAILABLE, 503,
                "AI-сервис временно недоступен",
                "AI қызметі уақытша қолжетімсіз");
    }

    public static AppException promptBlocked() {
        return new AppException(AppErrorCodes.AI_PROMPT_BLOCKED, 422,
                "Запрос отклонён системой безопасности",
                "Сұрау қауіпсіздік жүйесімен қабылданбады");
    }
}
