import { useEffect, useState } from "react";
import api from "../../api";

function MyRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get("/requests/mine").then((res) => setRequests(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h3>My Requests</h3>
      <table className="table table-bordered">
        <thead>
          <tr><th>Blood Group</th><th>Units</th><th>Status</th></tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r._id}>
              <td>{r.bloodGroup}</td>
              <td>{r.units}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyRequests;
