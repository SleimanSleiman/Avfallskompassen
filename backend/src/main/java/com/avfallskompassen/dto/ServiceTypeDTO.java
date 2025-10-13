package com.avfallskompassen.dto;

/**
 * DTO for transferring ServiceType data.
 */
public class ServiceTypeDTO {
    private String name;

    public ServiceTypeDTO(String name) {
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
