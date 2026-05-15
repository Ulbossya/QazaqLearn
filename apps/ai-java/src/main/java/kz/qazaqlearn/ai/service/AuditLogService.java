package kz.qazaqlearn.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    @PersistenceContext
    private EntityManager em;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    private final ObjectMapper mapper = new ObjectMapper();

    @Transactional
    public void log(UUID actorId, String action, String entityType, UUID entityId, Map<String, Object> metadata) {
        try {
            String metadataJson;
            try {
                metadataJson = metadata == null ? null : mapper.writeValueAsString(metadata);
            } catch (Exception ex) {
                metadataJson = "{}";
            }

            boolean isPostgres = isPostgres();
            String sql;
            if (isPostgres) {
                sql = "INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) "
                        + "VALUES (:id, :actorId, CAST(:action AS \"AuditAction\"), :entityType, :entityId, CAST(:metadata AS jsonb), :createdAt)";
            } else {
                sql = "INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) "
                        + "VALUES (:id, :actorId, :action, :entityType, :entityId, :metadata, :createdAt)";
            }
            em.createNativeQuery(sql)
                    .setParameter("id", UUID.randomUUID())
                    .setParameter("actorId", actorId)
                    .setParameter("action", action)
                    .setParameter("entityType", entityType)
                    .setParameter("entityId", entityId)
                    .setParameter("metadata", metadataJson)
                    .setParameter("createdAt", Instant.now())
                    .executeUpdate();
        } catch (Exception ex) {
            log.warn("Failed to write audit log entry action={} entity={}: {}", action, entityType, ex.getMessage());
        }
    }

    private boolean isPostgres() {
        if (datasourceUrl != null && datasourceUrl.toLowerCase().startsWith("jdbc:postgresql:")) {
            return true;
        }
        try {
            return em.getEntityManagerFactory()
                    .getProperties()
                    .getOrDefault("hibernate.dialect", "")
                    .toString()
                    .toLowerCase()
                    .contains("postgres");
        } catch (Exception ex) {
            return false;
        }
    }
}
