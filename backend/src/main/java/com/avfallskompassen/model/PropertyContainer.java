package com.avfallskompassen.model;


import com.fasterxml.jackson.databind.annotation.JsonAppend;
import jakarta.persistence.*;

@Entity
@Table(name = "property_container")
public class PropertyContainer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "container_type_service_id", nullable = false)
    private ContainerPlan containerPlan;

    @Column(nullable = false)
    private int containerCount;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public int getContainerCount() {
        return containerCount;
    }

    public void setContainerCount(int containerCount) {
        this.containerCount = containerCount;
    }

    public ContainerPlan getContainerPlan() {
        return containerPlan;
    }

    public void setContainerPlan(ContainerPlan containerPlan) {
        this.containerPlan = containerPlan;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }
}
