package com.paralisetu.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class ORSService {

    private static final String API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjUwNjU4MTA5ZTZiMWNiNmEyOGYzZTcyMTE2Njk3NTNiYTU4ODMzYTM1MDIxZjBlOTcwZDYwYzFkIiwiaCI6Im11cm11cjY0In0=";

    public Map<String, Object> getRoute(double lat1, double lon1, double lat2, double lon2) {

    try {
        String url = "https://api.openrouteservice.org/v2/directions/driving-car";

        RestTemplate restTemplate = new RestTemplate();

        // Request body
        Map<String, Object> body = new HashMap<>();
        body.put("coordinates", Arrays.asList(
                Arrays.asList(lon1, lat1),
                Arrays.asList(lon2, lat2)
        ));

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", API_KEY);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        System.out.println("ORS CALLED 🔥");

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, request, Map.class);

        Map<String, Object> responseBody = response.getBody();

        if (responseBody == null || !responseBody.containsKey("features")) {
            return null;
        }

        // ✅ Correct extraction
        List<Map<String, Object>> features =
                (List<Map<String, Object>>) responseBody.get("features");

        if (features.isEmpty()) return null;

        Map<String, Object> feature = features.get(0);
        Map<String, Object> properties =
                (Map<String, Object>) feature.get("properties");

        Map<String, Object> summary =
                (Map<String, Object>) properties.get("summary");

        double distance = ((Number) summary.get("distance")).doubleValue(); // meters

        // Geometry (optional)
        Map<String, Object> geometry =
                (Map<String, Object>) feature.get("geometry");

        // Final result
        Map<String, Object> result = new HashMap<>();
        result.put("distance", distance);
        result.put("geometry", geometry);

        return result;

    } catch (Exception e) {
        System.out.println("❌ ORS FAILED: " + e.getMessage());
        return null;
    }
}
}