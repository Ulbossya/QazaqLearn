package kz.qazaqlearn.ai.service;

import kz.qazaqlearn.ai.dto.HistoryItem;
import kz.qazaqlearn.ai.dto.PageMeta;
import kz.qazaqlearn.ai.dto.PageResponse;
import kz.qazaqlearn.ai.entity.AiRequestHistoryEntity;
import kz.qazaqlearn.ai.repo.AiRequestHistoryRepository;
import kz.qazaqlearn.ai.security.AuthUser;
import kz.qazaqlearn.ai.security.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HistoryService {

    private final AiRequestHistoryRepository repo;

    public HistoryService(AiRequestHistoryRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public PageResponse<HistoryItem> list(AuthUser user, int page, int limit) {
        int safePage = Math.max(1, page);
        int safeLimit = Math.min(Math.max(1, limit), 100);
        Pageable pageable = PageRequest.of(safePage - 1, safeLimit);
        Page<AiRequestHistoryEntity> result;
        if (user.role() == Role.ADMIN) {
            result = repo.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            result = repo.findAllByUserIdOrderByCreatedAtDesc(user.id(), pageable);
        }
        List<HistoryItem> items = result.getContent().stream()
                .map(this::map)
                .toList();
        boolean hasNext = (long) safePage * safeLimit < result.getTotalElements();
        return new PageResponse<>(items, new PageMeta(safePage, safeLimit, result.getTotalElements(), hasNext));
    }

    private HistoryItem map(AiRequestHistoryEntity e) {
        return new HistoryItem(
                e.getId(),
                e.getUserId(),
                e.getCourseId(),
                e.getMaterialId(),
                e.getMessage(),
                e.getAnswer(),
                e.getModel(),
                e.getLanguage(),
                e.getStatus(),
                e.getCreatedAt()
        );
    }
}
