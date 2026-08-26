import "../../styles/farmer.css";

function RecommendedCBG() {

  return (

    <div className="farmer-card">

      <h2>🚜 Recommended CBG Plants</h2>

      <div className="cbg-grid">

        <div className="cbg-card">
          <h3>CBG Plant</h3>
          <p>Distance: -- km</p>
          <p>Price: ₹-- / ton</p>
          <button className="green-btn">View Route</button>
          <button className="request-btn">Request</button>
        </div>

        <div className="cbg-card">
          <h3>CBG Plant</h3>
          <p>Distance: -- km</p>
          <p>Price: ₹-- / ton</p>
          <button className="green-btn">View Route</button>
          <button className="request-btn">Request</button>
        </div>

      </div>

    </div>

  );
}

export default RecommendedCBG;