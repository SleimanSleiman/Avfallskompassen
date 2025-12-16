package com.avfallskompassen.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO containing all configurable data for admin management.
 */
public class AdminDataDTO {
    private List<LockTypeDto> lockTypes;
    private List<ContainerPlanAdminDTO> containerPlans;
    private List<CollectionFeeAdminDTO> collectionFees;

    public AdminDataDTO() {}

    public AdminDataDTO(List<LockTypeDto> lockTypes, List<ContainerPlanAdminDTO> containerPlans, List<CollectionFeeAdminDTO> collectionFees) {
        this.lockTypes = lockTypes;
        this.containerPlans = containerPlans;
        this.collectionFees = collectionFees;
    }

    public List<LockTypeDto> getLockTypes() {
        return lockTypes;
    }

    public void setLockTypes(List<LockTypeDto> lockTypes) {
        this.lockTypes = lockTypes;
    }

    public List<ContainerPlanAdminDTO> getContainerPlans() {
        return containerPlans;
    }

    public void setContainerPlans(List<ContainerPlanAdminDTO> containerPlans) {
        this.containerPlans = containerPlans;
    }

    public List<CollectionFeeAdminDTO> getCollectionFees() {
        return collectionFees;
    }

    public void setCollectionFees(List<CollectionFeeAdminDTO> collectionFees) {
        this.collectionFees = collectionFees;
    }
}

