package kz.qazaqlearn.ai.dto;

import java.util.List;

public record GeneratedQuestion(
        String questionTextRu,
        String questionTextKz,
        String type,
        List<OptionDto> options,
        String correctAnswer,
        int points
) {
}
