package kz.qazaqlearn.ai.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtConfig {

    @Value("${qazaqlearn.jwt.secret}")
    private String secret;

    @Value("${qazaqlearn.jwt.clock-skew-seconds:30}")
    private long clockSkewSeconds;

    @Bean
    public SecretKey jwtSigningKey() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(bytes, 0, padded, 0, bytes.length);
            return Keys.hmacShaKeyFor(padded);
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public long getClockSkewSeconds() {
        return clockSkewSeconds;
    }
}
