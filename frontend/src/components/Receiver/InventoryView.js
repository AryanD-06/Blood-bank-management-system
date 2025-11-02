import { useEffect, useState, useCallback } from "react";
import api from "../../api";
import { FaHeartbeat, FaSync, FaExclamationTriangle } from "react-icons/fa";

const Loading = () => (
  <div className="d-flex flex-column align-items-center mt-4">
    <div className="spinner-border text-danger" role="status" />
    <div className="mt-2">Loading inventory...</div>
  </div>
);

const ErrorMsg = ({ message, onRetry }) => (
  <div className="alert alert-danger d-flex align-items-center mt-3">
    <FaExclamationTriangle className="me-2" />
    <div>
      <strong>Error:</strong> {message}
      <div>
        <button className="btn btn-danger btn-sm mt-2" onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  </div>
);

const colorFor = (bg) => {
  const map = {
    "A+": "#d63031",
    "A-": "#d63031",
    "B+": "#00b894",
    "B-": "#00b894",
    "AB+": "#6c5ce7",
    "AB-": "#6c5ce7",
    "O+": "#fd79a8",
    "O-": "#fd79a8",
  };
  return map[bg] || "#636e72";
};

export default function InventoryView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/inventory/public");
      console.log("[Frontend][ReceiverInventory] fetched:", res.data);
      const sorted = res.data.slice().sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
      setItems(sorted);
    } catch (e) {
      console.error("[Frontend][ReceiverInventory] error:", e);
      setError("Failed to load inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loading />;
  if (error) return <ErrorMsg message={error} onRetry={fetchData} />;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0"><FaHeartbeat className="me-2 text-danger" />Available Blood Inventory</h3>
        <button className="btn btn-outline-danger" onClick={fetchData} title="Refresh">
          <FaSync />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted">No inventory data available.</p>
      ) : (
        <div className="row g-3">
          {items.map((it) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={it._id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="m-0" style={{ color: colorFor(it.bloodGroup) }}>{it.bloodGroup}</h5>
                  </div>
                  <div className="display-6 mt-2">{it.units}</div>
                  <div className="text-muted">units available</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
