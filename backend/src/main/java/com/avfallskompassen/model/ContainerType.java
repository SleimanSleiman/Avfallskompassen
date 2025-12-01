package com.avfallskompassen.model;

import jakarta.persistence.*;

/**
 * Entity class for the ContainerTypes.
 * @Author Christian Storck
 */

@Entity
@Table(name = "container_type")
public class ContainerType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int size;

    @Column(nullable = false)
    private double width;

    @Column(nullable = false)
    private double depth;

    @Column(nullable = false)
    private double height;

    //TODO: make nullable = false when completing container type data
    @Column(nullable = true)
    private String imageFrontViewUrl;

    //TODO: make nullable = false when completing container type data
    @Column(nullable = true)
    private String imageTopViewUrl;

    public ContainerType(String name, int size, double width, double depth, double height, String imageFrontViewUrl, String imageTopViewUrl) {
        this.name = name;
        this.size = size;
        this.width = width;
        this.depth = depth;
        this.height = height;
        this.imageFrontViewUrl = imageFrontViewUrl;
        this.imageTopViewUrl = imageTopViewUrl;
    }

    public ContainerType() {

    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}
