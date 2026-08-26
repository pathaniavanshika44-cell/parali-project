package com.paralisetu.dto;

public class RequestDTO {
    private String farmerId;  // string from frontend, will convert to UUID in service
    private String cbgId;
    private String farmerName;
    private String phone;
    private String address;
    private String cropType;
    private double quantity;
    private String slot;
    private Double latitude;
    private Double longitude;

    // Getters and Setters
    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }

    public String getCbgId() { return cbgId; }
    public void setCbgId(String cbgId) { this.cbgId = cbgId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCropType() { return cropType; }
    public void setCropType(String cropType) { this.cropType = cropType; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}