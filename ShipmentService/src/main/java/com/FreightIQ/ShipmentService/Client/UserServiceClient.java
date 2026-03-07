package com.FreightIQ.ShipmentService.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service", url = "${user-service.url}")
public interface UserServiceClient {

    @GetMapping("/api/drivers/{id}")
    Object getDriverById(@PathVariable String id);

    @GetMapping("/api/companies/{id}")
    Object getCompanyById(@PathVariable String id);

    // Called after review is submitted
    @PatchMapping("/api/drivers/{id}/rating")
    Object updateDriverRating(@PathVariable String id, @RequestParam Double newRating);

    @PatchMapping("/api/drivers/{id}/trips/completed")
    Object incrementCompletedTrips(@PathVariable String id);

    @PatchMapping("/api/drivers/{id}/trips/cancelled")
    Object incrementCancelledTrips(@PathVariable String id);

    @PatchMapping("/api/drivers/{id}/trips/delayed")
    Object incrementDelayedTrips(@PathVariable String id);

    @PatchMapping("/api/drivers/{id}/trips/accepted")
    Object incrementAcceptedTrips(@PathVariable String id);

}
