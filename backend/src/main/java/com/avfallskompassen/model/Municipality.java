package com.avfallskompassen.model;

import jakarta.persistence.*;

/**
 * Entity class for the Municipality.
 * @Author Christian Storck
 */

@Entity
@Table(name = "Municipalities")
public class Municipality {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long Id;

    @Column //Lägg till att den inte ska vara nullable.
    private String name;

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
