package com.avfallskompassen.model;

import com.fasterxml.jackson.databind.annotation.JsonAppend;
import jakarta.persistence.*;
import org.hibernate.type.descriptor.jdbc.TinyIntJdbcType;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "waste_statistics", uniqueConstraints = @UniqueConstraint(columnNames = {"property_id", "year", "month"}))
public class WasteStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal wasteByLiters;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public BigDecimal getWasteLiters() {
        return wasteByLiters;
    }

    public void setWasteLiters(BigDecimal waste_liters) {
        this.wasteByLiters = waste_liters;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    @Transient
    public LocalDate getMonthDate() {
        return LocalDate.of(year, month, 1);
    }
}
