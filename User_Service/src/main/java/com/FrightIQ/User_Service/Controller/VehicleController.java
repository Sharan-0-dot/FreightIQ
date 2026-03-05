package com.FrightIQ.User_Service.Controller;

import com.FrightIQ.User_Service.Entities.Vehicle;
import com.FrightIQ.User_Service.Service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<?> addVehicle(@RequestBody Vehicle vehicle) {
        try {
            return new ResponseEntity<>(vehicleService.addVehicle(vehicle), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getVehiclesByDriver(@PathVariable String driverId) {
        try {
            return new ResponseEntity<>(vehicleService.getVehiclesByDriver(driverId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleById(@PathVariable String id) {
        try {
            return new ResponseEntity<>(vehicleService.getVehicleById(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable String id, @RequestBody Vehicle vehicle) {
        return new ResponseEntity<>(vehicleService.updateVehicle(id, vehicle), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable String id) {
        try {
            vehicleService.deleteVehicle(id);
            return new ResponseEntity<>("Vehicle deleted Successfully", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
