package com.avfallskompassen.services;

import com.avfallskompassen.model.Activity;
import com.avfallskompassen.model.ActivityType;
import com.avfallskompassen.model.User;

import java.util.List;

public interface ActivityService {
    List<Activity> getLatestUserActivities(User user);

    List<Activity> getUserActivities(User user);

    void saveActivity(User user, ActivityType activityType, String details);
}
