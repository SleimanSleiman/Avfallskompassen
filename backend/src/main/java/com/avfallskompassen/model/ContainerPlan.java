package com.avfallskompassen.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * Entity class for the container plans.
 * @Author Christian Storck
 */

@Entity
@Table(name = "container_plan")
public class ContainerPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipality_service_id", nullable = false)
    private MunicipalityService municipalityService;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_type_id", nullable = false)
    private ContainerType containerType;

    @Column(nullable = false)
    private int emptyingFrequencyPerYear;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(name = "image_top_view_url")
    private String imageTopViewUrl;

    @Column(name = "image_front_view_url")
    private String imageFrontViewUrl;

    public ContainerPlan(MunicipalityService municipalityService, ContainerType containerType, int emptyingFrequencyPerYear, BigDecimal cost, String imageTopViewUrl, String imageFrontViewUrl) {
        this.municipalityService = municipalityService;
        this.containerType = containerType;
        this.emptyingFrequencyPerYear = emptyingFrequencyPerYear;
        this.cost = cost;
        this.imageTopViewUrl = imageTopViewUrl;
        this.imageFrontViewUrl = imageFrontViewUrl;
    }

    public ContainerPlan() {

    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public MunicipalityService getMunicipalityService() {
        return municipalityService;
    }

    public void setMunicipalityService(MunicipalityService municipalityService) {
        this.municipalityService = municipalityService;
    }

    public ContainerType getContainerType() {
        return containerType;
    }

    public void setContainerType(ContainerType containerType) {
        this.containerType = containerType;
    }

    public int getEmptyingFrequencyPerYear() {
        return emptyingFrequencyPerYear;
    }

    public void setEmptyingFrequencyPerYear(int emptyingFrequencyPerYear) {
        this.emptyingFrequencyPerYear = emptyingFrequencyPerYear;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public String getImageTopViewUrl() {
        return imageTopViewUrl;
    }

    public void setImageTopViewUrl(String imageTopViewUrl) {
        this.imageTopViewUrl = imageTopViewUrl;
    }

    public String getImageFrontViewUrl() {
        return imageFrontViewUrl;
    }

    public void setImageFrontViewUrl(String imageFrontViewUrl) {
        this.imageFrontViewUrl = imageFrontViewUrl;
    }
}
