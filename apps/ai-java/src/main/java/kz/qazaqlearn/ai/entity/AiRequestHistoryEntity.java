package kz.qazaqlearn.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_request_history")
public class AiRequestHistoryEntity {
    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "material_id")
    private UUID materialId;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(nullable = false, columnDefinition = "text")
    private String answer;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String status = "SUCCESS";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getCourseId() { return courseId; }
    public UUID getMaterialId() { return materialId; }
    public String getMessage() { return message; }
    public String getAnswer() { return answer; }
    public String getModel() { return model; }
    public String getLanguage() { return language; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(UUID id) { this.id = id; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }
    public void setMaterialId(UUID materialId) { this.materialId = materialId; }
    public void setMessage(String message) { this.message = message; }
    public void setAnswer(String answer) { this.answer = answer; }
    public void setModel(String model) { this.model = model; }
    public void setLanguage(String language) { this.language = language; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
