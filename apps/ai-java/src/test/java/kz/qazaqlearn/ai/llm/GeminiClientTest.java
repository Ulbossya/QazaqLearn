package kz.qazaqlearn.ai.llm;

import com.sun.net.httpserver.HttpServer;
import kz.qazaqlearn.ai.error.AppException;
import org.junit.jupiter.api.Test;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GeminiClientTest {

    @Test
    void sendsApiKeyInHeaderForGeminiRequests() throws Exception {
        AtomicReference<String> apiKeyHeader = new AtomicReference<>();
        AtomicReference<String> requestQuery = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v1beta/models/gemini-test:generateContent", exchange -> {
            apiKeyHeader.set(exchange.getRequestHeaders().getFirst("x-goog-api-key"));
            requestQuery.set(exchange.getRequestURI().getQuery());
            byte[] body = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"hello\"}]}}]}"
                    .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream output = exchange.getResponseBody()) {
                output.write(body);
            }
        });
        server.start();

        try {
            GeminiClient client = new GeminiClient(props(server, "secret", false));

            LlmResponse response = client.generate("hello");

            assertThat(apiKeyHeader.get()).isEqualTo("secret");
            assertThat(requestQuery.get()).isNull();
            assertThat(response.answer()).isEqualTo("hello");
            assertThat(response.model()).isEqualTo("gemini-test");
        } finally {
            server.stop(0);
        }
    }

    @Test
    void usesMockOnlyWhenKeyIsMissing() {
        GeminiProperties props = new GeminiProperties();
        props.setApiKey("");
        props.setMockEnabled(true);
        props.setModel("gemini-test");
        props.setFallbackModel("");
        props.setPreviewFallbackModel("");

        LlmResponse response = new GeminiClient(props).generate("hello");

        assertThat(response.model()).isEqualTo("mock");
    }

    @Test
    void doesNotMaskProviderFailureAsMissingKeyWhenKeyExists() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v1beta/models/gemini-test:generateContent", exchange -> {
            byte[] body = "{\"error\":{\"code\":403,\"message\":\"permission denied\",\"status\":\"PERMISSION_DENIED\"}}"
                    .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(403, body.length);
            try (OutputStream output = exchange.getResponseBody()) {
                output.write(body);
            }
        });
        server.start();

        try {
            GeminiClient client = new GeminiClient(props(server, "secret", true));

            assertThatThrownBy(() -> client.generate("hello"))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> assertThat(((AppException) ex).getCode())
                            .isEqualTo("AI_PROVIDER_UNAVAILABLE"));
        } finally {
            server.stop(0);
        }
    }

    private GeminiProperties props(HttpServer server, String apiKey, boolean mockEnabled) {
        GeminiProperties props = new GeminiProperties();
        props.setApiKey(apiKey);
        props.setMockEnabled(mockEnabled);
        props.setBaseUrl("http://localhost:" + server.getAddress().getPort());
        props.setModel("gemini-test");
        props.setFallbackModel("");
        props.setPreviewFallbackModel("");
        return props;
    }
}
