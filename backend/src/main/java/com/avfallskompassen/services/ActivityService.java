package com.avfallskompassen.services;

import com.avfallskompassen.dto.ActivityDTO;
import com.avfallskompassen.model.ActivityType;
import com.avfallskompassen.model.User;

import java.util.List;

/**
 * Interface for activity services
 * @author Anton Persson
 */
public interface ActivityService {
    List<ActivityDTO> getLimitedUserActivities(User user, int limit);

    List<ActivityDTO> getUserActivities(User user);

    void saveActivity(User user, ActivityType activityType, String details);
}
