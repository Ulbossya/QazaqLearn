package kz.qazaqlearn.ai.error;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AppExceptionTest {

    @Test
    void rateLimitReturnsKnownCode() {
        AppException ex = AppException.aiRateLimit();
        assertThat(ex.getCode()).isEqualTo(AppErrorCodes.AI_RATE_LIMIT);
        assertThat(ex.getStatusCode()).isEqualTo(429);
        assertThat(ex.getMessageKz()).contains("AI");
    }

    @Test
    void aiUnavailableMaps503() {
        assertThat(AppException.aiUnavailable().getStatusCode()).isEqualTo(503);
    }

    @Test
    void promptBlockedReturnsValidationCode() {
        AppException ex = AppException.promptBlocked();
        assertThat(ex.getCode()).isEqualTo(AppErrorCodes.AI_PROMPT_BLOCKED);
        assertThat(ex.getStatusCode()).isEqualTo(422);
    }

    @Test
    void userBlockedReturns403() {
        assertThat(AppException.userBlocked().getStatusCode()).isEqualTo(403);
    }
}
