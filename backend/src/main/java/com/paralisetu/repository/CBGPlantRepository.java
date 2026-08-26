package com.paralisetu.repository;

import com.paralisetu.model.CBGPlant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CBGPlantRepository extends JpaRepository<CBGPlant, UUID> {

    Optional<CBGPlant> findByUserId(UUID userId);

}