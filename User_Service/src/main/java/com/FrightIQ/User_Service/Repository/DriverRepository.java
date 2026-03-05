package com.FrightIQ.User_Service.Repository;

import com.FrightIQ.User_Service.Entities.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, String> {
    Optional<Driver> findByPhone(String phone);
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    boolean existsByPhone(String phone);
    boolean existsByLicenseNumber(String licenseNumber);
}
