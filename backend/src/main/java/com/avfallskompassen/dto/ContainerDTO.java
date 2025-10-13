package com.avfallskompassen.dto;

import java.math.BigDecimal;

/**
 * DTO for transferring Container data.
 */
public class ContainerDTO {

    private String name;
    private int size;
    private double width;
    private double depth;
    private double height;
    private String imageFrontViewUrl;
    private String imageTopViewUrl;
    private int emptyingFrequencyPerYear;
    private BigDecimal cost;

    public ContainerDTO(
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
}
