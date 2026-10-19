import React, { useState, useEffect } from "react";
import "../../styles/CBGDashboard.css";
import CBGRequestTable from "../cbg/CBGRequestTable";
import CBGProfile from "../cbg/CBGProfile"; // Profile import

const CBGDashboard = ({ fetchRequests }) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalCapacity: 50, // tons per slot
    submitted: 0,
    completed: 0,
    remaining: 0,
  });
  const [dailyPrice, setDailyPrice] = useState(""); // Added state for daily price
  const [priceMessage, setPriceMessage] = useState("");

  // Determine current slot
  const getCurrentSlot = () => {
    const hour = new Date().getHours();
    return hour >= 1 && hour < 12
      ? "Morning (1AM-12PM)"
      : "Evening (12PM-7PM)";
  };

  const currentSlot = getCurrentSlot();

  // Fetch requests from backend
  const loadRequests = async () => {
    const data = await fetchRequests(currentSlot); // Backend API call
    setRequests(data);

    const submittedQty = data.reduce((sum, r) => sum + r.quantity, 0);
    const completedQty = data
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + r.quantity, 0);

    setStats({
      totalCapacity: 50,
      submitted: submittedQty,
      completed: completedQty,
      remaining: 50 - submittedQty,
    });
  };

  useEffect(() => {
    loadRequests();
  }, [currentSlot]);

  // Mock backend update function
  const updateRequestStatus = async (id, status) => {
    console.log(`Request ${id} updated to ${status}`);
  };

  // Mock function to save daily price (replace with Supabase call)
  const saveDailyPrice = async () => {
    if (!dailyPrice) {
      setPriceMessage("Please enter a price.");
      return;
    }
    // Example: await supabase.from("cbg_daily_price").insert({cbg_id: CBG_ID, price: dailyPrice});
    console.log(`Daily price set to: ₹${dailyPrice}`);
    setPriceMessage(`Daily price set to ₹${dailyPrice}`);
    setDailyPrice("");
  };

  const CBG_ID = "example-cbg-id"; // Placeholder CBG ID

  return (
    <div className="cbg-dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">
          🌱 CBG Station
          <p>Manage Requests & Slots</p>
        </div>
        <ul className="menu">
          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activePage === "slots" ? "active" : ""}
            onClick={() => setActivePage("slots")}
          >
            Slots & Capacity
          </li>
          <li
            className={activePage === "profile" ? "active" : ""}
            onClick={() => setActivePage("profile")}
          >
            Profile
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="main">
        {/* Dashboard Page */}
        {activePage === "dashboard" && (
          <>
            <div className="topbar">
              <h2>Welcome, CBG Manager 🌿</h2>
              <p>Current Slot: {currentSlot}</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-cards">
              <div className="stat-card submitted">
                <h4>Submitted</h4>
                <p>{stats.submitted} tons</p>
              </div>
              <div className="stat-card completed">
                <h4>Completed</h4>
                <p>{stats.completed} tons</p>
              </div>
              <div className="stat-card remaining">
                <h4>Remaining</h4>
                <p>{stats.remaining} tons</p>
              </div>
            </div>

            {/* Daily Price Section */}
            const [dailyPrice, setDailyPrice] = useState(null); // default is NULL
const [priceMessage, setPriceMessage] = useState("");

// In the daily price input section
          <div className="daily-price-section">
            <h3>Set Your Daily Price</h3>
              <input
                type="number"
                placeholder={dailyPrice === null ? "Enter price per kg" : dailyPrice}
                value={dailyPrice === null ? "" : dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
          />
          <button onClick={saveDailyPrice}>Save Price</button>
        {priceMessage && <p className="price-message">{priceMessage}</p>}
      </div>

            {/* Requests Table */}
            <CBGRequestTable
              requests={requests}
              onAccept={async (id) => {
                await updateRequestStatus(id, "accepted");
                const data = await fetchRequests(currentSlot);
                setRequests(data);
              }}
              onComplete={async (id) => {
                await updateRequestStatus(id, "completed");
                const data = await fetchRequests(currentSlot);
                setRequests(data);
              }}
            />
          </>
        )}

        {/* Slots & Capacity Page */}
        {activePage === "slots" && (
          <div className="slots-page">
            <h2>Slots & Capacity Info</h2>
            <p>Total capacity today: 50 tons per slot</p>
            <p>Current Slot: {currentSlot}</p>
            <p>Requests submitted: {stats.submitted} tons</p>
            <p>Requests completed: {stats.completed} tons</p>
            <p>Remaining capacity: {stats.remaining} tons</p>
          </div>
        )}

        {/* Profile Page */}
        {activePage === "profile" && <CBGProfile cbgId={CBG_ID} />}
      </div>
    </div>
  );
};

export default CBGDashboard;