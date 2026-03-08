package com.FreightIQ.ShipmentService.Service;


import com.FreightIQ.ShipmentService.Client.UserServiceClient;
import com.FreightIQ.ShipmentService.Enums.ShipmentStatus;
import com.FreightIQ.ShipmentService.Entities.Shipment;
import com.FreightIQ.ShipmentService.Repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final UserServiceClient userServiceClient;
    private final ShipmentRepository shipmentRepository;

    @Transactional
    public Shipment postShipment(Shipment shipment) {

        try {
            userServiceClient.getCompanyById(shipment.getCompanyId());
        } catch (Exception e) {
            throw new RuntimeException("Validation failed: Company with ID " + shipment.getCompanyId() + " does not exist.");
        }

        shipment.setStatus(ShipmentStatus.OPEN);
        shipment.setAssignedDriverId(null);
        return shipmentRepository.save(shipment);
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Shipment getShipmentById(String id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));
    }

    public List<Shipment> getShipmentsByCompany(String companyId) {
        return shipmentRepository.findByCompanyId(companyId);
    }

    public List<Shipment> getShipmentsByStatus(String status) {
        try {
            ShipmentStatus shipmentStatus = ShipmentStatus.valueOf(status.toUpperCase());
            return shipmentRepository.findByStatus(shipmentStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status);
        }
    }

    public Shipment updateShipment(String id, Shipment updated) {
        Shipment existing = getShipmentById(id);

        // Only allow updates if shipment is still OPEN
        if (existing.getStatus() != ShipmentStatus.OPEN) {
            throw new RuntimeException("Cannot update shipment that is already " + existing.getStatus());
        }

        existing.setOriginCity(updated.getOriginCity());
        existing.setDestinationCity(updated.getDestinationCity());
        existing.setDistanceKm(updated.getDistanceKm());
        existing.setCargoType(updated.getCargoType());
        existing.setWeightKg(updated.getWeightKg());
        existing.setFragile(updated.isFragile());
        existing.setHazardous(updated.isHazardous());
        existing.setRequiresRefrigeration(updated.isRequiresRefrigeration());
        existing.setDeadlineDate(updated.getDeadlineDate());
        existing.setBudgetAmount(updated.getBudgetAmount());
        existing.setPriorityType(updated.getPriorityType());

        return shipmentRepository.save(existing);
    }

    @Transactional
    public Shipment assignDriver(String shipmentId, String driverId) {
        Shipment shipment = getShipmentById(shipmentId);

        if (shipment.getStatus() != ShipmentStatus.OPEN) {
            throw new RuntimeException("Driver can only be assigned to OPEN shipments");
        }

        try {
            userServiceClient.getDriverById(driverId);
        } catch (Exception e) {
            throw new RuntimeException("Validation failed: Driver with ID " + driverId + " does not exist.");
        }

        shipment.setAssignedDriverId(driverId);
        shipment.setStatus(ShipmentStatus.ASSIGNED);

        Shipment savedShipment = shipmentRepository.save(shipment);

        userServiceClient.incrementAcceptedTrips(driverId);

        return savedShipment;
    }

    @Transactional
    public Shipment updateStatus(String id, String status) {
        Shipment shipment = getShipmentById(id);

        ShipmentStatus newStatus;
        try {
            newStatus = ShipmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status);
        }

        // Enforce valid status transitions
        validateStatusTransition(shipment.getStatus(), newStatus);

        shipment.setStatus(newStatus);
        Shipment savedShipment = shipmentRepository.save(shipment);

        // SIDE EFFECTS: Update User_Service based on new status
        if (newStatus == ShipmentStatus.DELIVERED && savedShipment.getAssignedDriverId() != null) {
            userServiceClient.incrementCompletedTrips(savedShipment.getAssignedDriverId());
        }
        else if (newStatus == ShipmentStatus.CANCELLED && savedShipment.getAssignedDriverId() != null) {
            userServiceClient.incrementCancelledTrips(savedShipment.getAssignedDriverId());
        }

        return savedShipment;
    }

    public void deleteShipment(String id) {
        Shipment shipment = getShipmentById(id);

        if (shipment.getStatus() == ShipmentStatus.IN_TRANSIT) {
            throw new RuntimeException("Cannot delete a shipment that is currently IN_TRANSIT");
        }

        shipmentRepository.deleteById(id);
    }

    private void validateStatusTransition(ShipmentStatus current, ShipmentStatus next) {
        boolean valid = switch (current) {
            case ShipmentStatus.OPEN       -> next == ShipmentStatus.ASSIGNED   || next == ShipmentStatus.CANCELLED;
            case ShipmentStatus.ASSIGNED   -> next == ShipmentStatus.IN_TRANSIT || next == ShipmentStatus.CANCELLED;
            case ShipmentStatus.IN_TRANSIT -> next == ShipmentStatus.DELIVERED  || next == ShipmentStatus.CANCELLED;
            case ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED -> false; // terminal states
        };

        if (!valid) {
            throw new RuntimeException("Invalid status transition: " + current + " → " + next);
        }
    }
}
