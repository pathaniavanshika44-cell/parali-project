package com.paralisetu.controller;

import com.paralisetu.model.FarmerRequest;
import com.paralisetu.service.CBGService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.*;

@RestController
@RequestMapping("/api/cbg")
@CrossOrigin(origins = "http://localhost:5173")
public class CBGDashboardController {
    @GetMapping("/{cbgId}/dashboard")
    public Map<String, Object> getDashboard(@PathVariable UUID cbgId) {
    return cbgService.getDashboardData(cbgId);
    }
    @Autowired
    private CBGService cbgService;

    @GetMapping("/{cbgId}/requests")
    public List<FarmerRequest> getRequests(@PathVariable UUID cbgId) {
        return cbgService.getRequestsForCBG(cbgId);
    }

    @GetMapping("/{cbgId}/requests/status")
    public List<FarmerRequest> getRequestsByStatus(
            @PathVariable UUID cbgId,
            @RequestParam String status) {
        return cbgService.getRequestsByStatus(cbgId, status);
    }
     @PatchMapping("/requests/{requestId}/status")
    public FarmerRequest updateRequestStatus(
            @PathVariable UUID requestId,
            @RequestParam String status) {

        return cbgService.updateRequestStatus(requestId, status);
    }
}