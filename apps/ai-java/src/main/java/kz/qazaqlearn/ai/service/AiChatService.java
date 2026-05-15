package kz.qazaqlearn.ai.service;

import kz.qazaqlearn.ai.dto.AiChatRequest;
import kz.qazaqlearn.ai.dto.AiChatResponse;
import kz.qazaqlearn.ai.entity.AiRequestHistoryEntity;
import kz.qazaqlearn.ai.entity.AiResponseCacheEntity;
import kz.qazaqlearn.ai.entity.CourseEntity;
import kz.qazaqlearn.ai.entity.CourseMaterialEntity;
import kz.qazaqlearn.ai.error.AppException;
import kz.qazaqlearn.ai.llm.GeminiClient;
import kz.qazaqlearn.ai.llm.LlmResponse;
import kz.qazaqlearn.ai.repo.AiRequestHistoryRepository;
import kz.qazaqlearn.ai.repo.CourseMaterialRepository;
import kz.qazaqlearn.ai.repo.CourseRepository;
import kz.qazaqlearn.ai.repo.EnrollmentRepository;
import kz.qazaqlearn.ai.safety.PromptHash;
import kz.qazaqlearn.ai.safety.PromptSafetyService;
import kz.qazaqlearn.ai.safety.PromptSafetyService.SafetyResult;
import kz.qazaqlearn.ai.safety.SystemPrompt;
import kz.qazaqlearn.ai.security.AuthUser;
import kz.qazaqlearn.ai.security.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AiChatService {

    private final CourseRepository courseRepo;
    private final CourseMaterialRepository materialRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final AiRequestHistoryRepository historyRepo;
    private final AiResponseCacheService cacheService;
    private final RateLimitService rateLimitService;
    private final PromptSafetyService safetyService;
    private final GeminiClient geminiClient;
    private final AuditLogService auditLogService;

    public AiChatService(CourseRepository courseRepo,
                         CourseMaterialRepository materialRepo,
                         EnrollmentRepository enrollmentRepo,
                         AiRequestHistoryRepository historyRepo,
                         AiResponseCacheService cacheService,
                         RateLimitService rateLimitService,
                         PromptSafetyService safetyService,
                         GeminiClient geminiClient,
                         AuditLogService auditLogService) {
        this.courseRepo = courseRepo;
        this.materialRepo = materialRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.historyRepo = historyRepo;
        this.cacheService = cacheService;
        this.rateLimitService = rateLimitService;
        this.safetyService = safetyService;
        this.geminiClient = geminiClient;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AiChatResponse chat(AuthUser user, AiChatRequest request) {
        return chatInternal(user, request, request.message(), "chat", false);
    }

    @Transactional
    public AiChatResponse summarize(AuthUser user, AiChatRequest request) {
        String instruction = "kz".equalsIgnoreCase(request.language())
                ? "Берілген материалдың негізгі тезистерін қысқаша жинақта.\n\n"
                : "Выдели ключевые тезисы из предоставленного материала.\n\n";
        return chatInternal(user, request, instruction + request.message(), "summarize", false);
    }

    @Transactional
    public AiChatResponse generateQuestions(AuthUser user, AiChatRequest request) {
        String instruction = "kz".equalsIgnoreCase(request.language())
                ? "Осы материал бойынша өзін-өзі тексеруге арналған сұрақтар жаса.\n\n"
                : "Составь вопросы для самопроверки по данному материалу.\n\n";
        return chatInternal(user, request, instruction + request.message(), "questions", false);
    }

    @Transactional
    public AiChatResponse translate(AuthUser user, AiChatRequest request) {
        String targetLang = "kz".equalsIgnoreCase(request.language()) ? "қазақ тіліне" : "на русский язык";
        String instruction = "kz".equalsIgnoreCase(request.language())
                ? "Материалды " + targetLang + " аудар.\n\n"
                : "Переведи материал " + targetLang + ".\n\n";
        return chatInternal(user, request, instruction + request.message(), "translate", false);
    }

    private AiChatResponse chatInternal(AuthUser user, AiChatRequest request,
                                        String effectiveMessage, String mode, boolean jsonMode) {
        CourseEntity course = courseRepo.findById(request.courseId())
                .orElseThrow(AppException::courseNotFound);
        if (course.getDeletedAt() != null) throw AppException.courseNotFound();
        assertAiAccess(user, course);
        rateLimitService.enforce(user.id(), user.role());

        CourseMaterialEntity material = null;
        if (request.materialId() != null) {
            material = materialRepo.findById(request.materialId())
                    .orElseThrow(AppException::materialNotFound);
            if (material.isDeleted() || !material.getCourseId().equals(course.getId())) {
                throw AppException.materialNotFound();
            }
        }

        SafetyResult safety = safetyService.sanitize(effectiveMessage);
        if (safety.blocked()) {
            auditLogService.log(user.id(), "AI_ERROR", "AiChat", course.getId(),
                    Map.of("reason", "AI_PROMPT_BLOCKED", "safetyReason", safety.reason(), "mode", mode));
            persistHistory(user.id(), course.getId(),
                    request.materialId(), effectiveMessage,
                    cannedSafeReply(request.language()),
                    "safety", request.language(), "BLOCKED");
            return new AiChatResponse(
                    cannedSafeReply(request.language()),
                    "safety",
                    request.language(),
                    java.time.Instant.now(),
                    false);
        }

        String wrappedUserInput = safetyService.wrap(safety.safeText());
        String context = buildContext(user, request, course, material);
        String fullPrompt = SystemPrompt.FULL
                + "\n\nКонтекст:\n" + context
                + "\n\nВопрос пользователя:\n" + wrappedUserInput;

        String hash = PromptHash.of(modelForCache(), request.language(),
                safety.safeText(), course.getId(), request.materialId());

        Optional<AiResponseCacheEntity> cached = cacheService.lookup(hash);
        if (cached.isPresent() && !"mock".equals(cached.get().getModel())) {
            AiResponseCacheEntity hit = cached.get();
            persistHistory(user.id(), course.getId(), request.materialId(),
                    effectiveMessage, hit.getAnswer(), hit.getModel(),
                    request.language(), "CACHED");
            auditLogService.log(user.id(), "AI_CHAT", "Course", course.getId(),
                    Map.of("cached", true, "model", hit.getModel(), "mode", mode));
            return new AiChatResponse(hit.getAnswer(), hit.getModel(),
                    request.language(), java.time.Instant.now(), true);
        }

        LlmResponse llm = geminiClient.generate(fullPrompt, jsonMode);
        
        if (!"mock".equals(llm.model())) {
            cacheService.save(hash, llm.model(), request.language(), llm.answer(),
                    cacheService.chatTtl());
        }
        
        persistHistory(user.id(), course.getId(), request.materialId(),
                effectiveMessage, llm.answer(), llm.model(),
                request.language(),
                "mock".equals(llm.model()) ? "MOCK" : "SUCCESS");
        auditLogService.log(user.id(), "AI_CHAT", "Course", course.getId(),
                Map.of("cached", false, "model", llm.model(), "mode", mode));

        return new AiChatResponse(llm.answer(), llm.model(),
                request.language(), java.time.Instant.now(), false);
    }

    private String modelForCache() {
        return "auto";
    }

    private String buildContext(AuthUser user, AiChatRequest request, CourseEntity course,
                                CourseMaterialEntity material) {
        List<String> lines = new java.util.ArrayList<>();
        lines.add("role: " + user.role());
        lines.add("language: " + request.language());
        lines.add("course title: " + nz(course.getTitleRu(), course.getTitleKz()));
        lines.add("course description: " + nz(course.getDescriptionRu(), course.getDescriptionKz()));
        if (material != null) {
            lines.add("material title: " + nz(material.getTitleRu(), material.getTitleKz()));
            lines.add("material content: " + nz(material.getContentRu(), material.getContentKz()));
        }
        List<AiRequestHistoryEntity> last = historyRepo
                .findTop5ByUserIdAndCourseIdOrderByCreatedAtDesc(user.id(), course.getId());
        for (int i = last.size() - 1; i >= 0; i--) {
            AiRequestHistoryEntity h = last.get(i);
            lines.add("user: " + h.getMessage());
            lines.add("assistant: " + h.getAnswer());
        }
        return String.join("\n", lines);
    }

    private String nz(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return "";
    }

    private String cannedSafeReply(String language) {
        if ("kz".equalsIgnoreCase(language)) {
            return "Сұрауыңыз қауіпсіздік сүзгісінен өтпеді. Курс материалдары туралы сұрау тұжырымдаңыз.";
        }
        return "Запрос отклонён системой безопасности. Пожалуйста, переформулируйте вопрос по материалам курса.";
    }

    private void persistHistory(UUID userId, UUID courseId, UUID materialId,
                                String message, String answer,
                                String model, String language, String status) {
        AiRequestHistoryEntity entity = new AiRequestHistoryEntity();
        entity.setUserId(userId);
        entity.setCourseId(courseId);
        entity.setMaterialId(materialId);
        entity.setMessage(truncate(message, 4000));
        entity.setAnswer(truncate(answer, 16000));
        entity.setModel(model == null ? "unknown" : model);
        entity.setLanguage(language);
        entity.setStatus(status);
        historyRepo.save(entity);
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() > max ? text.substring(0, max) : text;
    }

    private void assertAiAccess(AuthUser user, CourseEntity course) {
        if (user.role() == Role.ADMIN) return;
        if (user.role() == Role.TEACHER && course.getTeacherId().equals(user.id())) return;
        if (user.role() == Role.STUDENT) {
            if (!"PUBLISHED".equals(course.getStatus())) throw AppException.forbidden();
            if (enrollmentRepo.findFirstByCourseIdAndStudentId(course.getId(), user.id()).isEmpty()) {
                throw AppException.notEnrolled();
            }
            return;
        }
        throw AppException.forbidden();
    }
}
