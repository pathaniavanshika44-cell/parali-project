package com.paralisetu.service;

import com.paralisetu.model.FarmerRequest;
import com.paralisetu.model.CBGPlant;
import com.paralisetu.repository.CBGPlantRepository;
import com.paralisetu.repository.FarmerRequestRepository;
import com.paralisetu.utils.SupabaseClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDate;
import java.util.*;

@Service
public class CBGService {

    @Autowired
    private FarmerRequestRepository requestRepository;
    @Autowired
    private CBGPlantRepository cbgRepository;
    @Autowired
    private HaversineService haversineService;   // ✅ ADDED

    @Autowired
    private ORSService orsService;               // ✅ ADDED

    // Get all requests for a CBG
    public List<FarmerRequest> getRequestsForCBG(UUID cbgId) {
        return requestRepository.findByCbgId(cbgId);
    }

    // Filter by status
    public List<FarmerRequest> getRequestsByStatus(UUID cbgId, String status) {
        return requestRepository.findByCbgIdAndStatus(cbgId, status.toLowerCase());
    }

    // ✅ Top 5 CBG recommendation (FIXED)
    public List<CBGPlant> getTop5CBGs(FarmerRequest request) {

        List<CBGPlant> allCBGs = SupabaseClient.fetchAllCBGs();
if (allCBGs == null || allCBGs.isEmpty()) {
    return new ArrayList<>();
}

        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new RuntimeException("Farmer location required");
        }

        double farmerLat = request.getLatitude();
        double farmerLng = request.getLongitude();

        // ✅ STEP 1: Get nearest 7 using Haversine (FAST)
        List<CBGPlant> nearestCBGs = haversineService.getNearestCBGs(
                farmerLat,
                farmerLng,
                allCBGs,
                7
        );

        // ✅ STEP 2: Call ORS for real road distance
        for (CBGPlant cbg : nearestCBGs) {
            try {
                Map<String, Object> route = orsService.getRoute(
                        farmerLat,
                        farmerLng,
                        cbg.getLatitude(),
                        cbg.getLongitude()
                );

                if (route != null && route.get("distance") != null) {
                    double roadDistance = ((Number) route.get("distance")).doubleValue() / 1000.0; // meters → km
                    cbg.setRoadDistance(roadDistance * 1.6);
                } else {
                    cbg.setRoadDistance(cbg.getDistanceToFarmer()); // fallback
                }

            } catch (Exception e) {
                cbg.setRoadDistance(cbg.getDistanceToFarmer()); // fallback
            }
        }

        // ✅ STEP 3: Sort by road distance (SAFE)
        nearestCBGs.sort(Comparator.comparingDouble(
                cbg -> cbg.getRoadDistance() != null ? cbg.getRoadDistance() : Double.MAX_VALUE
        ));

        // ✅ STEP 4: Return top 5
        return nearestCBGs.subList(0, Math.min(5, nearestCBGs.size()));
    }
     public FarmerRequest updateRequestStatus(UUID requestId, String newStatus) {
        Optional<FarmerRequest> optionalRequest = requestRepository.findById(requestId);

        if (optionalRequest.isEmpty()) {
            throw new RuntimeException("Request not found");
        }

        FarmerRequest request = optionalRequest.get();

        String statusLower = newStatus.toLowerCase();
        if (!List.of("pending", "accepted", "rejected", "completed").contains(statusLower)) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        request.setStatus(statusLower);
        return requestRepository.save(request);
    }


    public Map<String, Object> getDashboardData(UUID cbgId) {

    List<FarmerRequest> allRequests = requestRepository.findByCbgId(cbgId);

    LocalDate today = LocalDate.now();

    double submittedToday = 0;
    double completedToday = 0;

    for (FarmerRequest req : allRequests) {

        // ✅ FILTER ONLY TODAY
        if (req.getRequestDate() != null && req.getRequestDate().equals(today)) {

            submittedToday += req.getQuantity();

            if ("completed".equals(req.getStatus())) {
                completedToday += req.getQuantity();
            }
        }
    }

    // ✅ FETCH PLANT
    CBGPlant plant = cbgRepository.findById(cbgId)
            .orElseThrow(() -> new RuntimeException("CBG not found"));

    double slot1Remaining = plant.getSlot1Remaining() != null ? plant.getSlot1Remaining() : 0;
    double slot2Remaining = plant.getSlot2Remaining() != null ? plant.getSlot2Remaining() : 0;

    double remainingTotal = slot1Remaining + slot2Remaining;

    // ✅ RESPONSE
    Map<String, Object> result = new HashMap<>();
    result.put("submittedToday", submittedToday);
    result.put("completedToday", completedToday);
    result.put("remainingCapacity", remainingTotal);
    result.put("slot1Remaining", slot1Remaining);
    result.put("slot2Remaining", slot2Remaining);

    return result;
}
}