import { useState } from "react";
import { supabase } from "../../supabaseClient";
import "../../styles/farmer.css";

function CBGProfile() {

  const [formData, setFormData] = useState({
    name_of_the_plant: "",
    name_of_the_entity: "",
    address: "",
    state: "",
    longitude: "",
    latitude: "",
    feedstock_capacity: "",
    plant_id: "",
    district: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Insert data into Supabase
    const { data, error } = await supabase
      .from("cbg_plants")
      .insert([formData]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("CBG Plant added successfully ✅");
      setFormData({
        name_of_the_plant: "",
        name_of_the_entity: "",
        address: "",
        state: "",
        longitude: "",
        latitude: "",
        feedstock_capacity: "",
        plant_id: "",
        district: ""
      });
    }
  };

  return (
    <div className="farmer-card">

      <h2>🏭 Add CBG Plant Details</h2>

      <form className="farmer-form" onSubmit={handleSubmit}>

        <input
          name="name_of_the_plant"
          placeholder="Name of the Plant"
          value={formData.name_of_the_plant}
          onChange={handleChange}
        />

        <input
          name="name_of_the_entity"
          placeholder="Name of the Entity"
          value={formData.name_of_the_entity}
          onChange={handleChange}
        />

        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />

        <input
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
        />

        <input
          name="longitude"
          placeholder="Longitude"
          value={formData.longitude}
          onChange={handleChange}
        />

        <input
          name="latitude"
          placeholder="Latitude"
          value={formData.latitude}
          onChange={handleChange}
        />

        <input
          name="feedstock_capacity"
          placeholder="Feedstock Capacity (Tons/day)"
          value={formData.feedstock_capacity}
          onChange={handleChange}
        />

        <input
          name="plant_id"
          placeholder="Plant ID"
          value={formData.plant_id}
          onChange={handleChange}
        />

        <input
          name="district"
          placeholder="District"
          value={formData.district}
          onChange={handleChange}
        />

        <button className="green-btn" type="submit">
          Add CBG Plant
        </button>

      </form>

      {message && <p style={{ marginTop: "15px", color: "#2E7D32" }}>{message}</p>}

    </div>
  );
}

export default CBGProfile;