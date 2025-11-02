import { useEffect, useState } from "react";
import api from "../../api";
import "./ManageRequests.css";
import {
  FaClipboardList,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaCalendarAlt,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const apiConfig = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get("/requests", apiConfig);
        console.log("[Frontend][Requests] fetched:", res.data);
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching requests", err);
        setError("Failed to load requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const updateRequestStatus = async (id, status, endpoint) => {
    setUpdatingId(id);
    try {
      await api.post(`/inventory/${endpoint}/${id}`, {}, apiConfig);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(`Error updating request to ${status}`, err);
      alert(`Failed to ${status} request. Please try again.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const approve = (id) => updateRequestStatus(id, "approved", "approve");
  const reject = (id) => updateRequestStatus(id, "rejected", "reject");

  if (loading)
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" /> Loading Requests...
      </div>
    );

  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="manage-requests-container">
        <div className="header">
          <FaClipboardList size={22} color="#dc3545" />
          <h3>Manage Blood Requests</h3>
        </div>

        {requests.length === 0 ? (
          <p className="text-center text-muted p-4">
            No blood requests found.
          </p>
        ) : (
          <>
            {/* ✅ Requests Table */}
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Receiver</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>
                    <FaCalendarAlt className="me-1" />
                    Date
                  </th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.receiver?.name || "N/A"}</td>
                    <td>{r.bloodGroup}</td>
                    <td>{r.units}</td>
                    <td>{formatDate(r.createdAt || r.updatedAt)}</td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {r.status === "pending" ? (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => approve(r._id)}
                            disabled={updatingId === r._id}
                          >
                            {updatingId === r._id ? (
                              <FaSpinner className="spinner button-spinner" />
                            ) : (
                              <FaCheck />
                            )}
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => reject(r._id)}
                            disabled={updatingId === r._id}
                          >
                            <FaTimes /> Reject
                          </button>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 🗺️ Requests Map */}
            <div className="map-section mt-5">
              <div className="d-flex align-items-center mb-3">
                <FaMapMarkedAlt color="#dc3545" size={22} className="me-2" />
                <h4 className="text-danger">Request Locations</h4>
              </div>

              <MapContainer
                center={[20.5937, 78.9629]} // India center
                zoom={5}
                style={{
                  height: "500px",
                  width: "100%",
                  borderRadius: "15px",
                  boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {requests
                  .filter((r) => r.location?.coordinates)
                  .map((req, i) => (
                    <Marker
                      key={i}
                      position={[
                        req.location.coordinates[1],
                        req.location.coordinates[0],
                      ]}
                    >
                      <Popup>
                        <b>{req.bloodGroup}</b> ({req.units} units)
                        <br />
                        Urgency: {req.urgency || "N/A"}
                        <br />
                        Receiver: {req.receiver?.name || "Unknown"}
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ManageRequests;
