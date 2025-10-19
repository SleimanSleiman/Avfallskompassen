package com.avfallskompassen.dto;

/**
 * DTO for transferring ServiceType data.
 */
public class ServiceTypeDTO {
    private String name;
    private Long id;

    public ServiceTypeDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
