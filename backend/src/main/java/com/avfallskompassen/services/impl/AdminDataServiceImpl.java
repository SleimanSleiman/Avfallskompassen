package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.AdminDataDTO;
import com.avfallskompassen.dto.CollectionFeeAdminDTO;
import com.avfallskompassen.dto.ContainerPlanAdminDTO;
import com.avfallskompassen.dto.LockTypeDto;
import com.avfallskompassen.model.ContainerPlan;
import com.avfallskompassen.repository.ContainerPlanRepository;
import com.avfallskompassen.services.AdminDataService;
import com.avfallskompassen.services.CollectionFeeService;
import com.avfallskompassen.services.LockTypeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for admin data management.
 */
@Service
@Transactional
public class AdminDataServiceImpl implements AdminDataService {

    private final LockTypeService lockTypeService;
    private final CollectionFeeService collectionFeeService;
    private final ContainerPlanRepository containerPlanRepository;

    public AdminDataServiceImpl(LockTypeService lockTypeService,
                                CollectionFeeService collectionFeeService,
                                ContainerPlanRepository containerPlanRepository) {
        this.lockTypeService = lockTypeService;
        this.collectionFeeService = collectionFeeService;
        this.containerPlanRepository = containerPlanRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDataDTO getAllAdminData() {
        List<LockTypeDto> lockTypes = lockTypeService.getAllLockTypes();
        List<CollectionFeeAdminDTO> collectionFees = collectionFeeService.getAllCollectionFees();
        
        List<ContainerPlanAdminDTO> containerPlans = containerPlanRepository.findAllWithRelations()
                .stream()
                .map(this::mapToContainerPlanAdminDTO)
                .collect(Collectors.toList());

        return new AdminDataDTO(lockTypes, containerPlans, collectionFees);
    }

    @Override
    public LockTypeDto updateLockTypeCost(Long id, BigDecimal cost) {
        return lockTypeService.updateLockTypeCost(id, cost);
    }

    @Override
    public ContainerPlanAdminDTO updateContainerPlanCost(Long id, BigDecimal cost) {
        ContainerPlan containerPlan = containerPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Container plan not found with ID: " + id));
        containerPlan.setCost(cost);
        containerPlan = containerPlanRepository.save(containerPlan);
        return mapToContainerPlanAdminDTO(containerPlan);
    }

    @Override
    public CollectionFeeAdminDTO updateCollectionFeeCost(Long id, BigDecimal cost) {
        collectionFeeService.updateCollectionFeeCost(id, cost);
        // Fetch updated fee to return with municipality name
        List<CollectionFeeAdminDTO> allFees = collectionFeeService.getAllCollectionFees();
        return allFees.stream()
                .filter(fee -> fee.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Collection fee not found with ID: " + id));
    }

    private ContainerPlanAdminDTO mapToContainerPlanAdminDTO(ContainerPlan plan) {
        String municipalityName = plan.getMunicipalityService() != null && 
                                  plan.getMunicipalityService().getMunicipality() != null
                ? plan.getMunicipalityService().getMunicipality().getName()
                : "Unknown";
        
        String serviceTypeName = plan.getMunicipalityService() != null && 
                               plan.getMunicipalityService().getServiceType() != null
                ? plan.getMunicipalityService().getServiceType().getName()
                : "Unknown";
        
        String containerTypeName = plan.getContainerType() != null
                ? plan.getContainerType().getName()
                : "Unknown";
        
        int containerSize = plan.getContainerType() != null
                ? plan.getContainerType().getSize()
                : 0;

        return new ContainerPlanAdminDTO(
                plan.getId(),
                municipalityName,
                serviceTypeName,
                containerTypeName,
                containerSize,
                plan.getEmptyingFrequencyPerYear(),
                plan.getCost()
        );
    }
}

