package com.paralisetu.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.UUID;
import java.time.LocalDate;

@Entity
@Table(name = "cbg_details")
public class CBGPlant {

    @Id
    private UUID id;

    @JsonProperty("user_id")
    private UUID userId;
    @JsonProperty("name_of_the_plant")
    private String name_of_the_plant;



    private String address;
    private String district;
    private String state;
    private Double slot1Capacity;
    private Double slot2Capacity;

    private Double slot1Remaining;
    private Double slot2Remaining;

private LocalDate lastResetDate;
    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("feedstock_capacity")
    private Double feedstockCapacity;

    @Transient
    private Double distanceToFarmer;

    @Transient
    private Double roadDistance;

    @Transient
    private String routeCoordinates;

    // ---------------- GETTERS ----------------
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getName_of_the_plant() { return name_of_the_plant; }
    public String getAddress() { return address; }
    public String getDistrict() { return district; }
    public String getState() { return state; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public Double getFeedstockCapacity() { return feedstockCapacity; }
    public Double getDistanceToFarmer() { return distanceToFarmer; }
    public Double getRoadDistance() { return roadDistance; }
    public String getRouteCoordinates() { return routeCoordinates; }
    public Double getSlot1Capacity() { return slot1Capacity; }
public Double getSlot2Capacity() { return slot2Capacity; }

public Double getSlot1Remaining() { return slot1Remaining; }
public Double getSlot2Remaining() { return slot2Remaining; }

public LocalDate getLastResetDate() { return lastResetDate; }
    // ---------------- SETTERS ----------------
    public void setId(UUID id) { this.id = id; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setName_of_the_plant(String name_of_the_plant) { this.name_of_the_plant = name_of_the_plant; }
    public void setAddress(String address) { this.address = address; }
    public void setDistrict(String district) { this.district = district; }
    public void setState(String state) { this.state = state; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setFeedstockCapacity(Double feedstockCapacity) { this.feedstockCapacity = feedstockCapacity; }
    public void setDistanceToFarmer(Double distanceToFarmer) { this.distanceToFarmer = distanceToFarmer; }
    public void setRoadDistance(Double roadDistance) { this.roadDistance = roadDistance; }
    public void setRouteCoordinates(String routeCoordinates) { this.routeCoordinates = routeCoordinates; }
    public void setSlot1Capacity(Double slot1Capacity) { this.slot1Capacity = slot1Capacity; }
public void setSlot2Capacity(Double slot2Capacity) { this.slot2Capacity = slot2Capacity; }

public void setSlot1Remaining(Double slot1Remaining) { this.slot1Remaining = slot1Remaining; }
public void setSlot2Remaining(Double slot2Remaining) { this.slot2Remaining = slot2Remaining; }

public void setLastResetDate(LocalDate lastResetDate) { this.lastResetDate = lastResetDate; }
}