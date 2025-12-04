package com.avfallskompassen.controller;

import com.avfallskompassen.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

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
}
