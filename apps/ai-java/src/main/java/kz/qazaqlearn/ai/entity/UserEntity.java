package kz.qazaqlearn.ai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "users")
public class UserEntity {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "preferred_language")
    private String preferredLanguage;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String status;

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
}
