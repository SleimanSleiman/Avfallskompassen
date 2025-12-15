package com.avfallskompassen.repository;

import com.avfallskompassen.model.Activity;
import com.avfallskompassen.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for handling {@link Activity} entities
 * @author Anton Persson
 */
@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserOrderByTimestampDesc(User user);

    List<Activity> findByUser(User user, Pageable pageable);
}
