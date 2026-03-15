package com.FrightIQ.User_Service.Controller;

import com.FrightIQ.User_Service.DTO.DriverRequestDTO;
import com.FrightIQ.User_Service.Service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<?> createDriver(@RequestBody DriverRequestDTO dto) {
        try {
            return new ResponseEntity<>(driverService.createDriver(dto), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login/{phone}")
    public ResponseEntity<?> loginDriver(@PathVariable String phone) {
        try {
            return new ResponseEntity<>(driverService.loginByPhone(phone), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllDrivers() {
        return new ResponseEntity<>(driverService.getAllDrivers(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDriverById(@PathVariable String id) {
        try {
            return new ResponseEntity<>(driverService.getDriverById(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDriver(@PathVariable String id, @RequestBody DriverRequestDTO dto) {
        return new ResponseEntity<>(driverService.updateDriver(id, dto), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDriver(@PathVariable String id) {
        try {
            driverService.deleteDriver(id);
            return new ResponseEntity<>("Driver Deleted Successfully", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/{id}/trips/completed")
    public ResponseEntity<?> incrementCompletedTrips(@PathVariable String id) {
        try {
            return new ResponseEntity<>(driverService.incrementCompletedTrips(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/trips/accepted")
    public ResponseEntity<?> incrementAcceptedTrips(@PathVariable String id) {
        try {
            return new ResponseEntity<>(driverService.incrementAcceptedTrips(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/trips/cancelled")
    public ResponseEntity<?> incrementCancelledTrips(@PathVariable String id) {
        try {
            return new ResponseEntity<>(driverService.incrementCancelledTrips(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/trips/delayed")
    public ResponseEntity<?> incrementDelayedTrips(@PathVariable String id) {
        try {
            return new ResponseEntity<>(driverService.incrementDelayedTrips(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/incident")
    public ResponseEntity<?> incrementIncidentCount(@PathVariable String id) {
        try {
            return new ResponseEntity<>(driverService.incrementIncidentCount(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/rating")
    public ResponseEntity<?> updateRating(@PathVariable String id, @RequestParam Double newRating) {
        try {
            return new ResponseEntity<>(driverService.updateRating(id, newRating), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

}
