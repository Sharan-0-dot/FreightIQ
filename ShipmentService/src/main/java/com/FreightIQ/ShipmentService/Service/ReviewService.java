package com.FreightIQ.ShipmentService.Service;

import com.FreightIQ.ShipmentService.Client.UserServiceClient;
import com.FreightIQ.ShipmentService.DTO.ReviewRequestDTO;
import com.FreightIQ.ShipmentService.Entities.Review;
import com.FreightIQ.ShipmentService.Entities.Shipment;
import com.FreightIQ.ShipmentService.Enums.ShipmentStatus;
import com.FreightIQ.ShipmentService.Repository.ReviewRepository;
import com.FreightIQ.ShipmentService.Repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserServiceClient userServiceClient;


    @Transactional
    public Review submitReview(ReviewRequestDTO dto) {
        // Shipment must exist and be DELIVERED
        Shipment shipment = shipmentRepository.findById(dto.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (shipment.getStatus() != ShipmentStatus.DELIVERED) {
            throw new RuntimeException("Review can only be submitted for DELIVERED shipments");
        }

        // One review per shipment only
        if (reviewRepository.existsByShipmentId(dto.getShipmentId())) {
            throw new RuntimeException("Review already submitted for this shipment");
        }

        if (dto.getRating() < 1.0 || dto.getRating() > 5.0) {
            throw new RuntimeException("Rating must be between 1.0 and 5.0");
        }

        Review review = new Review();
        review.setShipmentId(dto.getShipmentId());
        review.setDriverId(dto.getDriverId());
        review.setCompanyId(dto.getCompanyId());
        review.setRating(dto.getRating());
        review.setDelayOccurred(dto.isDelayOccurred());
        review.setDamageReported(dto.isDamageReported());
        review.setComments(dto.getComments());

        Review saved = reviewRepository.save(review);

        // Push stats back to User Service
        userServiceClient.incrementCompletedTrips(dto.getDriverId());
        userServiceClient.updateDriverRating(dto.getDriverId(), dto.getRating());

        if (dto.isDelayOccurred()) {
            userServiceClient.incrementDelayedTrips(dto.getDriverId());
        }

        return saved;
    }

    public List<Review> getReviewsByDriver(String driverId) {
        return reviewRepository.findByDriverId(driverId);
    }

    public List<Review> getReviewsByCompany(String companyId) {
        return reviewRepository.findByCompanyId(companyId);
    }

    public Review getReviewByShipment(String shipmentId) {
        return reviewRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new RuntimeException("No review found for shipment: " + shipmentId));
    }
}
