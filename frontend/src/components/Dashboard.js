import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api"; // <-- make sure this is your axios instance

function Dashboard() {
  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    donors: 0,
    units: 0,
    pending: 0,
  });
  const [receiverInventory, setReceiverInventory] = useState([]);
  const [invError, setInvError] = useState("");

  useEffect(() => {
    // Fetch real stats only if admin
    const fetchStats = async () => {
      if (role === "admin" && token) {
        try {
          const { data } = await api.get("/requests/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStats({
            donors: data.donors,
            units: data.units,
            pending: data.pending,
          });
        } catch (err) {
          console.error("Failed to load stats", err);
        }
      }
    };
    const fetchReceiverInventory = async () => {
      if (role === "receiver" && token) {
        try {
          const res = await api.get("/inventory/public", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const sorted = res.data
            .slice()
            .sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
          setReceiverInventory(sorted);
        } catch (err) {
          console.error("Failed to load receiver inventory", err);
          setInvError("Unable to load inventory right now.");
        }
      }
    };
    fetchStats();
    fetchReceiverInventory();
  }, [role, token]);

  const renderActions = () => {
    switch (role) {
      case "donor":
        return (
          <>
            <Link to="/donor/book" className="btn btn-danger m-2">
              Book Appointment
            </Link>
            <Link to="/donor/appointments" className="btn btn-outline-danger m-2">
              My Appointments
            </Link>
          </>
        );
      case "receiver":
        return (
          <>
            <Link to="/receiver/request" className="btn btn-danger m-2">
              Request Blood
            </Link>
            <Link to="/receiver/myrequests" className="btn btn-outline-danger m-2">
              My Requests
            </Link>
            <Link to="/receiver/inventory" className="btn btn-outline-danger m-2">
              View Full Inventory
            </Link>
          </>
        );
      case "admin":
        return (
          <>
            {/* Admin action buttons */}
            <div className="my-3">
              <Link to="/admin/appointments" className="btn btn-danger m-2">
                Manage Appointments
              </Link>
              <Link to="/admin/requests" className="btn btn-outline-danger m-2">
                Manage Requests
              </Link>
              <Link to="/admin/inventory" className="btn btn-outline-danger m-2">
                Inventory
              </Link>
            </div>

            {/* Stats cards */}
            <div className="row mt-4 g-3">
              <div className="col-md-4">
                <div className="card text-center border-0 shadow-sm bg-light">
                  <div className="card-body">
                    <h5 className="card-title text-danger fw-bold">Total Donors</h5>
                    <p className="display-6">{stats.donors}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center border-0 shadow-sm bg-light">
                  <div className="card-body">
                    <h5 className="card-title text-danger fw-bold">Blood Units</h5>
                    <p className="display-6">{stats.units}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center border-0 shadow-sm bg-light">
                  <div className="card-body">
                    <h5 className="card-title text-danger fw-bold">Pending Requests</h5>
                    <p className="display-6">{stats.pending}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Extra feature: Quick report download */}
            <div className="mt-4">
              <button
                className="btn btn-outline-danger"
                onClick={() => alert("Report downloaded (placeholder)!")}
              >
                Download Daily Report
              </button>
            </div>
          </>
        );
      default:
        return <p>No actions available</p>;
    }
  };

  return (
    <div className="vh-100 bg-light d-flex flex-column justify-content-center align-items-center p-3">
      <img
        src="https://images.unsplash.com/photo-1584452964155-ef139340f0db?auto=format&fit=crop&w=1200&q=80"
        alt="Dashboard banner"
        className="img-fluid rounded mb-4 shadow"
        style={{ maxHeight: "250px", objectFit: "cover", width: "100%" }}
      />
      <div className="card-custom col-12 col-lg-10 text-center bg-white p-4 shadow-lg">
        <h2 className="mb-3 text-danger">Welcome, {name}!</h2>
        <h5 className="mb-3">Role: {role}</h5>
        {renderActions()}

        {role === "receiver" && (
          <div className="mt-4">
            <h4 className="text-danger mb-3">Available Inventory</h4>
            {invError ? (
              <p className="text-muted">{invError}</p>
            ) : receiverInventory.length === 0 ? (
              <p className="text-muted">No inventory data available.</p>
            ) : (
              <div className="row g-3 justify-content-center">
                {receiverInventory.map((it) => (
                  <div className="col-6 col-md-3 col-lg-2" key={it._id}>
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-3">
                        <h6 className="m-0 text-danger">{it.bloodGroup}</h6>
                        <div className="fw-bold" style={{ fontSize: "1.25rem" }}>{it.units}</div>
                        <div className="text-muted small">units</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
