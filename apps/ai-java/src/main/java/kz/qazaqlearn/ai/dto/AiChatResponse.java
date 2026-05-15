package kz.qazaqlearn.ai.dto;

import java.time.Instant;

public record AiChatResponse(
        String answer,
        String model,
        String language,
        Instant createdAt,
        boolean cached
) {
}
