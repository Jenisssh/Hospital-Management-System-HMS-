package com.hms.payment.security;

import com.hms.payment.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && parameter.getParameterType().equals(CurrentUserDetails.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {
        HttpServletRequest req = (HttpServletRequest) webRequest.getNativeRequest();
        String username = req.getHeader("X-Username");
        String roleHeader = req.getHeader("X-Role");
        String userIdHeader = req.getHeader("X-User-Id");
        String linkedIdHeader = req.getHeader("X-Linked-Id");

        if (username == null || roleHeader == null || userIdHeader == null) {
            throw new UnauthorizedException(
                    "Missing authentication headers — call must go through api-gateway");
        }

        Role role;
        try {
            role = Role.valueOf(roleHeader.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid X-Role header: " + roleHeader);
        }

        Long userId;
        try {
            userId = Long.parseLong(userIdHeader);
        } catch (NumberFormatException e) {
            throw new UnauthorizedException("Invalid X-User-Id header: " + userIdHeader);
        }

        Long linkedId = null;
        if (linkedIdHeader != null && !linkedIdHeader.isBlank()) {
            try {
                linkedId = Long.parseLong(linkedIdHeader);
            } catch (NumberFormatException ignored) {
            }
        }

        return new CurrentUserDetails(username, role, userId, linkedId);
    }
}
