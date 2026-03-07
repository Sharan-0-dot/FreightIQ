package com.FreightIQ.ShipmentService.Entities;

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
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String shipmentId;

    @Column(nullable = false)
    private String driverId;

    @Column(nullable = false)
    private String companyId;

    private Double rating;

    private boolean delayOccurred;
    private boolean damageReported;

    private String comments;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
