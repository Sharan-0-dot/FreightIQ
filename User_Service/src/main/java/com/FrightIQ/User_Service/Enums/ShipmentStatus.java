package com.FrightIQ.User_Service.Enums;

public enum ShipmentStatus {
    OPEN,          // Just posted, accepting bids
    ASSIGNED,      // Driver selected
    IN_TRANSIT,    // Pickup done, en route
    DELIVERED,     // Successfully completed
    CANCELLED      // Cancelled by company or driver
}
