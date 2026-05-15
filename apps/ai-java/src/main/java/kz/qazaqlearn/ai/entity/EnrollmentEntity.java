package kz.qazaqlearn.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "enrollments")
public class EnrollmentEntity {
    @Id
    private UUID id;

    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "status")
    private String status;

    public UUID getId() { return id; }
    public UUID getCourseId() { return courseId; }
    public UUID getStudentId() { return studentId; }
    public String getStatus() { return status; }
}
