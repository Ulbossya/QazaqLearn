package kz.qazaqlearn.ai.repo;

import kz.qazaqlearn.ai.entity.CourseMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterialEntity, UUID> {
}
