package com.avfallskompassen.dto;

import com.avfallskompassen.model.Municipality;

/**
 * Data Transfer Object for Municipality entity.
 * Used to transfer municipality data to controllers without exposing the entity.
 * 
 * @author Christian Storck
 */
public class MunicipalityDTO {
    
    private Long id;
    private String name;
    
    /**
     * Default constructor for JPA/Jackson.
     */
    public MunicipalityDTO() {}
    
    /**
     * Constructor that creates a DTO from a Municipality entity.
     * 
     * @param municipality the Municipality entity to convert
     */
    public MunicipalityDTO(Municipality municipality) {
        this.id = municipality.getId();
        this.name = municipality.getName();
    }
    
    /**
     * Full constructor for creating DTOs directly.
     */
    public MunicipalityDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}
