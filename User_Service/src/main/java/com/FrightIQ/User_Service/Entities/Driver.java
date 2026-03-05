package com.FrightIQ.User_Service.Entities;

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
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private Integer age;
    private Integer experienceYears;

    @Column(unique = true, nullable = false)
    private String licenseNumber;

    private LocalDate licenseValidTill;

    @Column(unique = true, nullable = false)
    private String phone;

    private Double ratingAverage;

    private Integer totalCompletedTrips;
    private Integer totalAcceptedTrips;
    private Integer totalCancelledTrips;
    private Integer totalDelayedTrips;


    private Integer incidentCount;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
