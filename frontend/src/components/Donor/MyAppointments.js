import { useEffect, useState } from "react";
import api from "../../api";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get("/appointments").then((res) => setAppointments(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h3>My Appointments</h3>
      <table className="table table-bordered">
        <thead>
          <tr><th>Date</th><th>Status</th></tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{new Date(a.date).toLocaleString()}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyAppointments;
