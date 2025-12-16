package com.avfallskompassen.dto;

import com.avfallskompassen.model.Activity;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * DTO for {@link Activity}
 * @author Anton Persson
 */
public class ActivityDTO {
    private String details;
    private String timeStamp;

    public ActivityDTO() {
    }

    public ActivityDTO(String details, String timeStamp) {
        this.details = details;
        this.timeStamp = timeStamp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(String timeStamp) {
        this.timeStamp = timeStamp;
    }

    public static List<ActivityDTO> fromEntity(List<Activity> entities) {
        List<ActivityDTO> activityDTOList = new LinkedList<>();
        for (Activity activity : entities) {
            ActivityDTO dto = new ActivityDTO();
            dto.setDetails(activity.getDetails());
            dto.setTimeStamp(activity.getTimestamp() != null ? activity.getTimestamp().toString() : null);
            activityDTOList.add(dto);
        }
        return activityDTOList;
    }
}
