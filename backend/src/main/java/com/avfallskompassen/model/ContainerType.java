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

    @Column(nullable = false)
    private double width;

    @Column(nullable = false)
    private double depth;

    @Column(nullable = false)
    private double height;

    @Column(nullable = false)
    private String imageFrontViewUrl;

    @Column(nullable = false)
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
}
