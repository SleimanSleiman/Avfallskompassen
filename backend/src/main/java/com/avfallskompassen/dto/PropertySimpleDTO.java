package com.avfallskompassen.dto;

import com.avfallskompassen.model.Property;

public class PropertySimpleDTO {

    private Long id;
    private String address;
    private Integer numberOfApartments;

    public PropertySimpleDTO() {
    }

    public PropertySimpleDTO(Long id, String address, Integer numberOfApartments) {
        this.id = id;
        this.address = address;
        this.numberOfApartments = numberOfApartments;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getNumberOfApartments() {
        return numberOfApartments;
    }

    public void setNumberOfApartments(Integer numberOfApartments) {
        this.numberOfApartments = numberOfApartments;
    }
}
