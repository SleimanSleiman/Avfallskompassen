package com.avfallskompassen.services.impl;

import com.avfallskompassen.dto.ActivityDTO;
import com.avfallskompassen.exception.InternalServerException;
import com.avfallskompassen.model.Activity;
import com.avfallskompassen.model.ActivityType;
import com.avfallskompassen.model.User;
import com.avfallskompassen.repository.ActivityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityServiceImplTest {
    @Mock
    private ActivityRepository activityRepository;

    @InjectMocks
    private ActivityServiceImpl activityService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUsername("john");
    }

    @Test
    void getLimitedUserActivities_ShouldUseCorrectPageable_AndReturnDtoList() {
        int limit = 2;

        Activity a1 = new Activity(user, ActivityType.REGISTERED, "details1");
        Activity a2 = new Activity(user, ActivityType.LOGIN, "details2");

        a1.setTimestamp(LocalDateTime.now().minusMinutes(5));
        a2.setTimestamp(LocalDateTime.now());

        List<Activity> activities = List.of(a1, a2);

        when(activityRepository.findByUser(eq(user), any(Pageable.class)))
                .thenReturn(activities);

        List<ActivityDTO> result = activityService.getLimitedUserActivities(user, limit);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(activityRepository).findByUser(eq(user), pageableCaptor.capture());

        Pageable usedPageable = pageableCaptor.getValue();

        assertEquals(0, usedPageable.getPageNumber());
        assertEquals(limit, usedPageable.getPageSize());
        assertEquals("timestamp: DESC", usedPageable.getSort().toString());

        assertEquals(2, result.size());
    }

    @Test
    void getLimitedUserActivities_ShouldReturnEmptyList_WhenNoActivitiesFound() {
        when(activityRepository.findByUser(eq(user), any(Pageable.class)))
                .thenReturn(List.of());

        List<ActivityDTO> result = activityService.getLimitedUserActivities(user, 5);

        assertTrue(result.isEmpty());
    }

    @Test
    void getLimitedUserActivities_ShouldCallRepositoryWithCorrectUser() {
        when(activityRepository.findByUser(eq(user), any())).thenReturn(List.of());

        activityService.getLimitedUserActivities(user, 3);

        verify(activityRepository).findByUser(eq(user), any(Pageable.class));
    }

    @Test
    void getLimitedUserActivities_ShouldConvertEntitiesToDTOs() {
        Activity a = new Activity(user, ActivityType.LOGIN, "abc");
        LocalDateTime time = LocalDateTime.now();
        a.setTimestamp(time);

        when(activityRepository.findByUser(eq(user), any())).thenReturn(List.of(a));

        List<ActivityDTO> result = activityService.getLimitedUserActivities(user, 1);

        assertEquals(1, result.size());
        ActivityDTO dto = result.get(0);
        assertEquals("abc", dto.getDetails());
        assertEquals(time.toString(), dto.getTimeStamp());
    }

    @Test
    void getLimitedUserActivities_ShouldHandleZeroOrNegativeLimit() {
        assertThrows(IllegalArgumentException.class,
                () -> activityService.getLimitedUserActivities(user, 0));
    }


    @Test
    void getUserActivities_ShouldReturnEmptyList_WhenNoActivitiesFound() {
        when(activityRepository.findByUserOrderByTimestampDesc(user)).thenReturn(List.of());

        List<ActivityDTO> result = activityService.getUserActivities(user);

        assertTrue(result.isEmpty());
        verify(activityRepository).findByUserOrderByTimestampDesc(user);
    }

    @Test
    void getUserActivities_ShouldConvertEntitiesToDTOs() {
        LocalDateTime time = LocalDateTime.now();
        Activity a = new Activity(user, ActivityType.LOGIN, "abc");
        a.setTimestamp(time);

        when(activityRepository.findByUserOrderByTimestampDesc(user)).thenReturn(List.of(a));

        List<ActivityDTO> result = activityService.getUserActivities(user);

        assertEquals(1, result.size());
        ActivityDTO dto = result.get(0);
        assertEquals("abc", dto.getDetails());
        assertEquals(time.toString(), dto.getTimeStamp());
    }

    @Test
    void getUserActivities_ShouldCallRepositoryOnce() {
        when(activityRepository.findByUserOrderByTimestampDesc(user)).thenReturn(List.of());

        activityService.getUserActivities(user);

        verify(activityRepository, times(1)).findByUserOrderByTimestampDesc(user);
    }

    @Test
    void getUserActivities_ShouldKeepActivityEvenIfTimestampIsNull() {
        Activity a = new Activity(user, ActivityType.LOGIN, "abc");
        a.setTimestamp(null);

        when(activityRepository.findByUserOrderByTimestampDesc(user))
                .thenReturn(List.of(a));

        List<ActivityDTO> result = activityService.getUserActivities(user);

        assertEquals(1, result.size());
        assertNull(result.get(0).getTimeStamp()); 
    }

    @Test
    void saveActivity_ShouldCallRepositorySaveWithCorrectEntity() {
        ArgumentCaptor<Activity> captor = ArgumentCaptor.forClass(Activity.class);

        activityService.saveActivity(user, ActivityType.LOGIN, "test details");

        verify(activityRepository).save(captor.capture());

        Activity saved = captor.getValue();

        assertEquals(user, saved.getUser());
        assertEquals(ActivityType.LOGIN, saved.getAction());
        assertEquals("test details", saved.getDetails());
        verify(activityRepository, times(1)).save(any(Activity.class));
    }

    @Test
    void saveActivity_ShouldThrowException_WhenUserIsNull() {
        assertThrows(InternalServerException.class,
                () -> activityService.saveActivity(null, ActivityType.LOGIN, "details"));
    }

    @Test
    void saveActivity_ShouldThrowException_WhenActivityTypeIsNull() {
        assertThrows(InternalServerException.class,
                () -> activityService.saveActivity(user, null, "details"));
    }

    @Test
    void saveActivity_ShouldThrowException_WhenDetailsIsNull() {
        assertThrows(InternalServerException.class,
                () -> activityService.saveActivity(user, ActivityType.LOGIN, null));
    }
}