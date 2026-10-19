import React, { useState, useEffect } from "react";
import "../../styles/requestCBG.css";
const RequestToCBG = ({ onSubmitRequest }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cropType, setCropType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);

  // Use browser geolocation to get address
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // You can use reverse geocoding here (e.g., OpenStreetMap API)
          setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        },
        () => {
          setAddress("Location not available");
        }
      );
    } else {
      setAddress("Geolocation not supported");
    }
  }, []);

  // Determine slot automatically based on current time
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    if (hours >= 1 && hours < 12) {
      setSlot("Slot 1 (1AM-12PM)");
    } else if (hours >= 12 && hours < 19) {
      setSlot("Slot 2 (12PM-7PM)");
    } else {
      setSlot("Slot 2 (12PM-7PM)"); // If outside, default to slot 2
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !phone || !cropType || !quantity) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    // Simulate CBG acceptance and capacity check
    setTimeout(() => {
      // You can also add logic for slot capacity here if needed
      onSubmitRequest(slot, quantity);
      setLoading(false);
      alert(`Request submitted!\nSlot: ${slot}\nQuantity: ${quantity} kg`);
      // Reset form
      setName("");
      setPhone("");
      setCropType("");
      setQuantity("");
    }, 1000); // simulate network delay
  };

  return (
    <div className="request-form">
      <h2>Request CBG Slot</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          type="text"
          placeholder="Farmer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Phone Number</label>
        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <label>Address</label>
        <input type="text" value={address} readOnly />

        <label>Crop Type</label>
        <input
          type="text"
          placeholder="e.g., Wheat, Rice"
          value={cropType}
          onChange={(e) => setCropType(e.target.value)}
          required
        />

        <label>Quantity (kg)</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          required
        />

        <label>Slot</label>
        <input type="text" value={slot} readOnly />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestToCBG;