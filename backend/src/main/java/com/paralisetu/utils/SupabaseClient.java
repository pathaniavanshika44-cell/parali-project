package com.paralisetu.utils;

import com.paralisetu.model.CBGPlant;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

public class SupabaseClient {

    private static final String SUPABASE_URL =
            "https://gpcsjdyhvtofysxdpomo.supabase.co/rest/v1/cbg_details?select=*";
    private static final String SUPABASE_KEY =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwY3NqZHlodnRvZnlzeGRwb21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjY5ODgsImV4cCI6MjA4ODc0Mjk4OH0.8kOg3fLTkU10QjqmLobsYOsdpeL3BkIwlN1hB17rUxk";

    // Fetch all CBGs from Supabase
    public static List<CBGPlant> fetchAllCBGs() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", SUPABASE_KEY);
            headers.set("Authorization", "Bearer " + SUPABASE_KEY);
            headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(
                    SUPABASE_URL,
                    HttpMethod.GET,
                    entity,
                    List.class
            );

            List<Map<String, Object>> data = response.getBody();
            List<CBGPlant> result = new ArrayList<>();

            if (data != null) {
                for (Map<String, Object> item : data) {
                    CBGPlant cbg = new CBGPlant();

                    // Set UUID fields
                    if (item.get("id") != null)
                        cbg.setId(UUID.fromString(item.get("id").toString()));
                    if (item.get("user_id") != null)
                        cbg.setUserId(UUID.fromString(item.get("user_id").toString()));

                    // Set Strings
                    cbg.setName_of_the_plant(
    item.get("name_of_the_plant") != null 
        ? item.get("name_of_the_plant").toString() 
        : null
);
                    cbg.setAddress(item.get("address") != null ? item.get("address").toString() : null);
                    cbg.setDistrict(item.get("district") != null ? item.get("district").toString() : null);
                    cbg.setState(item.get("state") != null ? item.get("state").toString() : null);

                    // Set Doubles
                    cbg.setLatitude(item.get("latitude") != null ? ((Number) item.get("latitude")).doubleValue() : null);
                    cbg.setLongitude(item.get("longitude") != null ? ((Number) item.get("longitude")).doubleValue() : null);
                    cbg.setFeedstockCapacity(item.get("feedstock_capacity") != null ? ((Number) item.get("feedstock_capacity")).doubleValue() : null);

                    result.add(cbg);
                }
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // Fetch CBG by email
    public static CBGPlant fetchCBGByEmail(String email) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", SUPABASE_KEY);
            headers.set("Authorization", "Bearer " + SUPABASE_KEY);
            headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = SUPABASE_URL + "&email=eq." + email;

            ResponseEntity<CBGPlant[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    CBGPlant[].class
            );

            CBGPlant[] body = response.getBody();
            return (body == null || body.length == 0) ? null : body[0];

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}