package kz.qazaqlearn.ai.controller;

import jakarta.validation.Valid;
import kz.qazaqlearn.ai.dto.AiChatRequest;
import kz.qazaqlearn.ai.dto.AiChatResponse;
import kz.qazaqlearn.ai.dto.GenerateTestRequest;
import kz.qazaqlearn.ai.dto.GeneratedTestResponse;
import kz.qazaqlearn.ai.dto.HistoryItem;
import kz.qazaqlearn.ai.dto.PageResponse;
import kz.qazaqlearn.ai.security.AuthUser;
import kz.qazaqlearn.ai.service.AiChatService;
import kz.qazaqlearn.ai.service.HistoryService;
import kz.qazaqlearn.ai.service.TestGenService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiChatService chatService;
    private final TestGenService testGenService;
    private final HistoryService historyService;

    public AiController(AiChatService chatService,
                        TestGenService testGenService,
                        HistoryService historyService) {
        this.chatService = chatService;
        this.testGenService = testGenService;
        this.historyService = historyService;
    }

    @PostMapping("/chat")
    public AiChatResponse chat(AuthUser user, @Valid @RequestBody AiChatRequest request) {
        return chatService.chat(user, request);
    }

    @PostMapping("/summarize-material")
    public AiChatResponse summarize(AuthUser user, @Valid @RequestBody AiChatRequest request) {
        return chatService.summarize(user, request);
    }

    @PostMapping("/generate-questions")
    public AiChatResponse generateQuestions(AuthUser user, @Valid @RequestBody AiChatRequest request) {
        return chatService.generateQuestions(user, request);
    }

    @PostMapping("/translate")
    public AiChatResponse translate(AuthUser user, @Valid @RequestBody AiChatRequest request) {
        return chatService.translate(user, request);
    }

    @PostMapping("/teacher/generate-test")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public GeneratedTestResponse teacherGenerateTest(AuthUser user,
                                                     @Valid @RequestBody GenerateTestRequest request) {
        return testGenService.generate(user, request);
    }

    @GetMapping("/history")
    public PageResponse<HistoryItem> history(AuthUser user,
                                             @RequestParam(defaultValue = "1") int page,
                                             @RequestParam(defaultValue = "20") int limit) {
        return historyService.list(user, page, limit);
    }
}
