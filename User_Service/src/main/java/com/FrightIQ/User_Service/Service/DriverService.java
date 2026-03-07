package com.FrightIQ.User_Service.Service;

import com.FrightIQ.User_Service.DTO.DriverRequestDTO;
import com.FrightIQ.User_Service.Entities.Driver;
import com.FrightIQ.User_Service.Repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;

    public Driver createDriver(DriverRequestDTO dto) {
        if (driverRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }
        if (driverRepository.existsByLicenseNumber(dto.getLicenseNumber())) {
            throw new RuntimeException("License number already registered");
        }

        Driver driver = new Driver();
        driver.setName(dto.getName());
        driver.setAge(dto.getAge());
        driver.setExperienceYears(dto.getExperienceYears());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setLicenseValidTill(dto.getLicenseValidTill());
        driver.setPhone(dto.getPhone());


        driver.setRatingAverage(0.0);
        driver.setTotalCompletedTrips(0);
        driver.setTotalAcceptedTrips(0);
        driver.setTotalCancelledTrips(0);
        driver.setTotalDelayedTrips(0);
        driver.setIncidentCount(0);

        return driverRepository.save(driver);
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Driver getDriverById(String id) {
        return driverRepository.findById(id).orElseThrow(() -> new RuntimeException("Drive not found with id: " + id));
    }

    public Driver updateDriver(String id, DriverRequestDTO dto) {
        Driver driver = getDriverById(id);

        driver.setName(dto.getName());
        driver.setAge(dto.getAge());
        driver.setExperienceYears(dto.getExperienceYears());
        driver.setLicenseValidTill(dto.getLicenseValidTill());

        return driverRepository.save(driver);
    }

    public void deleteDriver(String id) {
        if (!driverRepository.existsById(id)) {
            throw new RuntimeException("Driver not found with id: " + id);
        }
        driverRepository.deleteById(id);
    }

    public Driver incrementCompletedTrips(String id) {
        Driver driver = getDriverById(id);
        driver.setTotalCompletedTrips(driver.getTotalCompletedTrips() + 1);
        return driverRepository.save(driver);
    }

    public Driver incrementAcceptedTrips(String id) {
        Driver driver = getDriverById(id);
        driver.setTotalAcceptedTrips(driver.getTotalAcceptedTrips() + 1);
        return driverRepository.save(driver);
    }

    public Driver incrementCancelledTrips(String id) {
        Driver driver = getDriverById(id);
        driver.setTotalCancelledTrips(driver.getTotalCancelledTrips() + 1);
        return driverRepository.save(driver);
    }

    public Driver incrementDelayedTrips(String id) {
        Driver driver = getDriverById(id);
        driver.setTotalDelayedTrips(driver.getTotalDelayedTrips() + 1);
        return driverRepository.save(driver);
    }

    public Driver incrementIncidentCount(String id) {
        Driver driver = getDriverById(id);
        driver.setIncidentCount(driver.getIncidentCount() + 1);
        return driverRepository.save(driver);
    }

    public Driver updateRating(String id, Double newRating) {
        if (newRating < 1.0 || newRating > 5.0) {
            throw new RuntimeException("Rating must be between 1.0 and 5.0");
        }

        Driver driver = getDriverById(id);
        int totalReviews = driver.getTotalCompletedTrips(); // reviews = completed trips

        if (totalReviews == 0) {
            driver.setRatingAverage(newRating);
        } else {
            // Rolling average: ((currentAvg * totalReviews) + newRating) / (totalReviews + 1)
            double updatedAvg = ((driver.getRatingAverage() * totalReviews) + newRating) / (totalReviews + 1);
            driver.setRatingAverage(Math.round(updatedAvg * 100.0) / 100.0); // round to 2 decimal places
        }

        return driverRepository.save(driver);
    }
}
