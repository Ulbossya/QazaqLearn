package kz.qazaqlearn.ai.safety;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PromptSafetyService {

    public static final int MAX_LENGTH = 4000;
    public static final double MAX_NON_PRINTABLE_RATIO = 0.05;
    public static final int BLOCK_THRESHOLD = 3;
    public static final String REDACTED = "[REDACTED]";

    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("(?i)ignore (all |the )?(previous|above|prior) (instructions|prompt)"),
            Pattern.compile("(?i)disregard (the )?(system|previous)"),
            Pattern.compile("(?i)\\byou are now\\b"),
            Pattern.compile("(?i)\\bact as\\b"),
            Pattern.compile("(?i)\\bjailbreak\\b"),
            Pattern.compile("(?i)\\bdeveloper mode\\b"),
            Pattern.compile("(?im)^\\s*(system|assistant|user)\\s*:"),
            Pattern.compile("(?i)</?\\s*(system|assistant)\\s*>"),
            Pattern.compile("(?i)reveal (the )?system prompt"),
            Pattern.compile("(?i)print (the )?system prompt"),
            Pattern.compile("(?i)show (me )?(the )?(system|hidden) (prompt|instructions)"),
            Pattern.compile("(?i)игнорируй (все |всю )?(предыдущ\\w+|прошл\\w+) (инструкци\\w+|указани\\w+|подсказк\\w+)"),
            Pattern.compile("(?i)забудь (про )?(прошл\\w+|предыдущ\\w+)"),
            Pattern.compile("(?i)покажи\\s+(скрыт\\w+|системн\\w+)\\s+промпт"),
            Pattern.compile("(?i)раскрой (скрыт\\w+|системн\\w+) (промпт|инструкци\\w+)")
    );

    public SafetyResult sanitize(String raw) {
        if (raw == null) {
            return new SafetyResult("", true, "EMPTY");
        }
        String text = raw;
        if (text.length() > MAX_LENGTH) {
            return new SafetyResult(text.substring(0, MAX_LENGTH), true, "LENGTH_EXCEEDED");
        }
        int nonPrintable = countNonPrintable(text);
        if (text.length() > 0 && ((double) nonPrintable / text.length()) > MAX_NON_PRINTABLE_RATIO) {
            return new SafetyResult(text, true, "NON_PRINTABLE");
        }

        int hits = 0;
        String sanitized = text;
        for (Pattern p : INJECTION_PATTERNS) {
            Matcher m = p.matcher(sanitized);
            int patternHits = 0;
            while (m.find()) {
                patternHits++;
            }
            if (patternHits > 0) {
                hits += patternHits;
                sanitized = m.replaceAll(REDACTED);
            }
        }

        if (hits >= BLOCK_THRESHOLD) {
            return new SafetyResult(sanitized, true, "INJECTION_BLOCKED");
        }
        return new SafetyResult(sanitized, false, hits > 0 ? "REDACTED" : "OK");
    }

    public String wrap(String safeText) {
        return "<user_input>\n" + safeText + "\n</user_input>";
    }

    private int countNonPrintable(String text) {
        int count = 0;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '\n' || c == '\r' || c == '\t') continue;
            int type = Character.getType(c);
            if (type == Character.CONTROL || type == Character.FORMAT
                    || type == Character.PRIVATE_USE || type == Character.SURROGATE) {
                count++;
            }
        }
        return count;
    }

    public record SafetyResult(String safeText, boolean blocked, String reason) {
    }
}
