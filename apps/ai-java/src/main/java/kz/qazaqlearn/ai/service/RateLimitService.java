package kz.qazaqlearn.ai.service;

import kz.qazaqlearn.ai.entity.AiUsageLimitEntity;
import kz.qazaqlearn.ai.error.AppException;
import kz.qazaqlearn.ai.repo.AiUsageLimitRepository;
import kz.qazaqlearn.ai.security.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RateLimitService {

    private final AiUsageLimitRepository repo;

    @Value("${qazaqlearn.rate-limit.student-per-hour:20}")
    private int studentLimit;

    @Value("${qazaqlearn.rate-limit.teacher-per-hour:50}")
    private int teacherLimit;

    @Value("${qazaqlearn.rate-limit.admin-per-hour:100}")
    private int adminLimit;

    public RateLimitService(AiUsageLimitRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void enforce(UUID userId, Role role) {
        int limit = limitFor(role);
        Instant now = Instant.now();
        Optional<AiUsageLimitEntity> usageOpt = repo.findByUserId(userId);
        if (usageOpt.isEmpty()
                || Duration.between(usageOpt.get().getWindowStartedAt(), now).toMillis() > 60 * 60 * 1000L) {
            AiUsageLimitEntity usage = usageOpt.orElseGet(AiUsageLimitEntity::new);
            usage.setUserId(userId);
            usage.setRequestsCount(1);
            usage.setWindowStartedAt(now);
            repo.save(usage);
            return;
        }
        AiUsageLimitEntity usage = usageOpt.get();
        if (usage.getRequestsCount() >= limit) {
            throw AppException.aiRateLimit();
        }
        usage.setRequestsCount(usage.getRequestsCount() + 1);
        repo.save(usage);
    }

    private int limitFor(Role role) {
        return switch (role) {
            case ADMIN -> adminLimit;
            case TEACHER -> teacherLimit;
            case STUDENT -> studentLimit;
        };
    }
}
