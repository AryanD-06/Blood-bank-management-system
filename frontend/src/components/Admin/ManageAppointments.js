import { useEffect, useState } from "react";
import api from "../../api";

function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get("/appointments/all")
      .then(res => setAppointments(res.data))
      .catch(err => console.error("Error fetching appointments", err));
  }, []);

  const approveAppointment = (id) => {
    api.post(`/appointments/approve/${id}`)
      .then(res => {
        alert("Appointment approved");
        setAppointments(appointments.map(app => 
          app._id === id ? { ...app, status: "completed" } : app
        ));
      })
      .catch(err => console.error("Error approving appointment", err));
  };

  return (
    <div className="container mt-4">
      <h3>Manage Appointments</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Donor</th>
            <th>Email</th>
            <th>Blood Group</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(app => (
            <tr key={app._id}>
              <td>{app.donor?.name}</td>
              <td>{app.donor?.email}</td>
              <td>{app.donor?.bloodGroup}</td>
              <td>{new Date(app.date).toLocaleString()}</td>
              <td>{app.status}</td>
              <td>
                {app.status === "pending" ? (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => approveAppointment(app._id)}
                  >
                    Approve
                  </button>
                ) : (
                  <span className="badge bg-secondary">Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageAppointments;
