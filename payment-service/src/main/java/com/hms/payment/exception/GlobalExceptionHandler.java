package com.hms.payment.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe ->
                fields.put(fe.getField(), fe.getDefaultMessage()));
        return ResponseEntity.badRequest().body(ApiError.builder()
                .status(400).error("VALIDATION_FAILED")
                .message("One or more fields are invalid")
                .fields(fields).path(req.getRequestURI()).build());
    }

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(PaymentNotFoundException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError.builder()
                .status(404).error("PAYMENT_NOT_FOUND")
                .message(ex.getMessage()).path(req.getRequestURI()).build());
    }

    @ExceptionHandler(AlreadyPaidException.class)
    public ResponseEntity<ApiError> handleAlreadyPaid(AlreadyPaidException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiError.builder()
                .status(409).error("ALREADY_PAID")
                .message(ex.getMessage()).path(req.getRequestURI()).build());
    }

    @ExceptionHandler(RefundNotAllowedException.class)
    public ResponseEntity<ApiError> handleRefund(RefundNotAllowedException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiError.builder()
                .status(409).error("REFUND_NOT_ALLOWED")
                .message(ex.getMessage()).path(req.getRequestURI()).build());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorized(UnauthorizedException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.builder()
                .status(401).error("UNAUTHORIZED")
                .message(ex.getMessage()).path(req.getRequestURI()).build());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiError> handleForbidden(ForbiddenException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.builder()
                .status(403).error("FORBIDDEN")
                .message(ex.getMessage()).path(req.getRequestURI()).build());
    }

    @ExceptionHandler(DownstreamServiceException.class)
    public ResponseEntity<ApiError> handleDownstream(DownstreamServiceException ex, HttpServletRequest req) {
        log.error("Downstream call failed: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(ApiError.builder()
                .status(503).error("DOWNSTREAM_UNAVAILABLE")
                .message(ex.getMessage()).path(req.getRequestURI()).build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleAll(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiError.builder()
                .status(500).error("INTERNAL_ERROR")
                .message(ex.getMessage()).path(req.getRequestURI()).build());
    }
}
