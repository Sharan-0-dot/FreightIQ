package com.FrightIQ.User_Service.Entities;

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
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String phone;

    @Column(unique = true, nullable = false)
    private String gstNumber;

    private String industry;

    private String city;
    private String state;

    private Double ratingAverage;
    private Integer totalShipmentsPosted;
    private Integer totalShipmentsCompleted;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
