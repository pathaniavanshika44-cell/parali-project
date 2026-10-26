// import React, { useState, useEffect } from "react";
// import "../../styles/requestCBG.css";
// import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
// import { supabase } from "../../supabaseClient"; // your Supabase v2 client

// const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjUwNjU4MTA5ZTZiMWNiNmEyOGYzZTcyMTE2Njk3NTNiYTU4ODMzYTM1MDIxZjBlOTcwZDYwYzFkIiwiaCI6Im11cm11cjY0In0=";

// const RequestToCBG = ({ onSubmitRequest }) => {
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [address, setAddress] = useState("");
//   const [cropType, setCropType] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [slot, setSlot] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);

//   const [farmerId, setFarmerId] = useState(null);
//   const [topCBGs, setTopCBGs] = useState([]);
//   const [selectedRoute, setSelectedRoute] = useState(null);
//   const [requestLoadingId, setRequestLoadingId] = useState(null);

//   const [myRequests, setMyRequests] = useState([]); // Farmer's request status

//   const [notification, setNotification] = useState("");

  
//   // ================== Fetch Farmer ID ==================
//   useEffect(() => {
//     const fetchFarmerId = async () => {
//       const {
//         data: { user },
//         error: userError,
//       } = await supabase.auth.getUser();

//       if (userError || !user) {
//         alert("Login required!");
//         return;
//       }

//       const { data, error } = await supabase
//         .from("farmers_details")
//         .select("id")
//         .eq("user_id", user.id)
//         .single();

//       if (error) {
//         console.error("Error fetching farmer ID:", error);
//         alert("You need to save your profile first!");
//       } else {
//         setFarmerId(data.id);
//       }
//     };

//     fetchFarmerId();
//   }, []);

//   // ================== Fetch Farmer Location ==================
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const lat = pos.coords.latitude;
//           const lng = pos.coords.longitude;
//           setLatitude(lat);
//           setLongitude(lng);
//           setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
//         },
//         () => setAddress("Location not available")
//       );
//     } else {
//       setAddress("Geolocation not supported");
//     }
//   }, []);

//   // ================== Auto Slot ==================
//   useEffect(() => {
//     const now = new Date();
//     const hours = now.getHours();
//     if (hours >= 1 && hours < 12)
//       setSlot("Slot 1 (1AM – 12PM) → Morning");
//     else if (hours >= 12 && hours <= 19)
//       setSlot("Slot 2 (12PM – 7PM) → Evening");
//     else
//       setSlot("Slot 3 (7PM – 12AM) → Night");
//   }, []);

//   // ================== Fetch Farmer Requests ==================
//   const fetchFarmerRequests = async () => {
//     if (!farmerId) return;

//     try {
//       const res = await fetch(`http://localhost:8080/api/farmer/requests/farmer/${farmerId}`);
//       const data = await res.json();
//       setMyRequests(data);
//     } catch (err) {
//       console.error("Error fetching farmer requests:", err);
//     }
//   };

//   // Polling every 10 seconds for updates
//   useEffect(() => {
//     fetchFarmerRequests();
//     const interval = setInterval(fetchFarmerRequests, 10000);
//     return () => clearInterval(interval);
//   }, [farmerId]);

//   // ================== Fetch ORS Route ==================
//   const fetchRouteORSM = async (cbg) => {
//     if (!latitude || !longitude) return;

//     const coordinates = [
//       [longitude, latitude],
//       [cbg.longitude, cbg.latitude],
//     ];

//     try {
//       const res = await fetch(
//         "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
//         {
//           method: "POST",
//           headers: {
//             Authorization: ORS_API_KEY,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ coordinates }),
//         }
//       );

//       const data = await res.json();
//       if (data.features && data.features[0].geometry.coordinates.length > 0) {
//         setSelectedRoute(data.features[0].geometry.coordinates);
//       } else {
//         alert("No route found.");
//       }
//     } catch (err) {
//       console.error("ORS routing error:", err);
//       alert("Failed to fetch route from ORS");
//     }
//   };

//   // ================== Send Request to CBG ==================
//   const handleRequestCBG = async (cbg) => {
//     if (!farmerId) {
//       alert("You need to save your profile first!");
//       return;
//     }

//     if (!name || !phone || !cropType || !quantity) {
//       alert("Please fill form first before requesting");
//       return;
//     }

