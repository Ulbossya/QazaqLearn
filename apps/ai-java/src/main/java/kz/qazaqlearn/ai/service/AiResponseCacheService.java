package kz.qazaqlearn.ai.service;

import kz.qazaqlearn.ai.entity.AiResponseCacheEntity;
import kz.qazaqlearn.ai.repo.AiResponseCacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class AiResponseCacheService {
    private static final Logger log = LoggerFactory.getLogger(AiResponseCacheService.class);

    private final AiResponseCacheRepository repo;

    @Value("${qazaqlearn.cache.chat-ttl-minutes:60}")
    private long chatTtlMinutes;

    @Value("${qazaqlearn.cache.test-gen-ttl-minutes:1440}")
    private long testGenTtlMinutes;

    public AiResponseCacheService(AiResponseCacheRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public Optional<AiResponseCacheEntity> lookup(String promptHash) {
        Optional<AiResponseCacheEntity> found = repo.findByPromptHash(promptHash);
        if (found.isEmpty()) return Optional.empty();
        if (found.get().getExpiresAt().isBefore(Instant.now())) return Optional.empty();
        return found;
    }

    @Transactional
    public AiResponseCacheEntity save(String promptHash, String model, String language,
                                      String answer, Duration ttl) {
        Optional<AiResponseCacheEntity> existing = repo.findByPromptHash(promptHash);
        AiResponseCacheEntity entity = existing.orElseGet(AiResponseCacheEntity::new);
        entity.setPromptHash(promptHash);
        entity.setModel(model);
        entity.setLanguage(language);
        entity.setAnswer(answer);
        if (entity.getCreatedAt() == null) entity.setCreatedAt(Instant.now());
        entity.setExpiresAt(Instant.now().plus(ttl));
        return repo.save(entity);
    }

    public Duration chatTtl() {
        return Duration.ofMinutes(chatTtlMinutes);
    }

    public Duration testGenTtl() {
        return Duration.ofMinutes(testGenTtlMinutes);
    }

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void evictExpired() {
        int removed = repo.deleteExpired(Instant.now());
        if (removed > 0) log.debug("Evicted {} expired cache entries", removed);
    }
}
