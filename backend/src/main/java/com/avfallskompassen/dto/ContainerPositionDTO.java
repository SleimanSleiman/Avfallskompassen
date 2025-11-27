package com.avfallskompassen.dto;

import com.avfallskompassen.model.ContainerPosition;

/**
 * DTO for sending data related to {@link ContainerPosition} out from the server
 * @author Anton Persson
 */
public class ContainerPositionDTO {
    private Long id;
    private double x;
    private double y;
    private double angle;
    ContainerDTO containerDTO;
    private Long containerPlanId;
    private Long wasteRoomId;

    // Doesn't serve any real purpose for the server. Just put this here to simply the testing -- Anton
    public ContainerPositionDTO(Long id, double x, double y, double angle, Long containerPlanId, Long wasteRoomId) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.containerPlanId = containerPlanId;
        this.wasteRoomId = wasteRoomId;
    }

    public ContainerPositionDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public double getAngle() { return angle; }
    public void setAngle(double angle) { this.angle = angle; }

    public Long getContainerPlanId() { return containerPlanId; }
    public void setContainerPlanId(Long containerPlanId) { this.containerPlanId = containerPlanId; }

    public Long getWasteRoomId() { return wasteRoomId; }
    public void setWasteRoomId(Long wasteRoomId) { this.wasteRoomId = wasteRoomId; }

    public ContainerDTO getContainerDTO() { return containerDTO; }

    public void setContainerDTO(ContainerDTO containerDTO) { this.containerDTO = containerDTO; }

    /**
     * Method for converting an entity object to a DTO object
     * @param entity The entity object to be converted
     * @return A converted DTO
     */
    public static ContainerPositionDTO fromEntity(ContainerPosition entity) {
        ContainerPositionDTO dto = new ContainerPositionDTO();
        dto.setId(entity.getId());
        dto.setX(entity.getX());
        dto.setY(entity.getY());
        dto.setAngle(entity.getAngle());
        dto.setContainerDTO(ContainerDTO.fromEntity(entity.getContainerPlan()));
        dto.setWasteRoomId(entity.getWasteRoom() != null ? entity.getWasteRoom().getId() : null);
        return dto;
    }
}