import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/CBGDashboard.css";
import CBGRequestTable from "../cbg/CBGRequestTable";
import CBGProfile from "../cbg/CBGProfile";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";

const CBGDashboard = () => {
  const { session } = useAuth();
  const user = session?.user;

  const { section } = useParams();
  const navigate = useNavigate();

  const activePage = section || "dashboard";

  const setActivePage = (page) => {
    if (page === "dashboard") navigate("/cbg/dashboard");
    else navigate(`/cbg/dashboard/${page}`);
  };

  const [cbgId, setCbgId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalCapacity: 0,
    submitted: 0,
    completed: 0,
    remaining: 0,
  });

  // ✅ Fetch CBG ID
  useEffect(() => {
    if (!user) return;

    const fetchCbgId = async () => {
      const { data, error } = await supabase
        .from("cbg_details")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error(error);
        alert("CBG profile not found");
        return;
      }

      setCbgId(data.id);
    };

    fetchCbgId();
  }, [user]);

  // ✅ Load backend dashboard API
  const loadDashboard = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/cbg/${id}/dashboard`
      );
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard API error:", err);
    }
  };

  // ✅ Load requests
  const loadRequests = async () => {
    if (!cbgId) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("cbg_id", cbgId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const normalized = data.map((r) => ({
        id: r.id,
        farmerId: r.farmer_id || r.farmerId,
        cbgId: r.cbg_id || r.cbgId,
        farmerName: r.farmer_name || r.farmerName || "Unknown",
        cropType: r.crop_type || r.cropType || "-",
        quantity: r.quantity != null ? Number(r.quantity) : 0,
        slot: r.slot || "-",
        phone: r.phone || "-",
        address: r.address || "-",
        latitude: r.latitude != null ? Number(r.latitude) : 0,
        longitude: r.longitude != null ? Number(r.longitude) : 0,
        status: (r.status || "pending").toLowerCase(),
        message: r.message || "",
        created_at: r.created_at || "",
      }));

      setRequests(normalized);

      // ✅ FIXED STATS (still frontend fallback)
      const submittedQty = normalized.reduce(
        (sum, r) => sum + r.quantity,
        0
      );

      const completedQty = normalized
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + r.quantity, 0);

      const activeQty = normalized
        .filter((r) => r.status === "accepted")
        .reduce((sum, r) => sum + r.quantity, 0);

      setStats({
        totalCapacity: 100, // fallback (backend can override later)
        submitted: submittedQty,
        completed: completedQty,
        remaining: 100 - activeQty,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load when CBG ID is ready
  useEffect(() => {
    if (cbgId) {
      loadRequests();
      loadDashboard(cbgId);
    }
  }, [cbgId]);

  // ✅ realtime updates
  useEffect(() => {
    if (!cbgId) return;

    const channel = supabase
      .channel("requests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests" },
        () => loadRequests()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [cbgId]);

  // ✅ update status
  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: status.toLowerCase() })
        .eq("id", id);

      if (error) throw error;

      loadRequests();
    } catch (err) {
      console.error(err);
      alert("Status update failed");
    }
  };

  return (
    <div className="cbg-dashboard-container">
      <div className="sidebar">
        <div className="logo">
          🌱 CBG Station
          <p>Manage Requests & Slots</p>
        </div>

        <ul className="menu">
          <li onClick={() => setActivePage("dashboard")}>Dashboard</li>
          <li onClick={() => setActivePage("profile")}>Profile</li>
        </ul>
      </div>

      <div className="main">
        {activePage === "dashboard" && (
          <>
            <div className="topbar">
              <h2>Welcome, CBG Manager 🌿</h2>
            </div>

            {loading ? (
              <p>Loading requests...</p>
            ) : (
              <>
                <div className="stats-cards">
                  <div className="stat-card submitted">
                    <h4>Submitted</h4>
                    <p>{stats.submitted} kg</p>
                  </div>

                  <div className="stat-card completed">
                    <h4>Completed</h4>
                    <p>{stats.completed} kg</p>
                  </div>

                  <div className="stat-card remaining">
                    <h4>Remaining</h4>
                    <p>{stats.remaining} kg</p>
                  </div>
                </div>

                <CBGRequestTable
                  requests={requests}
                  onAccept={(id) => updateStatus(id, "accepted")}
                  onReject={(id) => updateStatus(id, "rejected")}
                  onComplete={(id) => updateStatus(id, "completed")}
                  remainingCapacity={stats.remaining}
                />
              </>
            )}
          </>
        )}

        {activePage === "profile" && (
          <CBGProfile userId={user.id} />
        )}
      </div>
    </div>
  );
};

export default CBGDashboard;