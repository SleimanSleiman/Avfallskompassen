package com.avfallskompassen.services.impl;

import com.avfallskompassen.model.Activity;
import com.avfallskompassen.model.ActivityType;
import com.avfallskompassen.model.User;
import com.avfallskompassen.repository.ActivityRepository;
import com.avfallskompassen.services.ActivityService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityServiceImpl implements ActivityService {
    private ActivityRepository activityRepository;

    public ActivityServiceImpl(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Override
    public List<Activity> getLatestUserActivities(User user) {
        return List.of();
    }

    @Override
    public List<Activity> getUserActivities(User user) {
        return List.of();
    }

    @Override
    public void saveActivity(User user, ActivityType activityType, String details) {
        Activity activityToSave = new Activity(user, activityType, details);
        activityRepository.save(activityToSave);
    }
}