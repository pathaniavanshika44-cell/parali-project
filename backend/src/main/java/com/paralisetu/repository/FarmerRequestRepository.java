package com.paralisetu.repository;

import com.paralisetu.model.FarmerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FarmerRequestRepository extends JpaRepository<FarmerRequest, UUID> {

    // Existing methods
    List<FarmerRequest> findByCbgId(UUID cbgId);
    List<FarmerRequest> findByCbgIdAndStatus(UUID cbgId, String status);

    // ✅ NEW (for farmer requests fetch)
    List<FarmerRequest> findByFarmerId(UUID farmerId);
}