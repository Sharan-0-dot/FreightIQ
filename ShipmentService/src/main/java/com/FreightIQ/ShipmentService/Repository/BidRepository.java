package com.FreightIQ.ShipmentService.Repository;

import com.FreightIQ.ShipmentService.Entities.Bid;
import com.FreightIQ.ShipmentService.Enums.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, String> {
    List<Bid> findByShipmentId(String shipmentId);
    List<Bid> findByDriverId(String driverId);
    List<Bid> findByShipmentIdAndStatus(String shipmentId, BidStatus status);
    boolean existsByShipmentIdAndDriverId(String shipmentId, String driverId);
}
