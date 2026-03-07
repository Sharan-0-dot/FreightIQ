package com.FreightIQ.ShipmentService.Entities;


import com.FreightIQ.ShipmentService.Enums.CargoType;
import com.FreightIQ.ShipmentService.Enums.PriorityType;
import com.FreightIQ.ShipmentService.Enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String companyId;

    private String assignedDriverId;

    @Column(nullable = false)
    private String originCity;

    @Column(nullable = false)
    private String destinationCity;

    private Double distanceKm;

    @Enumerated(EnumType.STRING)
    private CargoType cargoType;

    private Double weightKg;

    private boolean fragile;
    private boolean hazardous;
    private boolean requiresRefrigeration;

    private LocalDate deadlineDate;

    private Double budgetAmount;

    @Enumerated(EnumType.STRING)
    private PriorityType priorityType;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
