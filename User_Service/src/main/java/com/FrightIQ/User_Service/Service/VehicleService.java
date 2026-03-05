package com.FrightIQ.User_Service.Service;

import com.FrightIQ.User_Service.Entities.Vehicle;
import com.FrightIQ.User_Service.Repository.DriverRepository;
import com.FrightIQ.User_Service.Repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;  // to validate driver exists

    public Vehicle addVehicle(Vehicle vehicle) {
        if (!driverRepository.existsById(vehicle.getDriverId())) {
            throw new RuntimeException("Driver not found with id: " + vehicle.getDriverId());
        }
        if (vehicleRepository.existsByRegistrationNumber(vehicle.getRegistrationNumber())) {
            throw new RuntimeException("Vehicle with this registration number already exists");
        }
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getVehiclesByDriver(String driverId) {
        if (!driverRepository.existsById(driverId)) {
            throw new RuntimeException("Driver not found with id: " + driverId);
        }
        return vehicleRepository.findByDriverId(driverId);
    }

    public Vehicle getVehicleById(String id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
    }

    public Vehicle updateVehicle(String id, Vehicle updatedVehicle) {
        Vehicle existing = getVehicleById(id);

        existing.setVehicleType(updatedVehicle.getVehicleType());
        existing.setCapacityKg(updatedVehicle.getCapacityKg());
        existing.setRefrigerated(updatedVehicle.isRefrigerated());
        existing.setHazardousSupported(updatedVehicle.isHazardousSupported());
        existing.setVehicleAgeYears(updatedVehicle.getVehicleAgeYears());

        return vehicleRepository.save(existing);
    }

    public void deleteVehicle(String id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with id: " + id);
        }
        vehicleRepository.deleteById(id);
    }
}
