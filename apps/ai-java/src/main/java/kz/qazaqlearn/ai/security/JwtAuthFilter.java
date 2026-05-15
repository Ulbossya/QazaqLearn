package kz.qazaqlearn.ai.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kz.qazaqlearn.ai.config.JwtConfig;
import kz.qazaqlearn.ai.entity.UserEntity;
import kz.qazaqlearn.ai.error.AppException;
import kz.qazaqlearn.ai.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final SecretKey signingKey;
    private final long clockSkewSeconds;
    private final UserRepository userRepository;

    public JwtAuthFilter(SecretKey jwtSigningKey, JwtConfig jwtConfig, UserRepository userRepository) {
        this.signingKey = jwtSigningKey;
        this.clockSkewSeconds = jwtConfig.getClockSkewSeconds();
        this.userRepository = userRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.equals("/ai/health")
                || path.equals("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw AppException.unauthorized();
        }
        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            throw AppException.unauthorized();
        }

        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .clockSkewSeconds(clockSkewSeconds)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            log.debug("Expired JWT");
            throw AppException.unauthorized();
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("Invalid JWT: {}", ex.getMessage());
            throw AppException.unauthorized();
        }

        UUID userId;
        try {
            userId = UUID.fromString(claims.getSubject());
        } catch (Exception ex) {
            throw AppException.unauthorized();
        }

        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw AppException.unauthorized();
        }
        UserEntity user = userOpt.get();
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw AppException.userBlocked();
        }

        Role role;
        try {
            role = Role.valueOf(user.getRole());
        } catch (IllegalArgumentException ex) {
            throw AppException.forbidden();
        }

        AuthUser auth = new AuthUser(user.getId(), user.getEmail(), role,
                user.getPreferredLanguage() == null ? "ru" : user.getPreferredLanguage(),
                token);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(auth, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        request.setAttribute("authUser", auth);

        chain.doFilter(request, response);
    }
}
