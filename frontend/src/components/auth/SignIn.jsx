import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/SignIn.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { signIn } = useAuth();

  // const handleSignIn = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const { success, role: userRole, error: loginError } = await signIn(email, password);

  //     if (!success) {
  //       setError(loginError?.message || "Failed to sign in");
  //       return;
  //     }

  //     // Use role returned directly from signIn — avoids stale context state
  //     navigate("/dashboard");
  //   } catch (err) {
  //     console.error(err);
  //     setError("Something went wrong. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };







  const handleSignIn = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const { success, role: userRole, error: loginError } = await signIn(email, password);

    if (!success) {
      setError(loginError?.message || "Failed to sign in");
      return;
    }

    // ✅ Role-based navigation (FIX)
    if (userRole === "farmer") {
      navigate("/farmer/dashboard");
    } else if (userRole === "cbg_user") {
      navigate("/cbg/dashboard");
    } else if (userRole === "transport") {
      navigate("/transport/dashboard");
    } else {
      navigate("/signin"); // fallback safety
    }

  } catch (err) {
    console.error(err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};






  return (
    <div className="signin-bg">
      <div className="signin-card">
        <h2>Sign In</h2>
        <p className="subtext">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSignIn}>
          <label>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
