package kz.qazaqlearn.ai.error;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> onAppException(AppException ex, HttpServletRequest req) {
        log.debug("AppException {} on {}: {}", ex.getCode(), req.getRequestURI(), ex.getMessageRu());
        return ResponseEntity.status(ex.getStatusCode()).body(buildBody(ex.getStatusCode(),
                ex.getCode(), ex.getMessageRu(), ex.getMessageKz()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> onValidation(MethodArgumentNotValidException ex) {
        StringBuilder reason = new StringBuilder();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            if (reason.length() > 0) reason.append("; ");
            reason.append(fe.getField()).append(' ').append(fe.getDefaultMessage());
        }
        AppException wrapped = AppException.validation(reason.toString());
        return ResponseEntity.status(wrapped.getStatusCode())
                .body(buildBody(wrapped.getStatusCode(), wrapped.getCode(),
                        wrapped.getMessageRu(), wrapped.getMessageKz()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> onAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        AppException wrapped = AppException.forbidden();
        return ResponseEntity.status(wrapped.getStatusCode())
                .body(buildBody(wrapped.getStatusCode(), wrapped.getCode(),
                        wrapped.getMessageRu(), wrapped.getMessageKz()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> onAuth(AuthenticationException ex, HttpServletRequest req) {
        AppException wrapped = AppException.unauthorized();
        return ResponseEntity.status(wrapped.getStatusCode())
                .body(buildBody(wrapped.getStatusCode(), wrapped.getCode(),
                        wrapped.getMessageRu(), wrapped.getMessageKz()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> onAny(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception on {}", req.getRequestURI(), ex);
        return ResponseEntity.status(500).body(buildBody(500, "INTERNAL_ERROR",
                "Внутренняя ошибка сервиса", "Сервистің ішкі қатесі"));
    }

    private Map<String, Object> buildBody(int statusCode, String code, String ru, String kz) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("code", code);
        error.put("message", ru);
        error.put("messageRu", ru);
        error.put("messageKz", kz);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("statusCode", statusCode);
        body.put("error", error);
        return body;
    }
}
