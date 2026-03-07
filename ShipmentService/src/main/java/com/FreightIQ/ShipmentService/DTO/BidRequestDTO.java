package com.FreightIQ.ShipmentService.DTO;

import lombok.Data;

@Data
public class BidRequestDTO {
    private String shipmentId;
    private String driverId;
    private Double bidAmount;
    private Integer estimatedDeliveryDays;
    private String note;
}
