import { useEffect, useState } from "react";
import api from "../../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const hospitalIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/2966/2966327.png", // red cross icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function BookAppointment() {
  const [date, setDate] = useState("");
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // ✅ Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchNearbyHospitals(latitude, longitude);
      },
      (err) => {
        console.error(err);
        alert("Failed to fetch location. Please enable location access.");
      }
    );
  }, []);

  // ✅ Fetch nearby hospitals from Overpass API (OpenStreetMap)
  const fetchNearbyHospitals = async (lat, lng) => {
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:4000,${lat},${lng});
        way["amenity"="hospital"](around:4000,${lat},${lng});
      );
      out center;
    `;
    try {
      const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: query,
        }
      );
      const data = await response.json();
      const parsed = data.elements.map((el) => ({
        id: el.id,
        name: el.tags.name || "Unnamed Hospital",
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
      }));
      setHospitals(parsed);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  // ✅ Submit appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHospital) {
      alert("Please select a hospital on the map.");
      return;
    }
    try {
      await api.post("/appointments", {
        date,
        hospital: selectedHospital.name,
        location: {
          type: "Point",
          coordinates: [selectedHospital.lng, selectedHospital.lat],
        },
      });
      alert("Appointment booked!");
    } catch (err) {
      console.error(err);
      alert("Error: " + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Book Appointment</h3>

      {!location ? (
        <p className="text-muted">Fetching your location...</p>
      ) : (
        <div className="border rounded mb-3" style={{ height: "400px" }}>
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[location.lat, location.lng]}
              icon={L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
                iconSize: [25, 25],
              })}
            >
              <Popup>You are here</Popup>
            </Marker>

            {/* ✅ Render hospitals */}
            {hospitals.map((hosp) => (
              <Marker
                key={hosp.id}
                position={[hosp.lat, hosp.lng]}
                icon={hospitalIcon}
              >
                <Popup>
                  <b>{hosp.name}</b> <br />
                  <button
                    className="btn btn-sm btn-danger mt-2"
                    onClick={() => setSelectedHospital(hosp)}
                  >
                    Select Hospital
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {selectedHospital && (
        <div className="alert alert-danger p-2">
          ✅ Selected Hospital: <b>{selectedHospital.name}</b>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="btn btn-primary w-100">Confirm Appointment</button>
      </form>
    </div>
  );
}

export default BookAppointment;
