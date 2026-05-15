package kz.qazaqlearn.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "courses")
public class CourseEntity {
    @Id
    private UUID id;

    @Column(name = "teacher_id")
    private UUID teacherId;

    @Column(name = "title_ru")
    private String titleRu;

    @Column(name = "title_kz")
    private String titleKz;

    @Column(name = "description_ru")
    private String descriptionRu;

    @Column(name = "description_kz")
    private String descriptionKz;

    @Column(name = "status")
    private String status;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public UUID getId() { return id; }
    public UUID getTeacherId() { return teacherId; }
    public String getTitleRu() { return titleRu; }
    public String getTitleKz() { return titleKz; }
    public String getDescriptionRu() { return descriptionRu; }
    public String getDescriptionKz() { return descriptionKz; }
    public String getStatus() { return status; }
    public Instant getDeletedAt() { return deletedAt; }
}
