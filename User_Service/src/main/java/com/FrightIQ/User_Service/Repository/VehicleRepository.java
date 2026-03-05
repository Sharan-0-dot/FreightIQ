package com.FrightIQ.User_Service.Repository;

import com.FrightIQ.User_Service.Entities.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    List<Vehicle> findByDriverId(String driverId);
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
}
