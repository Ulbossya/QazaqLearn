package kz.qazaqlearn.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kz.qazaqlearn.ai.dto.GeneratedQuestion;
import kz.qazaqlearn.ai.dto.GeneratedTestResponse;
import kz.qazaqlearn.ai.dto.GenerateTestRequest;
import kz.qazaqlearn.ai.dto.OptionDto;
import kz.qazaqlearn.ai.entity.AiResponseCacheEntity;
import kz.qazaqlearn.ai.entity.CourseEntity;
import kz.qazaqlearn.ai.entity.CourseMaterialEntity;
import kz.qazaqlearn.ai.error.AppException;
import kz.qazaqlearn.ai.llm.GeminiClient;
import kz.qazaqlearn.ai.llm.LlmResponse;
import kz.qazaqlearn.ai.repo.CourseMaterialRepository;
import kz.qazaqlearn.ai.repo.CourseRepository;
import kz.qazaqlearn.ai.safety.PromptHash;
import kz.qazaqlearn.ai.safety.PromptSafetyService;
import kz.qazaqlearn.ai.safety.PromptSafetyService.SafetyResult;
import kz.qazaqlearn.ai.safety.SystemPrompt;
import kz.qazaqlearn.ai.security.AuthUser;
import kz.qazaqlearn.ai.security.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TestGenService {

    private final CourseRepository courseRepo;
    private final CourseMaterialRepository materialRepo;
    private final AiResponseCacheService cacheService;
    private final RateLimitService rateLimitService;
    private final PromptSafetyService safetyService;
    private final GeminiClient geminiClient;
    private final AuditLogService auditLogService;
    private final ObjectMapper mapper = new ObjectMapper();

    public TestGenService(CourseRepository courseRepo,
                          CourseMaterialRepository materialRepo,
                          AiResponseCacheService cacheService,
                          RateLimitService rateLimitService,
                          PromptSafetyService safetyService,
                          GeminiClient geminiClient,
                          AuditLogService auditLogService) {
        this.courseRepo = courseRepo;
        this.materialRepo = materialRepo;
        this.cacheService = cacheService;
        this.rateLimitService = rateLimitService;
        this.safetyService = safetyService;
        this.geminiClient = geminiClient;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public GeneratedTestResponse generate(AuthUser user, GenerateTestRequest request) {
        if (user.role() != Role.TEACHER && user.role() != Role.ADMIN) {
            throw AppException.forbidden();
        }

        CourseEntity course = courseRepo.findById(request.courseId())
                .orElseThrow(AppException::courseNotFound);
        if (course.getDeletedAt() != null) throw AppException.courseNotFound();
        if (user.role() == Role.TEACHER && !course.getTeacherId().equals(user.id())) {
            throw AppException.forbidden();
        }
        rateLimitService.enforce(user.id(), user.role());

        CourseMaterialEntity material = null;
        if (request.materialId() != null) {
            material = materialRepo.findById(request.materialId())
                    .orElseThrow(AppException::materialNotFound);
            if (material.isDeleted() || !material.getCourseId().equals(course.getId())) {
                throw AppException.materialNotFound();
            }
        }

        String topic = request.topic() == null ? "" : request.topic();
        SafetyResult safety = safetyService.sanitize(topic);
        if (safety.blocked()) {
            auditLogService.log(user.id(), "AI_ERROR", "AiTestGen", course.getId(),
                    Map.of("reason", "AI_PROMPT_BLOCKED", "safetyReason", safety.reason()));
            throw AppException.promptBlocked();
        }

        String prompt = buildPrompt(course, material, request, safety.safeText());
        String hash = PromptHash.of("test-gen", request.language(),
                safety.safeText() + "|" + request.count() + "|" + request.safeQuestionType(),
                course.getId(), request.materialId());

        Optional<AiResponseCacheEntity> cached = cacheService.lookup(hash);
        if (cached.isPresent() && !"mock".equals(cached.get().getModel())) {
            AiResponseCacheEntity hit = cached.get();
            GeneratedTestResponse parsed = parseOrFallback(hit.getAnswer(), hit.getModel(), request);
            auditLogService.log(user.id(), "AI_CHAT", "AiTestGen", course.getId(),
                    Map.of("cached", true, "model", hit.getModel()));
            return new GeneratedTestResponse(parsed.titleRu(), parsed.titleKz(),
                    parsed.questions(), hit.getModel(), true);
        }

        LlmResponse llm = geminiClient.generate(prompt, true);
        GeneratedTestResponse parsed = parseOrFallback(llm.answer(), llm.model(), request);

        if (!"mock".equals(llm.model())) {
            try {
                String json = mapper.writeValueAsString(parsed);
                cacheService.save(hash, llm.model(), request.language(), json, cacheService.testGenTtl());
            } catch (Exception ignored) {
            }
        }

        auditLogService.log(user.id(), "AI_CHAT", "AiTestGen", course.getId(),
                Map.of("cached", false, "model", llm.model(), "count", request.count()));
        return parsed;
    }

    private String buildPrompt(CourseEntity course, CourseMaterialEntity material,
                               GenerateTestRequest request, String safeTopic) {
        StringBuilder sb = new StringBuilder();
        sb.append(SystemPrompt.TEST_GEN_FULL).append("\n\n");
        sb.append("Курс: ").append(safe(course.getTitleRu())).append(" / ").append(safe(course.getTitleKz())).append('\n');
        if (material != null) {
            sb.append("Материал: ").append(safe(material.getTitleRu())).append(" / ").append(safe(material.getTitleKz())).append('\n');
            sb.append("Содержимое материала:\n").append(safe(material.getContentRu())).append('\n');
            sb.append("Қазақша мазмұны:\n").append(safe(material.getContentKz())).append('\n');
        } else {
            sb.append("Материал не выбран. Используй описание курса.\n");
            sb.append("Описание: ").append(safe(course.getDescriptionRu())).append('\n');
            sb.append("Сипаттамасы: ").append(safe(course.getDescriptionKz())).append('\n');
        }
        sb.append("\nЯзык приоритетный для UI: ").append(request.language()).append('\n');
        sb.append("Количество вопросов: ").append(request.count()).append('\n');
        sb.append("Тип: ").append(request.safeQuestionType()).append('\n');
        if (!safeTopic.isBlank()) {
            sb.append("Дополнительные пожелания преподавателя (внутри <user_input>):\n")
                    .append(safetyService.wrap(safeTopic)).append('\n');
        }
        return sb.toString();
    }

    private String safe(String v) {
        return v == null ? "" : v;
    }

    private GeneratedTestResponse parseOrFallback(String rawAnswer, String model, GenerateTestRequest request) {
        if (rawAnswer == null || rawAnswer.isBlank()) {
            return mockTest(model, request);
        }
        String trimmed = rawAnswer.trim();
        if (trimmed.startsWith("```")) {
            int start = trimmed.indexOf('{');
            int end = trimmed.lastIndexOf('}');
            if (start >= 0 && end > start) {
                trimmed = trimmed.substring(start, end + 1);
            }
        }
        try {
            JsonNode root = mapper.readTree(trimmed);
            String titleRu = root.path("titleRu").asText("AI-сгенерированный тест");
            String titleKz = root.path("titleKz").asText("AI құрастырған тест");
            JsonNode qs = root.path("questions");
            List<GeneratedQuestion> questions = new ArrayList<>();
            if (qs.isArray()) {
                for (JsonNode q : qs) {
                    String type = q.path("type").asText("SINGLE").toUpperCase();
                    if (!"SINGLE".equals(type) && !"MULTIPLE".equals(type)) type = "SINGLE";
                    List<OptionDto> options = new ArrayList<>();
                    for (JsonNode o : q.path("options")) {
                        options.add(new OptionDto(
                                o.path("key").asText(""),
                                o.path("textRu").asText(""),
                                o.path("textKz").asText("")
                        ));
                    }
                    if (options.size() < 2) continue;
                    String correct = q.path("correctAnswer").asText("A").replaceAll("\\s+", "");
                    int points = q.path("points").asInt(1);
                    questions.add(new GeneratedQuestion(
                            q.path("questionTextRu").asText(""),
                            q.path("questionTextKz").asText(""),
                            type,
                            options,
                            correct,
                            Math.max(1, points)
                    ));
                }
            }
            if (questions.isEmpty()) {
                return mockTest(model, request);
            }
            return new GeneratedTestResponse(titleRu, titleKz, questions, model, false);
        } catch (Exception ex) {
            return mockTest(model, request);
        }
    }

    private GeneratedTestResponse mockTest(String model, GenerateTestRequest request) {
        List<GeneratedQuestion> questions = new ArrayList<>();
        int count = Math.max(1, Math.min(request.count(), 5));
        for (int i = 1; i <= count; i++) {
            questions.add(new GeneratedQuestion(
                    "Вопрос " + i + " по курсу (API-ключ не настроен)",
                    "Курс бойынша " + i + "-сұрақ (API кілті орнатылмаған)",
                    "SINGLE",
                    List.of(
                            new OptionDto("A", "Вариант A", "A нұсқасы"),
                            new OptionDto("B", "Вариант B", "B нұсқасы"),
                            new OptionDto("C", "Вариант C", "C нұсқасы")
                    ),
                    "A",
                    1
            ));
        }
        return new GeneratedTestResponse(
                "Тест (требуется настройка AI)",
                "Тест (AI баптауы қажет)",
                questions, model, false);
    }
}
