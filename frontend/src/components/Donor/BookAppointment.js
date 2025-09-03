import { useState } from "react";
import api from "../../api";

function BookAppointment() {
  const [date, setDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/appointments", { date });
      alert("Appointment booked!");
    } catch (err) {
      alert("Error: " + err.response.data.error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Book Appointment</h3>
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        <button className="btn btn-primary">Book</button>
      </form>
    </div>
  );
}

export default BookAppointment;
