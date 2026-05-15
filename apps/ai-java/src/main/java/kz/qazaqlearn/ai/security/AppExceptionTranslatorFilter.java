package kz.qazaqlearn.ai.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kz.qazaqlearn.ai.error.AppException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class AppExceptionTranslatorFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {
        try {
            chain.doFilter(request, response);
        } catch (AppException ex) {
            write(response, ex);
        } catch (ServletException se) {
            Throwable cause = se.getCause();
            while (cause != null) {
                if (cause instanceof AppException ae) {
                    write(response, ae);
                    return;
                }
                cause = cause.getCause();
            }
            throw se;
        }
    }

    private void write(HttpServletResponse response, AppException ex) throws IOException {
        if (response.isCommitted()) return;
        response.setStatus(ex.getStatusCode());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("code", ex.getCode());
        error.put("message", ex.getMessageRu());
        error.put("messageRu", ex.getMessageRu());
        error.put("messageKz", ex.getMessageKz());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("statusCode", ex.getStatusCode());
        body.put("error", error);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
