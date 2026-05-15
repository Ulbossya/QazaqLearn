package kz.qazaqlearn.ai.config;

import kz.qazaqlearn.ai.security.AppExceptionTranslatorFilter;
import kz.qazaqlearn.ai.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   AppExceptionTranslatorFilter translatorFilter,
                                                   JwtAuthFilter jwtFilter) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                        "/ai/health", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(translatorFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(jwtFilter, AppExceptionTranslatorFilter.class);
        return http.build();
    }
}
