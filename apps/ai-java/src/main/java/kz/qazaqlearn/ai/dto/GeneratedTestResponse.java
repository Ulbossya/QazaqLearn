package kz.qazaqlearn.ai.dto;

import java.util.List;

public record GeneratedTestResponse(
        String titleRu,
        String titleKz,
        List<GeneratedQuestion> questions,
        String model,
        boolean cached
) {
}
