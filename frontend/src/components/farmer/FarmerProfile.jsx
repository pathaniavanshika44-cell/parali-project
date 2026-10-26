import { useState } from "react";
import { supabase } from "../../supabaseClient"; // make sure your Supabase client is set up
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

  const saveProfile = async () => {
    // Get logged-in user (v2 syntax)
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Login required to save profile");
      return;
    }

    const { data, error } = await supabase
      .from("farmers_details")
      .upsert({
        user_id: user.id,
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        land_area: parseFloat(profile.land),
        land_type: profile.landType
      })
      .select();

    if (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } else {
      console.log("Profile saved:", data);
      alert("Profile saved successfully ✅");
    }
  };

  return (
    <div className="farmer-card">
      <h2>👨‍🌾 Farmer Profile</h2>
      <div className="farmer-form">
        <input
          name="name"
          placeholder="Full Name"
          value={profile.name}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone Number"
          value={profile.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Permanent Address"
          value={profile.address}
          onChange={handleChange}
        />
        <input
          name="land"
          placeholder="Land Area (Acres)"
          value={profile.land}
          onChange={handleChange}
        />
        <select
          name="landType"
          value={profile.landType}
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