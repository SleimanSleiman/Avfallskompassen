package com.avfallskompassen.dto;

import java.time.LocalDateTime;

/**
 * DTO containing data relevant to admin about users
 * @author Anton Persson
 */
public class UserStatsDTO {
    private Long userId;
    private String username;
    private LocalDateTime createdAt;
    private Long propertiesCount;
    private Long wasteRoomsCount;

    public UserStatsDTO(Long userId, String username, LocalDateTime createdAt,
                        Long propertiesCount, Long wasteRoomsCount) {
        this.userId = userId;
        this.username = username;
        this.createdAt = createdAt;
        this.propertiesCount = propertiesCount;
        this.wasteRoomsCount = wasteRoomsCount;
    }

    public UserStatsDTO() {

    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getPropertiesCount() {
        return propertiesCount;
    }

    public void setPropertiesCount(Long propertiesCount) {
        this.propertiesCount = propertiesCount;
    }

    public Long getWasteRoomsCount() {
        return wasteRoomsCount;
    }

    public void setWasteRoomsCount(Long wasteRoomsCount) {
        this.wasteRoomsCount = wasteRoomsCount;
    }
}
