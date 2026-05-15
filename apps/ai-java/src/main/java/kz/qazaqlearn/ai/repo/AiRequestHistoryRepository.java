package kz.qazaqlearn.ai.repo;

import kz.qazaqlearn.ai.entity.AiRequestHistoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AiRequestHistoryRepository extends JpaRepository<AiRequestHistoryEntity, UUID> {
    Page<AiRequestHistoryEntity> findAllByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<AiRequestHistoryEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<AiRequestHistoryEntity> findTop5ByUserIdAndCourseIdOrderByCreatedAtDesc(UUID userId, UUID courseId);
}
