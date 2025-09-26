package com.avfallskompassen.demo;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class SimpleController {
    @GetMapping("/api/message")
    public String getMessage(@RequestParam int value) {
        if (value == 1) {
            return "nice";
        } else if (value == 2) {
            return "good";
        } else {
            return "unknown";
        }
    }
}
