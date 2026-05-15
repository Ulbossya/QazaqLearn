package kz.qazaqlearn.ai.repo;

import kz.qazaqlearn.ai.entity.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, UUID> {
    Optional<EnrollmentEntity> findFirstByCourseIdAndStudentId(UUID courseId, UUID studentId);
}
