package kz.qazaqlearn.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_usage_limits")
public class AiUsageLimitEntity {
    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "requests_count", nullable = false)
    private int requestsCount;

    @Column(name = "window_started_at", nullable = false)
    private Instant windowStartedAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public int getRequestsCount() { return requestsCount; }
    public Instant getWindowStartedAt() { return windowStartedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setRequestsCount(int requestsCount) { this.requestsCount = requestsCount; }
    public void setWindowStartedAt(Instant windowStartedAt) { this.windowStartedAt = windowStartedAt; }
}
