package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.ActivityDTO;
import com.avfallskompassen.exception.InternalServerException;
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

/**
 * Service class for handling activities
 * Contains operations such as getting and saving activities
 * @author Anton Persson
 */
@Service
public class ActivityServiceImpl implements ActivityService {
    private ActivityRepository activityRepository;

    public ActivityServiceImpl(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    /**
     * Gets a certain users activities, with a limit of how many activities to collect
     * @param user The user whose activities are to be collected
     * @param limit The number of activities to get
     * @return A list of activities
     */
    @Override
    public List<ActivityDTO> getLimitedUserActivities(User user, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
        List<Activity> usersActivities = activityRepository.findByUser(user, pageable);

        return ActivityDTO.fromEntity(usersActivities);
    }

    /**
     * Get a certain users activities
     * @param user The user whose activities are to be collected
     * @return A list of activities
     */
    @Override
    public List<ActivityDTO> getUserActivities(User user) {
        List<Activity> usersActivities = activityRepository.findByUserOrderByTimestampDesc(user);

        return ActivityDTO.fromEntity(usersActivities);
    }

    /**
     * Saves an activity
     * @param user The user who did the activity
     * @param activityType The type of activity
     * @param details The details of the activity
     */
    @Override
    public void saveActivity(User user, ActivityType activityType, String details) {
        if (user == null || activityType == null || details == null) {
            throw new InternalServerException("Something went wrong in the server while trying to save an activity");
        }
        Activity activityToSave = new Activity(user, activityType, details);
        activityRepository.save(activityToSave);
    }
}