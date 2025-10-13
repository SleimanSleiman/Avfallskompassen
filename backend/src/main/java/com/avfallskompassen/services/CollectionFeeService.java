package com.avfallskompassen.services;

import com.avfallskompassen.model.CollectionFee;
import com.avfallskompassen.repository.CollectionFeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CollectionFeeService {

    @Autowired
    private CollectionFeeRepository collectionFeeRepository;

    public BigDecimal findCollectionFeeById(Long id, double distance) {
        CollectionFee collectionFee = collectionFeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection fee not found"));

        if(distance <= 5) {
            return BigDecimal.ZERO;
        }

        double distanceFee = distance -5;

        int segment = (int) Math.ceil(distanceFee / 10.0);

        return collectionFee.getCost().multiply(BigDecimal.valueOf(segment));
    }
}
