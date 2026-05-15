package kz.qazaqlearn.ai.repo;

import kz.qazaqlearn.ai.entity.AiResponseCacheEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AiResponseCacheRepository extends JpaRepository<AiResponseCacheEntity, UUID> {

    Optional<AiResponseCacheEntity> findByPromptHash(String promptHash);

    @Modifying
    @Query("delete from AiResponseCacheEntity c where c.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}
