import "../../styles/farmer.css";

function RequestStatus() {

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

          <tr>
            <td>--</td>
            <td>--</td>
            <td>--</td>
            <td>--</td>
            <td>Pending</td>
          </tr>

        </tbody>

      </table>

    </div>

  );
}

export default RequestStatus;