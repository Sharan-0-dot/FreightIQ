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

}
