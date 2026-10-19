import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/SignUp.css";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { success: signUpSuccess, error: signUpError } = await signUp(
      email,
      password,
      role
    );
    setLoading(false);

    if (signUpSuccess) {
      setSuccess("Signup successful! You can now Sign In.");
      // Optionally navigate after a short delay:
      setTimeout(() => navigate("/signin"), 2000);
    } else {
      setError(signUpError?.message || "Error signing up");
    }
  };

  return (
    <div className="signup-bg">
      <div className="signup-card">
        <h2>Sign Up for Parali</h2>
        <p className="subtext">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
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

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label>Select Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="farmer">Farmer</option>
            <option value="cbg_user">CBG User</option>
            <option value="transport">Transport</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}