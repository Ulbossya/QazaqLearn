package kz.qazaqlearn.ai.dto;

public record PageMeta(int page, int limit, long total, boolean hasNext) {
}
