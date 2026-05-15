package kz.qazaqlearn.ai.safety;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PromptHashTest {

    @Test
    void normalizationCollapsesWhitespaceAndCase() {
        assertThat(PromptHash.normalize("  Hello   World  ")).isEqualTo("hello world");
    }

    @Test
    void sameInputsProduceSameHash() {
        UUID course = UUID.randomUUID();
        String a = PromptHash.of("m", "ru", "Привет мир", course, null);
        String b = PromptHash.of("m", "ru", "  привет   МИР ", course, null);
        assertThat(a).isEqualTo(b);
    }

    @Test
    void differentMaterialChangesHash() {
        UUID course = UUID.randomUUID();
        UUID m1 = UUID.randomUUID();
        UUID m2 = UUID.randomUUID();
        String a = PromptHash.of("m", "ru", "q", course, m1);
        String b = PromptHash.of("m", "ru", "q", course, m2);
        assertThat(a).isNotEqualTo(b);
    }
}
