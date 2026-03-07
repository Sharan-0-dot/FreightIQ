package com.FrightIQ.User_Service.Controller;

import com.FrightIQ.User_Service.Entities.Shipment;
import com.FrightIQ.User_Service.Service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shipments")
public class ShipmentController {
    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<?> postShipment(@RequestBody Shipment shipment) {
        try {
            return new ResponseEntity<>(shipmentService.postShipment(shipment), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllShipments() {
        return new ResponseEntity<>(shipmentService.getAllShipments(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShipmentById(@PathVariable String id) {
        try {
            return new ResponseEntity<>(shipmentService.getShipmentById(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getShipmentsByCompany(@PathVariable String companyId) {
        return new ResponseEntity<>(shipmentService.getShipmentsByCompany(companyId), HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getShipmentsByStatus(@PathVariable String status) {
        try {
            return new ResponseEntity<>(shipmentService.getShipmentsByStatus(status), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShipment(@PathVariable String id, @RequestBody Shipment shipment) {
        try {
            return new ResponseEntity<>(shipmentService.updateShipment(id, shipment), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/assign-driver/{driverId}")
    public ResponseEntity<?> assignDriver(@PathVariable String id, @PathVariable String driverId) {
        try {
            return new ResponseEntity<>(shipmentService.assignDriver(id, driverId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam String status) {
        try {
            return new ResponseEntity<>(shipmentService.updateStatus(id, status), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShipment(@PathVariable String id) {
        try {
            shipmentService.deleteShipment(id);
            return new ResponseEntity<>("Shipment deleted successfully", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
