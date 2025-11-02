import { useState, useEffect } from "react";
import api from "../../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function RequestBlood() {
  const [form, setForm] = useState({
    bloodGroup: "",
    units: 1,
    urgency: "normal",
    location: null,
  });
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // ✅ Fetch user's location on component mount
  useEffect(() => {
    const fetchLocation = () => {
      setFetchingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setForm((prev) => ({
              ...prev,
              location: { coordinates: [longitude, latitude] },
            }));
            setFetchingLocation(false);
          },
          (error) => {
            console.error("Error fetching location:", error);
            setFetchingLocation(false);
            alert("Unable to fetch your location. Please enable GPS.");
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
        setFetchingLocation(false);
      }
    };
    fetchLocation();
  }, []);

  // ✅ Submit the request including location
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.bloodGroup || !form.units) {
      alert("Please fill all required fields.");
      return;
    }

    if (!form.location) {
      alert("Location not found. Please enable GPS.");
      return;
    }

    try {
      await api.post("/requests", form);
      alert("Blood request submitted successfully!");
      setForm({ bloodGroup: "", units: 1, urgency: "normal", location: null });
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Error: " + (err.response?.data?.error || "Something went wrong."));
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-danger">Request Blood</h3>
      <form onSubmit={handleSubmit}>
        {/* Blood Group */}
        <select
          className="form-control mb-3"
          value={form.bloodGroup}
          onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
          required
        >
          <option value="">-- Select Blood Group --</option>
          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>

        {/* Units */}
        <input
          className="form-control mb-3"
          type="number"
          placeholder="Units (e.g., 2)"
          min="1"
          value={form.units}
          onChange={(e) => setForm({ ...form, units: e.target.value })}
          required
        />

        {/* Urgency */}
        <select
          className="form-control mb-3"
          value={form.urgency}
          onChange={(e) => setForm({ ...form, urgency: e.target.value })}
        >
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </select>

        {/* ✅ Location Section */}
        <div className="mb-3">
          <label className="form-label">Your Location</label>
          {fetchingLocation ? (
            <p className="text-muted">Fetching your current location...</p>
          ) : form.location ? (
            <>
              <div className="border rounded" style={{ height: "250px" }}>
                <MapContainer
                  center={[
                    form.location.coordinates[1],
                    form.location.coordinates[0],
                  ]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[
                      form.location.coordinates[1],
                      form.location.coordinates[0],
                    ]}
                  >
                    <Popup>Your current location</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <p className="small mt-2 text-muted">
                Lat: {form.location.coordinates[1].toFixed(4)} | Lng:{" "}
                {form.location.coordinates[0].toFixed(4)}
              </p>
            </>
          ) : (
            <p className="text-muted">No location detected.</p>
          )}
        </div>

        <button className="btn btn-danger w-100">Submit Request</button>
      </form>
    </div>
  );
}

export default RequestBlood;
