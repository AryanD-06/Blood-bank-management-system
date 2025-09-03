import { useState } from "react";
import api from "../../api";

function RequestBlood() {
  const [form, setForm] = useState({ bloodGroup: "", units: 1, urgency: "normal" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/requests", form);
      alert("Request submitted!");
    } catch (err) {
      alert("Error: " + err.response.data.error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Request Blood</h3>
      <form onSubmit={handleSubmit}>
        <select className="form-control mb-2" onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
          <option>Select Blood Group</option>
          <option>A+</option><option>A-</option>
          <option>B+</option><option>B-</option>
          <option>AB+</option><option>AB-</option>
          <option>O+</option><option>O-</option>
        </select>
        <input className="form-control mb-2" type="number" placeholder="Units" onChange={(e) => setForm({ ...form, units: e.target.value })} />
        <select className="form-control mb-2" onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </select>
        <button className="btn btn-danger">Request</button>
      </form>
    </div>
  );
}

export default RequestBlood;
