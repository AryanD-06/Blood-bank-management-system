import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ Import Link
import api from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      // ✅ Save token & role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // ✅ Redirect based on role
      if (res.data.role === "donor") {
        navigate("/");
      } else if (res.data.role === "receiver") {
        navigate("/");
      } else if (res.data.role === "admin") {
        navigate("/");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>

      {/* 👇 New users link */}
      <p className="mt-3">
        New here? <Link to="/register">Click here to Register</Link>
      </p>
    </div>
  );
}

export default Login;
