package com.FrightIQ.User_Service.DTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DriverRequestDTO {
    private String name;
    private Integer age;
    private Integer experienceYears;
    private String licenseNumber;
    private LocalDate licenseValidTill;
    private String phone;
}
