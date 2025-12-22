package com.avfallskompassen.services;

import java.math.BigDecimal;

import com.avfallskompassen.dto.AdminDataDTO;
import com.avfallskompassen.dto.CollectionFeeAdminDTO;
import com.avfallskompassen.dto.ContainerPlanAdminDTO;
import com.avfallskompassen.dto.LockTypeDto;

/**
 * Service interface for admin data management.
 */
public interface AdminDataService {
    AdminDataDTO getAllAdminData();
    LockTypeDto updateLockTypeCost(Long id, BigDecimal cost);
    ContainerPlanAdminDTO updateContainerPlanCost(Long id, BigDecimal cost);
    CollectionFeeAdminDTO updateCollectionFeeCost(Long id, BigDecimal cost);
}

