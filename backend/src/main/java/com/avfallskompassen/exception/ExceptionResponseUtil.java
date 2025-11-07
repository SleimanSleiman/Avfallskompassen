package com.avfallskompassen.exception;

import com.avfallskompassen.dto.response.PropertyResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * Utility helpers to build consistent error ResponseEntity payloads.
 * Other components can reuse these methods to return uniform error responses.
 */
public final class ExceptionResponseUtil {

    private ExceptionResponseUtil() {
        // utility class
    }

    public static ResponseEntity<Map<String, String>> notFound(String message) {
        return of(HttpStatus.NOT_FOUND, message);
    }

    public static ResponseEntity<Map<String, String>> badRequest(String message) {
        return of(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseEntity<Map<String, String>> internalServerError() {
        // Keep the original generic message for internal server errors
        return of(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong in the server");
    }

    public static ResponseEntity<Map<String, String>> of(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }

    // Helpers for PropertyResponse DTO to keep controller responses consistent
    public static org.springframework.http.ResponseEntity<PropertyResponse> propertyResponse(
            HttpStatus status, boolean success, String message) {
        PropertyResponse resp = new PropertyResponse(success, message);
        return org.springframework.http.ResponseEntity.status(status).body(resp);
    }

    public static org.springframework.http.ResponseEntity<PropertyResponse> propertyBadRequest(String message) {
        return propertyResponse(HttpStatus.BAD_REQUEST, false, message);
    }

    public static org.springframework.http.ResponseEntity<PropertyResponse> propertyUnauthorized(String message) {
        return propertyResponse(HttpStatus.UNAUTHORIZED, false, message);
    }

    public static org.springframework.http.ResponseEntity<PropertyResponse> propertyForbidden(String message) {
        return propertyResponse(HttpStatus.FORBIDDEN, false, message);
    }

    public static org.springframework.http.ResponseEntity<PropertyResponse> propertyResponse(
            org.springframework.http.HttpStatusCode status, boolean success, String message) {
        return propertyResponse(org.springframework.http.HttpStatus.valueOf(status.value()), success, message);
    }

    public static org.springframework.http.ResponseEntity<PropertyResponse> propertyResponse(
            org.springframework.http.HttpStatusCode status, PropertyResponse body) {
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.valueOf(status.value())).body(body);
    }
}
