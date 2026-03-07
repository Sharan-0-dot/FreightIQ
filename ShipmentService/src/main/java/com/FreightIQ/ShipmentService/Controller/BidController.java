package com.FreightIQ.ShipmentService.Controller;

import com.FreightIQ.ShipmentService.DTO.BidRequestDTO;
import com.FreightIQ.ShipmentService.Service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @PostMapping
    public ResponseEntity<?> placeBid(@RequestBody BidRequestDTO dto) {
        try {
            return new ResponseEntity<>(bidService.placeBid(dto), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<?> getBidsForShipment(@PathVariable String shipmentId) {
        return new ResponseEntity<>(bidService.getBidsForShipment(shipmentId), HttpStatus.OK);
    }

    @GetMapping("/shipment/{shipmentId}/pending")
    public ResponseEntity<?> getPendingBids(@PathVariable String shipmentId) {
        return new ResponseEntity<>(bidService.getPendingBidsForShipment(shipmentId), HttpStatus.OK);
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getBidsByDriver(@PathVariable String driverId) {
        return new ResponseEntity<>(bidService.getBidsByDriver(driverId), HttpStatus.OK);
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<?> acceptBid(@PathVariable String id) {
        try {
            return new ResponseEntity<>(bidService.acceptBid(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<?> withdrawBid(@PathVariable String id) {
        try {
            return new ResponseEntity<>(bidService.withdrawBid(id), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
