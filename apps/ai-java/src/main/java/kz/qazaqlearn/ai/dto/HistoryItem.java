package kz.qazaqlearn.ai.dto;

import java.time.Instant;
import java.util.UUID;

public record HistoryItem(
        UUID id,
        UUID userId,
        UUID courseId,
        UUID materialId,
        String message,
        String answer,
        String model,
        String language,
        String status,
        Instant createdAt
) {
}
