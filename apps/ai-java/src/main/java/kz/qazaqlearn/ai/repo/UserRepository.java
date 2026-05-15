package kz.qazaqlearn.ai.repo;

import kz.qazaqlearn.ai.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByIdAndStatus(UUID id, String status);
}
