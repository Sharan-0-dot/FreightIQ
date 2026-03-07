package com.FreightIQ.ShipmentService.Enums;

public enum BidStatus {
    PENDING,    // just submitted, awaiting company decision
    ACCEPTED,   // company accepted this bid
    REJECTED,   // company rejected this bid
    WITHDRAWN   // driver withdrew their own bid
}
