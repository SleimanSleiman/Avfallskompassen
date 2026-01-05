package com.avfallskompassen.dto;

import java.time.LocalDateTime;

/**
 * DTO containing data relevant to admin about users
 */
public class UserStatsDTO {

    private Long userId;
    private String username;
    private String role;
    private LocalDateTime createdAt;
    private Long propertiesCount;
    private Long wasteRoomsCount;

    public UserStatsDTO(
            Long userId,
            String username,
            String role,
            LocalDateTime createdAt,
            Long propertiesCount,
            Long wasteRoomsCount
    ) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.createdAt = createdAt;
        this.propertiesCount = propertiesCount;
        this.wasteRoomsCount = wasteRoomsCount;
    }

    public UserStatsDTO() {}
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getPropertiesCount() { return propertiesCount; }
    public Long getWasteRoomsCount() { return wasteRoomsCount; }

    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setRole(String role) { this.role = role; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setPropertiesCount(Long propertiesCount) { this.propertiesCount = propertiesCount; }
    public void setWasteRoomsCount(Long wasteRoomsCount) { this.wasteRoomsCount = wasteRoomsCount; }
}
