package com.avfallskompassen.model;

import jakarta.persistence.*;

/**
 * Entity representing a type of service (e.g., general waste, paper etc.).
 */
@Entity
@Table(name = "Service_Type")
public class ServiceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long Id;

    @Column(nullable = false)
    private String name;

    public ServiceType(String name) {
        this.name = name;
    }

    public ServiceType() {

    }

    public long getId() {
        return Id;
    }

    public void setId(long id) {
        Id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
