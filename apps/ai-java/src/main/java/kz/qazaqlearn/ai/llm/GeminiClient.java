package kz.qazaqlearn.ai.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kz.qazaqlearn.ai.error.AppException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private final GeminiProperties props;
    private final ObjectMapper mapper = new ObjectMapper();
    private final RestClient restClient;

    public GeminiClient(GeminiProperties props) {
        this.props = props;
        this.restClient = RestClient.builder()
                .baseUrl(props.getBaseUrl())
                .build();
        log.info("Gemini client configured: keyConfigured={}, mockEnabled={}, models={}",
                hasConfiguredApiKey(), props.isMockEnabled(), models());
    }

    public LlmResponse generate(String prompt) {
        return generate(prompt, false);
    }

    public LlmResponse generate(String prompt, boolean jsonMode) {
        String apiKey = props.getApiKey();
        if (!hasConfiguredApiKey()) {
            if (props.isMockEnabled()) {
                log.warn("Gemini API key is not configured; serving mock response because mock mode is enabled");
                return mockResponse(prompt, false);
            }
            log.warn("Gemini API key is not configured and mock mode is disabled");
            throw AppException.aiUnavailable();
        }

        for (String model : models()) {
            if (model == null || model.isBlank()) continue;
            try {
                String answer = callModel(apiKey, model, prompt, jsonMode);
                if (answer != null && !answer.isBlank()) {
                    return new LlmResponse(answer.trim(), model);
                }
            } catch (Exception ex) {
                log.warn("Gemini model {} failed: {}", model, ex.getMessage());
            }
        }

        if (props.isMockEnabled()) {
            log.warn("Gemini call failed for all configured models; serving mock response because mock mode is enabled");
            return mockResponse(prompt, true);
        }

        log.warn("Gemini call failed for all configured models; keyConfigured=true, mockEnabled=false");
        throw AppException.aiUnavailable();
    }

    private List<String> models() {
        return List.of(
                nullSafe(props.getModel()),
                nullSafe(props.getFallbackModel()),
                nullSafe(props.getPreviewFallbackModel())
        );
    }

    private String nullSafe(String v) {
        return v == null ? "" : v;
    }

    private String callModel(String apiKey, String model, String prompt, boolean jsonMode) {
        Map<String, Object> generationConfig = jsonMode
                ? Map.of("responseMimeType", "application/json")
                : Map.of();
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", generationConfig
        );

        String response;
        try {
            response = restClient.post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .body(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        throw new RestClientException(formatProviderError(res.getStatusCode(),
                                res.getBody().readAllBytes()));
                    })
                    .body(String.class);
        } catch (RestClientException ex) {
            throw new RestClientException("Gemini call failed: " + ex.getMessage(), ex);
        }

        if (response == null) return null;
        try {
            JsonNode root = mapper.readTree(response);
            JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
            StringBuilder sb = new StringBuilder();
            if (parts.isArray()) {
                for (JsonNode part : parts) {
                    String t = part.path("text").asText("");
                    if (!t.isEmpty()) sb.append(t).append('\n');
                }
            }
            return sb.toString().trim();
        } catch (Exception ex) {
            log.warn("Failed to parse Gemini response: {}", ex.getMessage());
            return null;
        }
    }

    private LlmResponse mockResponse(String prompt, boolean keyPresent) {
        String text = keyPresent
                ? "AI-провайдер временно недоступен или отклонил запрос (проверьте квоты и доступ). Использован заглушечный ответ."
                : "API-ключ Gemini не задан. Настройте переменную GEMINI_API_KEY для работы с AI-ассистентом.";
        return new LlmResponse(text, "mock");
    }

    private boolean hasConfiguredApiKey() {
        String apiKey = props.getApiKey();
        return apiKey != null && !apiKey.isBlank();
    }

    private String formatProviderError(HttpStatusCode statusCode, byte[] body) {
        String rawBody = new String(body, StandardCharsets.UTF_8).trim();
        if (rawBody.isEmpty()) {
            return "Gemini " + statusCode;
        }
        try {
            JsonNode root = mapper.readTree(rawBody);
            String providerMessage = root.path("error").path("message").asText("");
            if (!providerMessage.isBlank()) {
                return "Gemini " + statusCode + ": " + providerMessage;
            }
        } catch (IOException ignored) {
        }
        return "Gemini " + statusCode + ": " + rawBody;
    }
}
