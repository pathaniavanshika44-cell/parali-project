import { useState } from "react";
import "../../styles/farmer.css";

function FarmerProfile() {

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    land: "",
    landType: ""
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const saveProfile = () => {
    // Later send to backend
  };

  return (

    <div className="farmer-card">

      <h2>👨‍🌾 Farmer Profile</h2>

      <div className="farmer-form">

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
        />

        <input
          name="address"
          placeholder="Permanent Address"
          onChange={handleChange}
        />

        <input
          name="land"
          placeholder="Land Area (Acres)"
          onChange={handleChange}
        />

        <select
          name="landType"
          onChange={handleChange}
        >
          <option value="">Land Type</option>
          <option value="owner">Owner</option>
          <option value="rented">Rented</option>
        </select>

        <button className="green-btn" onClick={saveProfile}>
          Save Profile
        </button>

      </div>

    </div>

  );
}

export default FarmerProfile;