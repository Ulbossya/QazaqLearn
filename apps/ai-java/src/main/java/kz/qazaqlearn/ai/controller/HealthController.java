package kz.qazaqlearn.ai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/ai/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "service", "qazaqlearn-ai");
    }
}
