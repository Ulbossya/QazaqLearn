package kz.qazaqlearn.ai.safety;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

public final class PromptHash {

    private PromptHash() {
    }

    public static String of(String model, String language, String normalizedMessage,
                            UUID courseId, UUID materialId) {
        String mat = materialId == null ? "" : materialId.toString();
        String input = model + "|" + language + "|"
                + courseId + "|" + mat + "|" + normalize(normalizedMessage);
        return sha256(input);
    }

    public static String normalize(String text) {
        if (text == null) return "";
        return text.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }
}
