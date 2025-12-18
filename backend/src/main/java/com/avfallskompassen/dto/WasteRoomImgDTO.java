package com.avfallskompassen.dto;

import com.avfallskompassen.model.WasteRoom;

import java.util.stream.Collectors;

public class WasteRoomImgDTO {
    private String thumbnailUrl;

    public WasteRoomImgDTO(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
}
