package com.avfallskompassen.dto.response;

/**
 * Simple DTO wrapper for returning a single error message to API consumers.
 */
public class ErrorResponse {

    private final String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
