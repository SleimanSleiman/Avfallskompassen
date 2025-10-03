package com.avfallskompassen.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

@RestController
@CrossOrigin(origins = "*")
public class SimpleController {
    
    @Autowired
    private DataSource dataSource;
    
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
    
    @GetMapping("/api/status")
    public String getStatus() {
        return "Backend is running on port 8081!";
    }
    
    @GetMapping("/api/db-test")
    public String testDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            return "Database connection successful! Connected to: " + connection.getMetaData().getURL();
        } catch (Exception e) {
            return "Database connection failed: " + e.getMessage();
        }
    }
}