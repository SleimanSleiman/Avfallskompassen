package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.ActivityDTO;
import com.avfallskompassen.model.Activity;
import com.avfallskompassen.model.ActivityType;
import com.avfallskompassen.model.User;
import com.avfallskompassen.repository.ActivityRepository;
import com.avfallskompassen.services.ActivityService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityServiceImpl implements ActivityService {
    private ActivityRepository activityRepository;

    public ActivityServiceImpl(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Override
    public List<ActivityDTO> getLimitedUserActivities(User user, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
        List<Activity> usersActivities = activityRepository.findByUser(user, pageable);

        return ActivityDTO.fromEntity(usersActivities);
    }

    @Override
    public List<ActivityDTO> getUserActivities(User user) {
        List<Activity> usersActivities = activityRepository.findByUserOrderByTimestampDesc(user);

        return ActivityDTO.fromEntity(usersActivities);
    }

    @Override
    public void saveActivity(User user, ActivityType activityType, String details) {
        Activity activityToSave = new Activity(user, activityType, details);
        activityRepository.save(activityToSave);
    }
}