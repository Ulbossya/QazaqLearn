package kz.qazaqlearn.ai.error;

public final class AppErrorCodes {
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String USER_BLOCKED = "USER_BLOCKED";
    public static final String FORBIDDEN = "FORBIDDEN";
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
    public static final String COURSE_NOT_FOUND = "COURSE_NOT_FOUND";
    public static final String MATERIAL_NOT_FOUND = "MATERIAL_NOT_FOUND";
    public static final String NOT_ENROLLED = "NOT_ENROLLED";
    public static final String AI_RATE_LIMIT = "AI_RATE_LIMIT_EXCEEDED";
    public static final String AI_PROVIDER_UNAVAILABLE = "AI_PROVIDER_UNAVAILABLE";
    public static final String AI_PROMPT_BLOCKED = "AI_PROMPT_BLOCKED";

    private AppErrorCodes() {
    }
}
