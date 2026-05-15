package kz.qazaqlearn.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "course_materials")
public class CourseMaterialEntity {
    @Id
    private UUID id;

    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "title_ru")
    private String titleRu;

    @Column(name = "title_kz")
    private String titleKz;

    @Column(name = "content_ru")
    private String contentRu;

    @Column(name = "content_kz")
    private String contentKz;

    @Column(name = "is_deleted")
    private boolean deleted;

    public UUID getId() { return id; }
    public UUID getCourseId() { return courseId; }
    public String getTitleRu() { return titleRu; }
    public String getTitleKz() { return titleKz; }
    public String getContentRu() { return contentRu; }
    public String getContentKz() { return contentKz; }
    public boolean isDeleted() { return deleted; }
}
