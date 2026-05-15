package kz.qazaqlearn.ai.dto;

import java.util.List;

public record PageResponse<T>(List<T> items, PageMeta meta) {
}
