package com.avfallskompassen.services;

import com.avfallskompassen.model.ServiceType;
import com.avfallskompassen.repository.ServiceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiceTypeService {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    public List<ServiceType> getAllServiceTypes() {
        return serviceTypeRepository.findAll();
    }
}
