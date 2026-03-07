package com.FreightIQ.ShipmentService.DTO;

import lombok.Data;

@Data
public class ReviewRequestDTO {
    private String shipmentId;
    private String driverId;
    private String companyId;
    private Double rating;
    private boolean delayOccurred;
    private boolean damageReported;
    private String comments;
}
