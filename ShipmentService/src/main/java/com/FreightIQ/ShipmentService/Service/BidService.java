package com.FreightIQ.ShipmentService.Service;

import com.FreightIQ.ShipmentService.Client.UserServiceClient;
import com.FreightIQ.ShipmentService.DTO.BidRequestDTO;
import com.FreightIQ.ShipmentService.Entities.Bid;
import com.FreightIQ.ShipmentService.Entities.Shipment;
import com.FreightIQ.ShipmentService.Enums.BidStatus;
import com.FreightIQ.ShipmentService.Enums.ShipmentStatus;
import com.FreightIQ.ShipmentService.Repository.BidRepository;
import com.FreightIQ.ShipmentService.Repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BidService {
    private final BidRepository bidRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserServiceClient userServiceClient;

    public Bid placeBid(BidRequestDTO dto) {
        // Validate driver exists in User Service
        try {
            userServiceClient.getDriverById(dto.getDriverId());
        } catch (Exception e) {
            throw new RuntimeException("Driver not found with id: " + dto.getDriverId());
        }

        // Validate shipment exists and is still OPEN
        Shipment shipment = shipmentRepository.findById(dto.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + dto.getShipmentId()));

        if (shipment.getStatus() != ShipmentStatus.OPEN) {
            throw new RuntimeException("Shipment is not open for bidding. Current status: " + shipment.getStatus());
        }

        // Prevent duplicate bids from same driver on same shipment
        if (bidRepository.existsByShipmentIdAndDriverId(dto.getShipmentId(), dto.getDriverId())) {
            throw new RuntimeException("Driver has already placed a bid on this shipment");
        }

        Bid bid = new Bid();
        bid.setShipmentId(dto.getShipmentId());
        bid.setDriverId(dto.getDriverId());
        bid.setBidAmount(dto.getBidAmount());
        bid.setEstimatedDeliveryDays(dto.getEstimatedDeliveryDays());
        bid.setNote(dto.getNote());
        bid.setStatus(BidStatus.PENDING);

        return bidRepository.save(bid);
    }

    public List<Bid> getBidsForShipment(String shipmentId) {
        return bidRepository.findByShipmentId(shipmentId);
    }

    public List<Bid> getBidsByDriver(String driverId) {
        return bidRepository.findByDriverId(driverId);
    }

    public List<Bid> getPendingBidsForShipment(String shipmentId) {
        return bidRepository.findByShipmentIdAndStatus(shipmentId, BidStatus.PENDING);
    }

    @Transactional
    public Bid acceptBid(String bidId) {
        Bid bid = getBidById(bidId);

        if (bid.getStatus() != BidStatus.PENDING) {
            throw new RuntimeException("Only PENDING bids can be accepted");
        }

        Shipment shipment = shipmentRepository.findById(bid.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (shipment.getStatus() != ShipmentStatus.OPEN) {
            throw new RuntimeException("Shipment is no longer open");
        }

        // Accept this bid
        bid.setStatus(BidStatus.ACCEPTED);
        bidRepository.save(bid);

        // Reject all other pending bids for the same shipment
        List<Bid> otherBids = bidRepository.findByShipmentIdAndStatus(bid.getShipmentId(), BidStatus.PENDING);
        for (Bid other : otherBids) {
            other.setStatus(BidStatus.REJECTED);
            bidRepository.save(other);
        }

        // Assign driver to shipment
        shipment.setAssignedDriverId(bid.getDriverId());
        shipment.setStatus(ShipmentStatus.ASSIGNED);
        shipmentRepository.save(shipment);

        // Update accepted trips count on driver
        userServiceClient.incrementAcceptedTrips(bid.getDriverId());

        return bid;
    }

    public Bid withdrawBid(String bidId) {
        Bid bid = getBidById(bidId);

        if (bid.getStatus() != BidStatus.PENDING) {
            throw new RuntimeException("Only PENDING bids can be withdrawn");
        }

        bid.setStatus(BidStatus.WITHDRAWN);
        return bidRepository.save(bid);
    }

    public Bid getBidById(String id) {
        return bidRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bid not found with id: " + id));
    }
}
