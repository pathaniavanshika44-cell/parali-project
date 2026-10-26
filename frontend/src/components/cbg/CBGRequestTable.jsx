import React, { useState } from "react";
import "../../styles/CBGRequestTable.css";

const CBGRequestTable = ({
  requests,
  onAccept,
  onReject,
  onComplete,
  remainingCapacity,
}) => {
  const [loadingId, setLoadingId] = useState(null);

  const getBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "badge-pending";
      case "accepted":
        return "badge-accepted";
      case "rejected":
        return "badge-rejected";
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
            <th>Farmer</th>
            <th>Phone</th>
            <th>Crop</th>
            <th>Qty (kg)</th>
            <th>Slot</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No requests found
              </td>
            </tr>
          ) : (
            requests.map((req) => {
              const status = (req.status || "pending").toLowerCase();
              const isLoading = loadingId === req.id;

              return (
                <tr key={req.id}>
                  <td>{req.farmerName || "Unknown"}</td>
                  <td>{req.phone || "-"}</td>
                  <td>{req.cropType || "-"}</td>
                  <td>{req.quantity || 0}</td>
                  <td>{req.slot || "-"}</td>
                  <td>
                    <span className={`status-badge ${getBadgeColor(status)}`}>
                      {status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {status === "pending" && (
                      <>
                        <button
                          className="action-btn accept-btn"
                          disabled={isLoading}
                          onClick={async () => {
                            if (req.quantity > remainingCapacity) {
                              alert("❌ Not enough capacity!");
                              return;
                            }
                            if (window.confirm("Accept this request?")) {
                              setLoadingId(req.id);
                              await onAccept(req.id);
                              setLoadingId(null);
                            }
                          }}
                        >
                          {isLoading ? "Processing..." : "✔ Accept"}
                        </button>

                        <button
                          className="action-btn reject-btn"
                          disabled={isLoading}
                          onClick={async () => {
                            if (window.confirm("Reject this request?")) {
                              setLoadingId(req.id);
                              await onReject(req.id);
                              setLoadingId(null);
                            }
                          }}
                        >
                          {isLoading ? "Processing..." : "✖ Reject"}
                        </button>
                      </>
                    )}

                    {status === "accepted" && (
                      <button
                        className="action-btn complete-btn"
                        disabled={isLoading}
                        onClick={async () => {
                          if (window.confirm("Mark as completed?")) {
                            setLoadingId(req.id);
                            await onComplete(req.id);
                            setLoadingId(null);
                          }
                        }}
                      >
                        {isLoading ? "Processing..." : "✓ Complete"}
                      </button>
                    )}

                    {(status === "rejected" || status === "completed") && (
                      <span style={{ color: "#888" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CBGRequestTable;