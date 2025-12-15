package com.avfallskompassen.controller;

import com.avfallskompassen.dto.ActivityDTO;
import com.avfallskompassen.exception.ResourceNotFoundException;
import com.avfallskompassen.model.User;
import com.avfallskompassen.services.ActivityService;
import com.avfallskompassen.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * REST controller for handling users and activities relating users.
 * @author Huy
 * @author Anton Persson
 */
@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private UserService userService;
    private ActivityService activityService;

    public UserController(UserService userService, ActivityService activityService) {
        this.userService = userService;
        this.activityService = activityService;
    }

    /**
     * Endpoint for controlling if a user has seen a manual
     * @param username The username of the user to check
     * @param auth Authentication to control if the person making the call, only controls their own account
     * @return True if the manual has been seen, false otherwise
     */
    @GetMapping("/{username}/has-seen-manual")
    public boolean hasSeenManual(@PathVariable String username, Authentication auth) {
        if (!auth.getName().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your account");
        }
        return userService.hasSeenPlanningToolManual(username);
    }

    /**
     * Endpoint for marking that a user has seen the manual for the planning tool
     * @param username The username of the user to check
     * @param auth Authentication to control if the person making the call, only controls their own account
     */
    @PostMapping("/{username}/mark-manual-seen")
    public void markManualSeen(@PathVariable String username, Authentication auth) {
        if (!auth.getName().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your account");
        }
        userService.markPlanningToolManualAsSeen(username);
    }

    /**
     * Endpoint for getting a users activity
     * @param username The username of the user whose activities are to be collected
     * @param type This parameter doesn't do anything right now. It can be used in the future however to allow admins / users
     *             to filter the activities
     * @param limit The number of activities to collect from a user. If this parameter isn't filled, it defaults to get every activity from a user
     * @return A list of {@link ActivityDTO} from a specific user
     */
    @GetMapping("/activities")
    public ResponseEntity<List<ActivityDTO>> getUsersLatestActivities(
            @RequestHeader(value = "X-Username") String username,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(required = false, defaultValue = "0") int limit
    ) {
        User user = userService.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Username " + username + " not found"));
        List<ActivityDTO> usersActivities;

        if (limit > 0 ) {
            usersActivities = activityService.getLimitedUserActivities(user, limit);
        } else {
            usersActivities = activityService.getUserActivities(user);
        }
        return ResponseEntity.ok(usersActivities);
    }
}