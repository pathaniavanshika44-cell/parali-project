package com.paralisetu.controller;

import com.paralisetu.model.CBGPlant;
import com.paralisetu.model.FarmerRequest;
import com.paralisetu.repository.FarmerRequestRepository;
import com.paralisetu.service.CBGService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/farmer")
@CrossOrigin(origins = "http://localhost:5173")
public class FarmerController {

    @Autowired
    private CBGService cbgService;

    @Autowired
    private FarmerRequestRepository requestRepository;

    // ✅ 1. Search Top 5 CBGs
    @PostMapping("/search-cbg")
    public List<CBGPlant> getTopCBGs(@RequestBody FarmerRequest request) {
        return cbgService.getTop5CBGs(request);
    }

    // ✅ 2. Create Request to CBG
    @PostMapping("/request-cbg")
    public FarmerRequest createRequest(@RequestBody FarmerRequest request) {

        System.out.println("🔥 REQUEST RECEIVED: " + request.getFarmerName());

        if (request.getFarmerId() == null || request.getCbgId() == null) {
            throw new RuntimeException("FarmerId or CBGId missing");
        }

        FarmerRequest saved = requestRepository.save(request);

        System.out.println("✅ SAVED TO DB: " + saved.getId());

        return saved;
    }

    // ✅ 3. Get all requests of a farmer (FIXED)
    @GetMapping("/requests/farmer/{farmerId}")
    public List<FarmerRequest> getRequestsByFarmer(@PathVariable UUID farmerId) {

        System.out.println("📥 Fetching requests for farmerId: " + farmerId);

        return requestRepository.findByFarmerId(farmerId);
    }
}