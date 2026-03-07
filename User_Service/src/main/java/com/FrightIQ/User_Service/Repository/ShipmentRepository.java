package com.FrightIQ.User_Service.Repository;

import com.FrightIQ.User_Service.Entities.Shipment;
import com.FrightIQ.User_Service.Enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, String> {
    List<Shipment> findByCompanyId(String companyId);
    List<Shipment> findByStatus(ShipmentStatus status);
    List<Shipment> findByAssignedDriverId(String driverId);
}
