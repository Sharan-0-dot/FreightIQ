package com.FreightIQ.ShipmentService.Repository;


import com.FreightIQ.ShipmentService.Enums.ShipmentStatus;
import com.FreightIQ.ShipmentService.Entities.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, String> {
    List<Shipment> findByCompanyId(String companyId);
    List<Shipment> findByStatus(ShipmentStatus status);
    List<Shipment> findByAssignedDriverId(String driverId);
}
