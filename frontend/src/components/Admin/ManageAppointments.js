import { useEffect, useState } from "react";
import api from "../../api";
import "./ManageAppointments.css";
import { FaCalendarCheck, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await api.get("/appointments/all");
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments", err);
        setError("Failed to load appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Calculate days since last donation
  const daysSinceLastDonation = (lastDonationDate) => {
    if (!lastDonationDate) return Infinity; // no prior donation, eligible
    const last = new Date(lastDonationDate);
    const now = new Date();
    const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const updateAppointmentStatus = async (id, status, endpoint) => {
  setUpdatingId(id);
  try {
    const response = await api.post(`/appointments/${endpoint}/${id}`);
    setAppointments(
      appointments.map((app) =>
        app._id === id ? { ...app, status: status } : app
      )
    );
    alert(response.data?.message || `Appointment ${status} successfully!`);
  } catch (err) {
    console.error(`Error updating appointment to ${status}`, err);

    const backendMsg =
      err.response?.data?.message ||
      "Failed to update appointment. Please try again.";

    alert(backendMsg);
  } finally {
    setUpdatingId(null);
  }
};


  const approveAppointment = (app) => {
    const days = daysSinceLastDonation(app.donor?.lastDonationDate);
    if (days < 90) {
      alert("Donor is not eligible — last donation was less than 3 months ago.");
      return;
    }
    updateAppointmentStatus(app._id, "completed", "approve");
  };

  const rejectAppointment = (id) =>
    updateAppointmentStatus(id, "rejected", "reject");

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" /> Loading appointments...
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <div className="manage-appointments-container">
        <div className="header">
          <FaCalendarCheck size={24} color="#0d6efd" />
          <h3>Manage Appointments</h3>
        </div>

        {appointments.length === 0 ? (
          <p className="text-center text-muted p-4">
            No pending appointments found.
          </p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Email</th>
                <th>Blood Group</th>
                <th>Last Donation</th>
                <th>Appointment Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => {
                const days = daysSinceLastDonation(app.donor?.lastDonationDate);
                const isEligible = days >= 90;

                return (
                  <tr key={app._id}>
                    <td>{app.donor?.name || "N/A"}</td>
                    <td>{app.donor?.email || "N/A"}</td>
                    <td>{app.donor?.bloodGroup || "N/A"}</td>
                    <td>
                      {app.donor?.lastDonationDate
                        ? new Intl.DateTimeFormat("en-IN", {
                            dateStyle: "medium",
                          }).format(new Date(app.donor.lastDonationDate))
                        : "Never"}
                    </td>
                    <td>
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "long",
                        timeStyle: "short",
                      }).format(new Date(app.date))}
                    </td>
                    <td>
                      <span className={`status-badge status-${app.status}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {app.status === "pending" ? (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => approveAppointment(app)}
                            disabled={updatingId === app._id || !isEligible}
                            title={
                              !isEligible
                                ? "Donor not eligible (less than 3 months)"
                                : ""
                            }
                          >
                            {updatingId === app._id ? (
                              <FaSpinner className="spinner" />
                            ) : (
                              <FaCheck />
                            )}
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => rejectAppointment(app._id)}
                            disabled={updatingId === app._id}
                          >
                            <FaTimes /> Reject
                          </button>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageAppointments;
