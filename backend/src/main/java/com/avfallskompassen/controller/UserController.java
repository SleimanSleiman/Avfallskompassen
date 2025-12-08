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

    @GetMapping("/{username}/has-seen-manual")
    public boolean hasSeenManual(@PathVariable String username, Authentication auth) {
        if (!auth.getName().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your account");
        }
        return userService.hasSeenPlanningToolManual(username);
    }

    @PostMapping("/{username}/mark-manual-seen")
    public void markManualSeen(@PathVariable String username, Authentication auth) {
        if (!auth.getName().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your account");
        }
        userService.markPlanningToolManualAsSeen(username);
    }

    @GetMapping("/activities")
    public ResponseEntity<List<ActivityDTO>> getUsersLatestActivities(
            @RequestHeader(value = "X-Username") String username,
            @RequestParam(required = false, defaultValue = "all") String type, // Isn't used right now, but could be good future proofing
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