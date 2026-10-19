import React from "react";
import "../../styles/CBGRequestTable.css";

const CBGRequestTable = ({ requests, onAccept, onComplete }) => {
  const getBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "badge-pending";
      case "accepted":
        return "badge-accepted";
      case "completed":
        return "badge-completed";
      default:
        return "";
    }
  };

  return (
    <div className="requests-section">
      <h3>Incoming Requests</h3>
      <table className="requests-table">
        <thead>
          <tr>
            <th>Farmer Name</th>
            <th>Crop</th>
            <th>Quantity (kg)</th>
            <th>Slot</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => (
            <tr key={index}>
              <td>{req.farmerName}</td>
              <td>{req.cropType}</td>
              <td>{req.quantity}</td>
              <td>{req.slot}</td>
              <td>
                <span className={`status-badge ${getBadgeColor(req.status)}`}>
                  {req.status.toUpperCase()}
                </span>
              </td>
              <td>
                {req.status === "pending" && (
                  <button
                    className="action-btn accept-btn"
                    onClick={() => onAccept(req.id)}
                  >
                    Accept
                  </button>
                )}
                {req.status === "accepted" && (
                  <button
                    className="action-btn complete-btn"
                    onClick={() => onComplete(req.id)}
                  >
                    Complete
                  </button>
                )}
                {req.status === "completed" && <span>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CBGRequestTable;