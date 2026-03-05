package com.FrightIQ.User_Service.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String driverId;

    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    private Integer capacityKg;
    private boolean isRefrigerated;
    private boolean isHazardousSupported;
    private Integer vehicleAgeYears;

    @Column(nullable = false, unique = true)
    private String registrationNumber;
}
