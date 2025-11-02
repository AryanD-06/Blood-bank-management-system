import { useEffect, useState } from "react";
import api from "../../api";
import MapWithRoute from "../MapWithRoute";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [donorLocation, setDonorLocation] = useState(null);

  useEffect(() => {
    // Fetch appointments for logged-in donor
    api.get("/appointments").then((res) => setAppointments(res.data));

    // Get donor current GPS location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDonorLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Location access denied:", err);
        alert("Unable to fetch current location.");
      }
    );
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="text-danger mb-3">My Appointments</h3>
      <table className="table table-bordered table-hover align-middle">
        <thead className="table-danger text-center">
          <tr>
            <th>Date</th>
            <th>Hospital</th>
            <th>Status</th>
            <th>Route</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{new Date(a.date).toLocaleString()}</td>
              <td>{a.hospital}</td>
              <td>{a.status}</td>
              <td>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setSelectedAppointment(a)}
                >
                  Show Route
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Map Display */}
      {selectedAppointment && donorLocation && selectedAppointment.location && (
        <div className="mt-4">
          <h5 className="text-danger">
            Route to {selectedAppointment.hospital}
          </h5>
          <MapWithRoute
            donorLocation={donorLocation}
            hospitalLocation={[
              selectedAppointment.location.coordinates[1],
              selectedAppointment.location.coordinates[0],
            ]}
          />
        </div>
      )}
    </div>
  );
}

export default MyAppointments;
