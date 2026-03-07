package com.FrightIQ.User_Service.DTO;

import lombok.Data;

@Data
public class CompanyRequestDTO {
    private String name;
    private String email;
    private String phone;
    private String gstNumber;
    private String industry;
    private String city;
    private String state;
}
