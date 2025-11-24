package com.avfallskompassen.dto;

import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.model.ContainerType;

import java.math.BigDecimal;

/**
 * DTO for transferring Container data.
 */
public class ContainerDTO {

    private Long id;
    private String name;
    private int size;
    private double width;
    private double depth;
    private double height;
    private String imageFrontViewUrl;
    private String imageTopViewUrl;
    private int emptyingFrequencyPerYear;
    private BigDecimal cost;

    public ContainerDTO() {}

    public ContainerDTO(
            Long id,
            String name,
            int size,
            double width,
            double depth,
            double height,
            String imageFrontViewUrl,
            String imageTopViewUrl,
            int emptyingFrequencyPerYear,
            BigDecimal cost
    ) {
        this.id  = id;
        this.name = name;
        this.size = size;
        this.width = width;
        this.depth = depth;
        this.height = height;
        this.imageFrontViewUrl = imageFrontViewUrl;
        this.imageTopViewUrl = imageTopViewUrl;
        this.emptyingFrequencyPerYear = emptyingFrequencyPerYear;
        this.cost = cost;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getDepth() {
        return depth;
    }

    public void setDepth(double depth) {
        this.depth = depth;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public String getImageFrontViewUrl() {
        return imageFrontViewUrl;
    }

    public void setImageFrontViewUrl(String imageFrontViewUrl) {
        this.imageFrontViewUrl = imageFrontViewUrl;
    }

    public String getImageTopViewUrl() {
        return imageTopViewUrl;
    }

    public void setImageTopViewUrl(String imageTopViewUrl) {
        this.imageTopViewUrl = imageTopViewUrl;
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public static ContainerDTO fromEntity(ContainerPlan plan) {
        if (plan == null) {
            return null;
        }

        ContainerType type = plan.getContainerType();

        return new ContainerDTO(
                plan.getId(),
                type != null ? type.getName() : null,
                type != null ? type.getSize() : 0,
                type != null ? type.getWidth() : 0,
                type != null ? type.getDepth() : 0,
                type != null ? type.getHeight() : 0,
                type != null ? type.getImageFrontViewUrl() : null,
                plan.getImageTopViewUrl(), 
                plan.getEmptyingFrequencyPerYear(),
                plan.getCost()
        );
    }

}
