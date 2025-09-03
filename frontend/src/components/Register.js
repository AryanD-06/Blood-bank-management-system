import React, { useState } from "react";
import api from "../api";

const Register = () => {
  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const [bloodGroup, setBloodGroup] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If donor → send bloodGroup, else omit it
      const payload =
        role === "donor"
          ? { name, email, password, role, bloodGroup }
          : { name, email, password, role };

      await api.post("/auth/register", payload);
      alert("Registration successful! Please login.");
      window.location.href = "/login";
    } catch (err) {
      if (err.response?.data?.error) {
        alert("Registration failed: " + err.response.data.error);
      } else {
        alert("Registration failed: " + err.message);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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

        <div className="mb-3">
          <label>Role</label>
          <select
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="donor">Donor</option>
            <option value="receiver">Receiver</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === "donor" && (
          <div className="mb-3">
            <label>Blood Group</label>
            <select
              className="form-control"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              required
            >
              <option value="">-- Select Blood Group --</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>

      
    </div>
    
  );
};

export default Register;
