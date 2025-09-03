import { useEffect, useState } from "react";
import api from "../../api";

function ManageRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get("/requests", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Error fetching requests", err));
  }, []);

  const approve = async (id) => {
    try {
      await api.post(`/inventory/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      alert("Request approved");

      // update status in UI
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: "completed" } : r
        )
      );
    } catch (err) {
      console.error("Error approving request", err);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Manage Requests</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Receiver</th>
            <th>Blood Group</th>
            <th>Units</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r._id}>
              <td>{r.receiver?.name}</td>
              <td>{r.bloodGroup}</td>
              <td>{r.units}</td>
              <td>
                {r.status === "pending" ? (
                  <span className="badge bg-warning text-dark">Pending</span>
                ) : (
                  <span className="badge bg-success">Completed</span>
                )}
              </td>
              <td>
                {r.status === "pending" ? (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => approve(r._id)}
                  >
                    Approve
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" disabled>
                    Approved
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageRequests;
