package com.FreightIQ.ShipmentService.Repository;

import com.FreightIQ.ShipmentService.Entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByDriverId(String driverId);
    List<Review> findByCompanyId(String companyId);
    Optional<Review> findByShipmentId(String shipmentId);
    boolean existsByShipmentId(String shipmentId);
}
