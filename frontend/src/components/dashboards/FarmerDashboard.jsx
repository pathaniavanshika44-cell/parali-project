import React, { useState } from "react";
import "../../styles/FarmerDashboard.css";

import RequestToCBG from "../farmer/requestCBG";
import RequestStatus from "../farmer/requestStatus";
import FarmerProfile from "../farmer/FarmerProfile";

const FarmerDashboard = () => {
  // Track which page is active
  const [activePage, setActivePage] = useState("dashboard");

  // Track request counts dynamically
  const [requests, setRequests] = useState({
    pending: 1,
    accepted: 1,
    completed: 1,
  });

  // Add new request (simulate form submission)
  const handleNewRequest = (slot, quantity) => {
    // Add to pending
    setRequests((prev) => ({ ...prev, pending: prev.pending + 1 }));

    // Simulate CBG accepting request after 3 seconds
    setTimeout(() => {
      setRequests((prev) => ({
        pending: prev.pending - 1,
        accepted: prev.accepted + 1,
        completed: prev.completed,
      }));
    }, 3000);

    alert(`Request submitted!\nSlot: ${slot}\nQuantity: ${quantity} kg`);
  };

  const renderPage = () => {
    switch (activePage) {
      case "request":
        return <RequestToCBG onSubmitRequest={handleNewRequest} />;

      case "myrequests":
        return <RequestStatus requests={requests} />;

      case "profile":
        return <FarmerProfile />;

      default:
        return (
          <>
            {/* BANNER */}
            <div className="request-banner">
              <h2>Submit Your Parali</h2>
              <p>
                Find nearby CBG plants, schedule your submission slot,
                and earn by supplying crop residue.
              </p>
              <button
                className="green-btn"
                onClick={() => setActivePage("request")}
              >
                Request to CBG →
              </button>
            </div>

            {/* REQUEST STATUS SECTION */}
            <div className="recent-section">
              <h3>My Requests</h3>
              <div className="recent-grid">
                <div className="recent-card pending">
                  <h4>Request Pending</h4>
                  <span className="status">{requests.pending}</span>
                </div>

                <div className="recent-card accepted">
                  <h4>Request Accepted</h4>
                  <span className="status">{requests.accepted}</span>
                </div>

                <div className="recent-card done">
                  <h4>Request Completed</h4>
                  <span className="status">{requests.completed}</span>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">
          🌿 AgriLink
          <p>Farm Smart Platform</p>
        </div>

        <ul className="menu">
          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </li>

          <li
            className={activePage === "request" ? "active" : ""}
            onClick={() => setActivePage("request")}
          >
            Request CBG
          </li>

          <li
            className={activePage === "myrequests" ? "active" : ""}
            onClick={() => setActivePage("myrequests")}
          >
            My Requests
          </li>

          <li
            className={activePage === "profile" ? "active" : ""}
            onClick={() => setActivePage("profile")}
          >
            Profile
          </li>
        </ul>

        {/* HELP BOX */}
        <div className="help-box">
          <h4>Need Help?</h4>
          <button>Chat Support</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main">
        {/* TOP BAR */}
        <div className="topbar">
          <div>
            <h2>Good Morning Farmer ☀️</h2>
            <p>
              Manage your crop residue requests easily and connect
              with nearby CBG plants.
            </p>
          </div>
        </div>

        {/* PAGE CONTENT */}
        {renderPage()}
      </div>
    </div>
  );
};

export default FarmerDashboard;