package kz.qazaqlearn.ai.repo;

import kz.qazaqlearn.ai.entity.AiUsageLimitEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AiUsageLimitRepository extends JpaRepository<AiUsageLimitEntity, UUID> {
    Optional<AiUsageLimitEntity> findByUserId(UUID userId);
}
