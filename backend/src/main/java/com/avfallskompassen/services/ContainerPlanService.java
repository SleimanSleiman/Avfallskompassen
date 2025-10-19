package com.avfallskompassen.services;

import com.avfallskompassen.model.CollectionFee;
import com.avfallskompassen.repository.ContainerPlanRepository;
import com.avfallskompassen.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContainerPlanService {

    @Autowired
    private ContainerPlanRepository containerPlanRepository;
}
