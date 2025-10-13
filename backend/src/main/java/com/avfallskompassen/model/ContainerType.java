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
    @Column(nullable = true)
    private double width;

    @Column(nullable = true)
    private double depth;

    @Column(nullable = true)
    private double height;

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
}
