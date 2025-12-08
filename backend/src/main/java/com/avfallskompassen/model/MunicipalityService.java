package com.avfallskompassen.model;

import jakarta.persistence.*;

/**
 * Entity class for the different municipality services.
 * @Author Christian Storck
 */

@Entity
@Table(name = "Municipality_Service")
public class MunicipalityService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JoinColumn(name = "municipality_id")
    @ManyToOne
    private Municipality municipality;

    @JoinColumn(name = "service_type_id")
    @ManyToOne
    private ServiceType serviceType;

    public MunicipalityService(Municipality municipality, ServiceType serviceType) {
        this.municipality = municipality;
        this.serviceType = serviceType;
    }

    public MunicipalityService() {

    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Municipality getMunicipality() {
        return municipality;
    }

    public void setMunicipality(Municipality municipality) {
        this.municipality = municipality;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }
}