//     try {
//       setRequestLoadingId(cbg.id);

//       const response = await fetch(
//         "http://localhost:8080/api/farmer/request-cbg",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             farmerId,
//             cbgId: cbg.id,
//             farmerName: name,
//             phone,
//             address,
//             cropType,
//             quantity: parseFloat(quantity),
//             slot,
//             latitude,
//             longitude,
//           }),
//         }
//       );

//       if (!response.ok) throw new Error("Request failed");

//       const data = await response.json();
//       console.log("Request success:", data);
//       alert(`Request sent to ${cbg.name_of_the_plant} ✅`);

//       fetchFarmerRequests(); // Refresh farmer requests immediately
//     } catch (error) {
//       console.error(error);
//       alert("Error sending request ❌");
//     } finally {
//       setRequestLoadingId(null);
//     }
//   };

//   // ================== Submit Form ==================
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!name || !phone || !cropType || !quantity) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch("http://localhost:8080/api/farmer/search-cbg", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name,
//           phone,
//           address,
//           cropType,
//           quantity: parseFloat(quantity),
//           slot,
//           latitude,
//           longitude,
//         }),
//       });

//       const data = await response.json();
//       console.log("Top 5 CBG plants:", data);
//       setTopCBGs(data);

//       if (onSubmitRequest) onSubmitRequest(slot, quantity);

//       alert("Request submitted! Top 5 CBGs fetched.");
//     } catch (error) {
//       console.error(error);
//       alert("Server error");
//     }

//     setLoading(false);
//   };

//   // ================== Render ==================
//   return (
//     <div className="request-container">
//       {/* ===== Request Form ===== */}
//       <div className="request-card">
//         <h2>Request CBG Slot</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Name</label>
//             <input
//               type="text"
//               placeholder="Farmer Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>Phone Number</label>
//             <input
//               type="tel"
//               placeholder="Enter phone number"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>Address</label>
//             <input type="text" value={address} readOnly />
//           </div>
//           <div className="form-group">
//             <label>Crop Type</label>
//             <input
//               type="text"
//               placeholder="e.g., Wheat, Rice"
//               value={cropType}
//               onChange={(e) => setCropType(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>Quantity (kg)</label>
//             <input
//               type="number"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               min="1"
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>Slot (Automatically Selected)</label>
//             <input type="text" value={slot} readOnly />
//           </div>
//           <button type="submit" className="btn-submit" disabled={loading}>
//             {loading ? "Submitting..." : "Submit Request"}
//           </button>
//         </form>
//       </div>

//       {/* ===== Top 5 CBGs ===== */}
//       {topCBGs.length > 0 && (
//         <div className="cbg-section">
//           <h3>Top 5 Recommended CBGs</h3>
//           <div className="cbg-grid">
//             {topCBGs.map((cbg, idx) => (
//               <div className="cbg-card" key={idx}>
//                 <div className="cbg-name">{cbg.name_of_the_plant}</div>
//                 <div className="cbg-distance">
//                   {(cbg.roadDistance ?? 0).toFixed(2)} km away
//                 </div>
//                 <div className="cbg-buttons">
//                   <button className="btn-map" onClick={() => fetchRouteORSM(cbg)}>
//                     View Route
//                   </button>
//                   <button
//                     className="btn-request"
//                     onClick={() => handleRequestCBG(cbg)}
//                     disabled={requestLoadingId === cbg.id}
//                   >
//                     {requestLoadingId === cbg.id ? "Sending..." : "Request"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* ===== Map ===== */}
//           {selectedRoute && (
//             <div style={{ height: "400px", marginTop: "20px" }}>
//               <MapContainer
//                 bounds={selectedRoute.map((c) => [c[1], c[0]])}
//                 style={{ height: "100%", width: "100%" }}
//               >
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                 <Polyline
//                   positions={selectedRoute.map((c) => [c[1], c[0]])}
//                   color="blue"
//                 />
//                 <Marker position={[selectedRoute[0][1], selectedRoute[0][0]]}>
//                   <Popup>Start (Farmer)</Popup>
//                 </Marker>
//                 <Marker
//                   position={[
//                     selectedRoute[selectedRoute.length - 1][1],
//                     selectedRoute[selectedRoute.length - 1][0],
//                   ]}
//                 >
//                   <Popup>CBG Station</Popup>
//                 </Marker>
//               </MapContainer>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ===== Farmer's Requests Status ===== */}
//       {myRequests.length > 0 && (
//         <div className="my-requests-section">
//           <h3>My Requests Status</h3>
//           {myRequests.map((req) => (
//             <div key={req.id} className="request-card-status">
//               <p><strong>CBG:</strong> {req.cbgName ?? req.cbgId}</p>
//               <p><strong>Crop:</strong> {req.cropType}</p>
//               <p><strong>Quantity:</strong> {req.quantity} kg</p>
//               <p><strong>Slot:</strong> {req.slot}</p>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 <span className={`status-badge ${req.status}`}>
//                   {req.status.toUpperCase()}
//                 </span>
//               </p>
//               {req.message && <p className="status-message">{req.message}</p>}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RequestToCBG;




















import React, { useState, useEffect } from "react";
import "../../styles/requestCBG.css";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import { supabase } from "../../supabaseClient";

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjUwNjU4MTA5ZTZiMWNiNmEyOGYzZTcyMTE2Njk3NTNiYTU4ODMzYTM1MDIxZjBlOTcwZDYwYzFkIiwiaCI6Im11cm11cjY0In0=";

const RequestToCBG = ({ onSubmitRequest }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cropType, setCropType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [slot, setSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [farmerId, setFarmerId] = useState(null);
  const [topCBGs, setTopCBGs] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [requestLoadingId, setRequestLoadingId] = useState(null);
  const [myRequests, setMyRequests] = useState([]); // Farmer's request status

  // ================== Fetch Farmer ID ==================
  useEffect(() => {
    const fetchFarmerId = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("Login required!");
        return;
      }

      const { data, error } = await supabase
        .from("farmers_details")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching farmer ID:", error);
        alert("You need to save your profile first!");
      } else {
        setFarmerId(data.id);
      }
    };

    fetchFarmerId();
  }, []);

  // ================== Fetch Farmer Location ==================
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        },
        () => setAddress("Location not available")
      );
    } else {
      setAddress("Geolocation not supported");
    }
  }, []);

  // ================== Auto Slot ==================
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    if (hours >= 1 && hours < 12)
      setSlot("Slot 1 (1AM – 12PM) → Morning");
    else if (hours >= 12 && hours <= 19)
      setSlot("Slot 2 (12PM – 7PM) → Evening");
    else setSlot("Slot 3 (7PM – 12AM) → Night");
  }, []);

  // ================== Fetch Farmer Requests ==================
  const fetchFarmerRequests = async () => {
  if (!farmerId) return;

  try {
    const { data, error } = await supabase
      .from("requests")   // ✅ your table name
      .select("*")
      .eq("farmer_id", farmerId);

    if (error) {
      console.error("Supabase fetch error:", error);
      setMyRequests([]);
      return;
    }

    setMyRequests(data || []);
  } catch (err) {
    console.error("Error fetching farmer requests:", err);
    setMyRequests([]);
  }
};

  useEffect(() => {
    fetchFarmerRequests();
    const interval = setInterval(fetchFarmerRequests, 10000);
    return () => clearInterval(interval);
  }, [farmerId]);

  // ================== Fetch ORS Route ==================
  const fetchRouteORSM = async (cbg) => {
    if (!latitude || !longitude) return;

    const coordinates = [
      [longitude, latitude],
      [cbg.longitude, cbg.latitude],
    ];

    try {
      const res = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coordinates }),
        }
      );

      const data = await res.json();
      if (data.features && data.features[0].geometry.coordinates.length > 0) {
        setSelectedRoute(data.features[0].geometry.coordinates);
      } else {
        alert("No route found.");
      }
    } catch (err) {
      console.error("ORS routing error:", err);
      alert("Failed to fetch route from ORS");
    }
  };

  // ================== Send Request to CBG ==================
  const handleRequestCBG = async (cbg) => {
  if (!farmerId) {
    alert("You need to save your profile first!");
    return;
  }

  if (!name || !phone || !cropType || !quantity) {
    alert("Please fill form first before requesting");
    return;
  }

  try {
    setRequestLoadingId(cbg.id);

    const { data, error } = await supabase.from("requests").insert([
      {
        farmer_id: farmerId,
        cbg_id: cbg.id,
        farmer_name: name,
        phone,
        address,
        crop_type: cropType,
        quantity: parseFloat(quantity),
        slot,
        latitude,
        longitude,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      alert("Insert failed ❌");
      return;
    }

    console.log("Saved to Supabase:", data);
    alert(`Request sent to ${cbg.name_of_the_plant} ✅`);

    fetchFarmerRequests(); // refresh
  } catch (err) {
    console.error(err);
    alert("Error sending request ❌");
  } finally {
    setRequestLoadingId(null);
  }
};

  // ================== Submit Form ==================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !cropType || !quantity) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/farmer/search-cbg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          cropType,
          quantity: parseFloat(quantity),
          slot,
          latitude,
          longitude,
        }),
      });

      const data = await response.json();
      setTopCBGs(Array.isArray(data) ? data : []);

      if (onSubmitRequest) onSubmitRequest(slot, quantity);

      alert("Request submitted! Top 5 CBGs fetched.");
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
    setLoading(false);
  };

  // ================== Render ==================
  return (
    <div className="request-container">
      {/* ===== Request Form ===== */}
      <div className="request-card">
        <h2>Request CBG Slot</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Farmer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input type="text" value={address} readOnly />
          </div>

          <div className="form-group">
            <label>Crop Type</label>
            <input
              type="text"
              placeholder="e.g., Wheat, Rice"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity (kg)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Slot (Automatically Selected)</label>
            <input type="text" value={slot} readOnly />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {/* ===== Top 5 CBGs ===== */}
      {topCBGs.length > 0 && (
        <div className="cbg-section">
          <h3>Top 5 Recommended CBGs</h3>
          <div className="cbg-grid">
            {topCBGs.map((cbg, idx) => {
              const request = myRequests.find((r) => r.cbg_id === cbg.id);
              const status = request ? request.status : null;

              return (
                <div className="cbg-card" key={idx}>
                  <div className="cbg-name">{cbg.name_of_the_plant}</div>
                  <div className="cbg-distance">
                    {(cbg.roadDistance ?? 0).toFixed(2)} km away
                  </div>
                  <div className="cbg-buttons">
                    <button className="btn-map" onClick={() => fetchRouteORSM(cbg)}>
                      View Route
                    </button>

                    <button
                      className="btn-request"
                      onClick={() => handleRequestCBG(cbg)}
                      disabled={
                        requestLoadingId === cbg.id || status === "pending"
                      }
                    >
                     {requestLoadingId === cbg.id
                      ? "Sending..."
                      : status === "pending"
                      ? "PENDING"
                      : "Request"}
                    </button>
                  </div>

                 {status && <p className="status-message"></p>}                </div>
              );
            })}
          </div>

          {/* ===== Map ===== */}
          {selectedRoute && (
            <div style={{ height: "400px", marginTop: "20px" }}>
              <MapContainer
                bounds={selectedRoute.map((c) => [c[1], c[0]])}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={selectedRoute.map((c) => [c[1], c[0]])} color="blue" />
                <Marker position={[selectedRoute[0][1], selectedRoute[0][0]]}>
                  <Popup>Start (Farmer)</Popup>
                </Marker>
                <Marker
                  position={[
                    selectedRoute[selectedRoute.length - 1][1],
                    selectedRoute[selectedRoute.length - 1][0],
                  ]}
                >
                  <Popup>CBG Station</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      )}

    
      {/* ===== Farmer's Requests Status ===== */}
{/* ===== Farmer's Requests Status ===== */}
{myRequests.filter((req) => req.status === "pending").length > 0 && (
  <div className="my-requests-section">
    <h3>My Requests Status</h3>

    {myRequests
      .filter((req) => req.status === "pending")
      .map((req) => (
        <div key={req.id} className="request-card-status">
          <p><strong>CBG:</strong> {req.cbg_id}</p>
          <p><strong>Crop:</strong> {req.crop_type}</p>
          <p><strong>Quantity:</strong> {req.quantity} kg</p>
          <p><strong>Slot:</strong> {req.slot}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-badge ${req.status}`}>
              {req.status.toUpperCase()}
            </span>
          </p>
          {req.message && (
            <p className="status-message">{req.message}</p>
          )}
        </div>
      ))}
  </div>
)}
    </div>
  );
};

export default RequestToCBG;