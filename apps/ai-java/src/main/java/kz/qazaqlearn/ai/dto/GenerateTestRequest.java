package kz.qazaqlearn.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record GenerateTestRequest(
        @NotNull UUID courseId,
        UUID materialId,
        @Min(1) @Max(20) int count,
        @NotNull @Pattern(regexp = "ru|kz") String language,
        @Pattern(regexp = "SINGLE|MULTIPLE|MIXED") String questionType,
        @Size(max = 200) String topic
) {
    public String safeQuestionType() {
        return questionType == null ? "SINGLE" : questionType;
    }
}
