package com.FreightIQ.ShipmentService.Controller;

import com.FreightIQ.ShipmentService.DTO.ReviewRequestDTO;
import com.FreightIQ.ShipmentService.Service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody ReviewRequestDTO dto) {
        try {
            return new ResponseEntity<>(reviewService.submitReview(dto), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getReviewsByDriver(@PathVariable String driverId) {
        return new ResponseEntity<>(reviewService.getReviewsByDriver(driverId), HttpStatus.OK);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getReviewsByCompany(@PathVariable String companyId) {
        return new ResponseEntity<>(reviewService.getReviewsByCompany(companyId), HttpStatus.OK);
    }

    @GetMapping("/shipment/{shipmentId}")
    public ResponseEntity<?> getReviewByShipment(@PathVariable String shipmentId) {
        try {
            return new ResponseEntity<>(reviewService.getReviewByShipment(shipmentId), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getLocalizedMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
