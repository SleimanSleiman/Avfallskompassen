package com.avfallskompassen.exception;

/**
 * Exception representing that a resource was not found(HTTP 404). Handled by {@link GlobalExceptionHandler}
 * @author Anton
 */
public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
