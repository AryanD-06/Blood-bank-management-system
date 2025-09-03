import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setName(localStorage.getItem("name"));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="container mt-5 text-center">
      <h2>Welcome, {name || "User"} 👋</h2>
      <p className="text-muted">Role: <strong>{role}</strong></p>

      {/* Donor actions */}
      {role === "donor" && (
        <div className="d-flex justify-content-center gap-3 mt-3">
          <button className="btn btn-primary" onClick={() => navigate("/donor/book")}>
            Book Appointment
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/donor/appointments")}>
            My Appointments
          </button>
        </div>
      )}

      {/* Receiver actions */}
      {role === "receiver" && (
        <div className="d-flex justify-content-center gap-3 mt-3">
          <button className="btn btn-primary" onClick={() => navigate("/receiver/request")}>
            Request Blood
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/receiver/myrequests")}>
            My Requests
          </button>
        </div>
      )}

      {/* Admin actions */}
      {role === "admin" && (
        <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
          <button className="btn btn-primary" onClick={() => navigate("/admin/appointments")}>
            Manage Appointments
          </button>
          <button className="btn btn-warning" onClick={() => navigate("/admin/requests")}>
            Manage Requests
          </button>
          <button className="btn btn-success" onClick={() => navigate("/admin/inventory")}>
            Inventory Dashboard
          </button>
        </div>
      )}

      <div className="mt-4">
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
