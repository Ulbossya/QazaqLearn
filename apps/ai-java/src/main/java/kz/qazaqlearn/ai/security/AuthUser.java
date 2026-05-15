package kz.qazaqlearn.ai.security;

import java.util.UUID;

public record AuthUser(UUID id, String email, Role role, String preferredLanguage, String rawToken) {
}
