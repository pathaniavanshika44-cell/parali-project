import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "../../styles/farmer.css";

function CBGProfile({ userId }) { // pass current CBG user id as prop

  const [formData, setFormData] = useState({
    name_of_the_plant: "",
    name_of_the_entity: "",
    address: "",
    state: "",
    longitude: "",
    latitude: "",
    feedstock_capacity: "",
    district: ""
  });

  const [message, setMessage] = useState("");
  const [recordId, setRecordId] = useState(null); // for updates

  useEffect(() => {
    // Fetch CBG details if already present
    const fetchCBGDetails = async () => {
      const { data, error } = await supabase
        .from("cbg_details")
        .select("*")
        .eq("user_id", userId)
        .single(); // fetch single record

      if (error && error.code !== "PGRST116") {
        console.error("Fetch error:", error);
      } else if (data) {
        setFormData({
          name_of_the_plant: data.name_of_the_plant || "",
          name_of_the_entity: data.name_of_the_entity || "",
          address: data.address || "",
          state: data.state || "",
          longitude: data.longitude || "",
          latitude: data.latitude || "",
          feedstock_capacity: data.feedstock_capacity || "",
          district: data.district || ""
        });
        setRecordId(data.id);
      }
    };

    fetchCBGDetails();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (recordId) {
      // Update existing record
      const { error } = await supabase
        .from("cbg_details")
        .update(formData)
        .eq("id", recordId);

      if (error) setMessage(`Error: ${error.message}`);
      else setMessage("CBG Plant updated successfully ✅");
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("cbg_details")
        .insert([{ ...formData, user_id: userId }]);

      if (error) setMessage(`Error: ${error.message}`);
      else {
        setMessage("CBG Plant added successfully ✅");
        setRecordId(data[0].id);
      }
    }
  };

  return (
    <div className="farmer-card">

      <h2>🏭 CBG Plant Profile</h2>

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
          name="district" 
          placeholder="District" 
          value={formData.district} 
          onChange={handleChange} 
        />

        <button className="green-btn" type="submit">
          {recordId ? "Update CBG Plant" : "Add CBG Plant"}
        </button>

      </form>

      {message && <p style={{ marginTop: "15px", color: "#2E7D32" }}>{message}</p>}

    </div>
  );
}

export default CBGProfile;