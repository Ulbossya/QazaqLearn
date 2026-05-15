package kz.qazaqlearn.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_response_cache", indexes = {
        @Index(name = "ai_response_cache_expires_at_idx", columnList = "expires_at")
})
public class AiResponseCacheEntity {
    @Id
    private UUID id;

    @Column(name = "prompt_hash", nullable = false, unique = true)
    private String promptHash;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false, columnDefinition = "text")
    private String answer;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getPromptHash() { return promptHash; }
    public String getModel() { return model; }
    public String getLanguage() { return language; }
    public String getAnswer() { return answer; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }

    public void setId(UUID id) { this.id = id; }
    public void setPromptHash(String promptHash) { this.promptHash = promptHash; }
    public void setModel(String model) { this.model = model; }
    public void setLanguage(String language) { this.language = language; }
    public void setAnswer(String answer) { this.answer = answer; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
