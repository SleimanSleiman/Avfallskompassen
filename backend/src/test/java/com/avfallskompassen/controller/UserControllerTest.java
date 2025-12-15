package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ActivityDTO;
import com.avfallskompassen.model.User;
import com.avfallskompassen.services.ActivityService;
import com.avfallskompassen.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private ActivityService activityService;

    private Authentication auth;


    @BeforeEach
    void setUp() {
        auth = mock(Authentication.class);
    }

    @Test
    void hasSeenManual_ShouldReturnTrue_WhenUserHasSeenManual() throws Exception {
        String username = "john";

        when(auth.getName()).thenReturn("john");
        when(userService.hasSeenPlanningToolManual(username)).thenReturn(true);

        mockMvc.perform(get("/api/user/john/has-seen-manual")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void hasSeenManual_ShouldReturnFalse_WhenUserHasNotSeenManual() throws Exception {
        String username = "john";

        when(auth.getName()).thenReturn("john");
        when(userService.hasSeenPlanningToolManual(username)).thenReturn(false);

        mockMvc.perform(get("/api/user/john/has-seen-manual")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void hasSeenManual_ShouldReturnTrue_WhenUserMatchesAuth() throws Exception {
        String username = "john";
        when(auth.getName()).thenReturn("john");
        when(userService.hasSeenPlanningToolManual("john")).thenReturn(true);

        mockMvc.perform(get("/api/user/john/has-seen-manual")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void hasSeenManual_ShouldReturnForbidden_WhenUserDoesNotMatchAuth() throws Exception {
        when(auth.getName()).thenReturn("other");

        mockMvc.perform(get("/api/user/john/has-seen-manual")
                        .principal(auth))
                .andExpect(status().isForbidden())
                .andExpect(result ->
                        assertTrue(result.getResolvedException().getMessage().contains("Not your account"))
                );;
    }

    @Test
    void markManualSeen_ShouldCallService_WhenUserMatchesAuth() throws Exception {
        String username = "john";

        when(auth.getName()).thenReturn("john");

        mockMvc.perform(post("/api/user/john/mark-manual-seen")
                        .principal(auth))
                .andExpect(status().isOk());

        verify(userService).markPlanningToolManualAsSeen("john");
    }

    @Test
    void markManualSeen_ShouldReturnForbidden_WhenUserDoesNotMatchAuth() throws Exception {
        when(auth.getName()).thenReturn("other");

        mockMvc.perform(post("/api/user/john/mark-manual-seen")
                        .principal(auth))
                .andExpect(status().isForbidden())
                .andExpect(result ->
                        assertTrue(result.getResolvedException().getMessage().contains("Not your account"))
                );

        verify(userService, never()).markPlanningToolManualAsSeen(anyString());
    }

    @Test
    void getUsersLatestActivities_ShouldReturnAllActivities_WhenLimitIsZero() throws Exception {
        String username = "john";

        User user = new User();
        user.setUsername(username);

        List<ActivityDTO> activities = List.of(new ActivityDTO(), new ActivityDTO());

        when(userService.findByUsername(username)).thenReturn(Optional.of(user));
        when(activityService.getUserActivities(user)).thenReturn(activities);

        mockMvc.perform(get("/api/user/activities")
                        .header("X-Username", username)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void getUsersLatestActivities_ShouldReturnLimitedActivities_WhenLimitIsProvided() throws Exception {
        String username = "john";

        User user = new User();
        user.setUsername(username);

        List<ActivityDTO> limited = List.of(new ActivityDTO());

        when(userService.findByUsername(username)).thenReturn(Optional.of(user));
        when(activityService.getLimitedUserActivities(user, 1)).thenReturn(limited);

        mockMvc.perform(get("/api/user/activities")
                        .header("X-Username", username)
                        .param("limit", "1")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getUsersLatestActivities_ShouldReturn404_WhenUserNotFound() throws Exception {
        when(userService.findByUsername("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/user/activities")
                        .header("X-Username", "missing")
                )
                .andExpect(status().isNotFound());
    }

    @Test
    void getUsersLatestActivities_ShouldDefaultToAllActivities_WhenLimitNotProvided() throws Exception {
        String username = "john";

        User user = new User();
        user.setUsername(username);

        List<ActivityDTO> activities = List.of(new ActivityDTO(), new ActivityDTO(), new ActivityDTO());

        when(userService.findByUsername(username)).thenReturn(Optional.of(user));
        when(activityService.getUserActivities(user)).thenReturn(activities);

        mockMvc.perform(get("/api/user/activities")
                        .header("X-Username", username)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }
}