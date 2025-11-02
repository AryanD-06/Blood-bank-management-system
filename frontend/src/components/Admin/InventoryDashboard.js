import { useEffect, useState, useCallback } from "react";
import api from "../../api";
import "./InventoryDashboard.css";
import { FaHeartbeat, FaSync, FaExclamationTriangle, FaHeart, FaCalendarAlt } from "react-icons/fa";

// Spinner while loading
const LoadingSpinner = () => (
  <div className="loader-container">
    <div className="spinner"></div>
    <p>Fetching latest inventory...</p>
  </div>
);

// Error component
const ErrorDisplay = ({ message, onRetry }) => (
  <div className="container mt-4 alert alert-danger d-flex align-items-center">
    <FaExclamationTriangle className="me-3" size={24} />
    <div>
      <strong>Error:</strong> {message}
      <br />
      <button onClick={onRetry} className="btn btn-danger btn-sm mt-2">
        Try Again
      </button>
    </div>
  </div>
);

// Assign unique color to each blood group
const getBloodTypeStyle = (bloodGroup) => {
  const colorMap = {
    'A+': '#d63031',
    'A-': '#d63031',
    'B+': '#00b894',
    'B-': '#00b894',
    'AB+': '#6c5ce7',
    'AB-': '#6c5ce7',
    'O+': '#fd79a8',
    'O-': '#fd79a8',
  };
  return { color: colorMap[bloodGroup] || '#636e72' };
};

// Format date nicely
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/inventory/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[Frontend][Inventory] fetched:", res.data);
      // Sort by blood group
      const sortedData = res.data.sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
      setInventory(sortedData);
    } catch (err) {
      setError("Failed to connect to the server. Please check your connection.");
      console.error("[Frontend][Inventory] error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchInventory} />;

  return (
    <div className="container mt-5">
      <div className="inventory-dashboard">
        <div className="dashboard-header">
          <h2>
            <FaHeartbeat color="#dc3545" /> Blood Inventory by Type
          </h2>
          <button onClick={fetchInventory} className="refresh-btn" title="Refresh Inventory">
            <FaSync />
          </button>
        </div>

        {inventory.length === 0 ? (
          <p className="text-center text-muted mt-4">No inventory records available.</p>
        ) : (
          <div className="card-grid">
            {inventory.map((item) => {
              const style = getBloodTypeStyle(item.bloodGroup);
              return (
                <div className="blood-card" key={item._id}>
                  <div className="card-header">
                    <h4 className="blood-type-name" style={style}>
                      {item.bloodGroup}
                    </h4>
                    <FaHeart size={24} style={style} />
                  </div>
                  <div className="card-body">
                    <p className="unit-count">{item.units}</p>
                    <p className="unit-label">Available units</p>
                    {/* ✅ Date Column */}
                    {item.updatedAt && (
                      <p className="mt-2 text-muted small">
                        <FaCalendarAlt className="me-1" />
                        Updated: {formatDate(item.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryDashboard;
