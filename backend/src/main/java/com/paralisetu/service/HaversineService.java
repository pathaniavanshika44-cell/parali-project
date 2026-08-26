package com.paralisetu.service;

import com.paralisetu.model.CBGPlant;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class HaversineService {

    private static final double EARTH_RADIUS = 6371; // km

    // ✅ Calculate distance between 2 lat/lng points
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    // ✅ Get N nearest CBG plants
    public List<CBGPlant> getNearestCBGs(
        double farmerLat,
        double farmerLng,
        List<CBGPlant> cbgs,
        int limit
) {

    List<CBGPlant> validCBGs = new ArrayList<>();

    for (CBGPlant cbg : cbgs) {

        if (cbg.getLatitude() == null || cbg.getLongitude() == null) {
            continue; // skip invalid
        }

        double distance = calculateDistance(
                farmerLat,
                farmerLng,
                cbg.getLatitude(),
                cbg.getLongitude()
        );

        cbg.setDistanceToFarmer(distance);
        validCBGs.add(cbg); // ✅ ONLY add valid ones
    }

    // sort ONLY valid ones
    validCBGs.sort(Comparator.comparingDouble(CBGPlant::getDistanceToFarmer));

    return validCBGs.subList(0, Math.min(limit, validCBGs.size()));
}
}