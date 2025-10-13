package com.avfallskompassen.model;

import jakarta.persistence.*;

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

    //TODO: make nullable = false when completing container type data
    //TODO: change Double to double after that
    @Column(nullable = true)
    private Double width;

    @Column(nullable = true)
    private Double depth;

    @Column(nullable = true)
    private Double height;

    @Column(nullable = true)
    private String imageFrontViewUrl;

    @Column(nullable = true)
    private String imageTopViewUrl;

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
