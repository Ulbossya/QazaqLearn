package kz.qazaqlearn.ai.llm;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "qazaqlearn.gemini")
public class GeminiProperties {
    private String apiKey;
    private String model;
    private String fallbackModel;
    private String previewFallbackModel;
    private boolean mockEnabled = true;
    private int timeoutSeconds = 30;
    private String baseUrl = "https://generativelanguage.googleapis.com";

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getFallbackModel() { return fallbackModel; }
    public void setFallbackModel(String fallbackModel) { this.fallbackModel = fallbackModel; }

    public String getPreviewFallbackModel() { return previewFallbackModel; }
    public void setPreviewFallbackModel(String previewFallbackModel) { this.previewFallbackModel = previewFallbackModel; }

    public boolean isMockEnabled() { return mockEnabled; }
    public void setMockEnabled(boolean mockEnabled) { this.mockEnabled = mockEnabled; }

    public int getTimeoutSeconds() { return timeoutSeconds; }
    public void setTimeoutSeconds(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
}
