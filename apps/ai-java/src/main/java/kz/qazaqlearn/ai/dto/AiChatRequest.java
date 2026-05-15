package kz.qazaqlearn.ai.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AiChatRequest(
        @NotNull UUID courseId,
        UUID materialId,
        @NotNull @Size(min = 2, max = 4000) String message,
        @NotNull @Pattern(regexp = "ru|kz") String language
) {
}
