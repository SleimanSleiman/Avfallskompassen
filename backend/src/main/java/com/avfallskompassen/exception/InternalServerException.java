package com.avfallskompassen.exception;

/**
 * Exception representing an internal server error (HTTP 500). Handled by {@link GlobalExceptionHandler}
 * @author Anton
 */
public class InternalServerException extends RuntimeException {
    public InternalServerException(String message) {
        super(message);
    }
}
