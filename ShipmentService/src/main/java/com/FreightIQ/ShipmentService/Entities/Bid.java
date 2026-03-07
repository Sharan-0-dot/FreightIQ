package com.FreightIQ.ShipmentService.Entities;

import com.FreightIQ.ShipmentService.Enums.BidStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String shipmentId;

    @Column(nullable = false)
    private String driverId;

    private Double bidAmount;
    private Integer estimatedDeliveryDays;

    private String note;   // optional message from driver to company

    @Enumerated(EnumType.STRING)
    private BidStatus status;   // PENDING, ACCEPTED, REJECTED, WITHDRAWN

    @CreationTimestamp
    private LocalDateTime createdAt;
}
