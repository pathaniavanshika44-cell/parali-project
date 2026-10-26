import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/SignIn.css";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { success: ok, error: signUpError } = await signUp(email, password, role);

      if (!ok) {
        setError(signUpError?.message || "Failed to sign up");
        return;
      }

      setSuccess("Account created! Please check your email to confirm, then sign in.");
      setTimeout(() => navigate("/signin"), 3000);
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
        <h2>Sign Up</h2>
        <p className="subtext">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>

        {error && <p className="error">{error}</p>}
        {success && <p style={{ color: "green", marginBottom: "1rem" }}>{success}</p>}

        <form onSubmit={handleSignUp}>
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="farmer">Farmer</option>
            <option value="cbg_user">CBG User</option>
            <option value="transport">Transport</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
