package com.avfallskompassen.exception;

/**
 * Exception representing a bad request or invalid argument (HTTP 400). Handled by {@link GlobalExceptionHandler}
 * @author Anton
 */
public class BadRequestException extends IllegalArgumentException {
    public BadRequestException(String message) {
        super(message);
    }
}
