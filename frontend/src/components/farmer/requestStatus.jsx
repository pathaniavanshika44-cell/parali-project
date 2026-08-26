import { useEffect, useState } from "react";
import "../../styles/farmer.css";
import { supabase } from "../../supabaseClient";

function RequestStatus() {
  const [requests, setRequests] = useState([]);
  const [farmerId, setFarmerId] = useState(null);

  // 🔥 Get farmer ID
  useEffect(() => {
    const fetchFarmerId = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("farmers_details")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setFarmerId(data.id);
      }
    };

    fetchFarmerId();
  }, []);

  // 🔥 Fetch all requests
  const fetchRequests = async () => {
    if (!farmerId) return;

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false });

    if (!error) {
      setRequests(data);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [farmerId]);

  return (
    <div className="farmer-card">
      <h2>📋 My Requests</h2>

      <table className="request-table">
        <thead>
          <tr>
            <th>Crop</th>
            <th>Weight</th>
            <th>CBG Plant</th>
            <th>Slot</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="5">No requests found</td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.crop_type}</td>
                <td>{req.quantity} kg</td>
                <td>{req.cbg_id}</td>
                <td>{req.slot}</td>
                <td className={`status-${req.status}`}>
                  {req.status.toUpperCase()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RequestStatus;