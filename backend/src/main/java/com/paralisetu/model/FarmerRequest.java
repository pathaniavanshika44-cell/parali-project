package com.paralisetu.model;
import java.time.LocalDate;
import jakarta.persistence.*;
import java.util.UUID;
@Entity
@Table(name = "requests")
public class FarmerRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "farmer_id")
    private UUID farmerId;

    @Column(name = "cbg_id")
    private UUID cbgId;
    private LocalDate requestDate;
    @Column(name = "farmer_name")
    private String farmerName;

    private String message;

    private String phone;
    private String address;

    @Column(name = "crop_type")
    private String cropType;

    private Double quantity;
    private String slot;
    private Double latitude;
    private Double longitude;

    private String status = "submitted";

    // Getters
    public UUID getId() { return id; }
    public UUID getFarmerId() { return farmerId; }
    public UUID getCbgId() { return cbgId; }
    public String getFarmerName() { return farmerName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getCropType() { return cropType; }
    public Double getQuantity() { return quantity; }
    public String getSlot() { return slot; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getStatus() { return status; }
    public String getMessage() { return message; }
    public LocalDate getRequestDate() { return requestDate; }

    // Setters
    public void setId(UUID id) { this.id = id; }
    public void setFarmerId(UUID farmerId) { this.farmerId = farmerId; }
    public void setCbgId(UUID cbgId) { this.cbgId = cbgId; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
    public void setCropType(String cropType) { this.cropType = cropType; }
    public void setQuantity(Double quantity) {
        this.quantity = quantity != null ? quantity : 0.0;
    }
    public void setSlot(String slot) { this.slot = slot; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setStatus(String status) { this.status = status; }
    public void setMessage(String message) { this.message = message; }
    public void setRequestDate(LocalDate requestDate) { this.requestDate = requestDate; }
}