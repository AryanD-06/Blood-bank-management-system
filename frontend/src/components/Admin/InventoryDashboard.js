import { useEffect, useState } from "react";
import api from "../../api";

function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get("/inventory/get");
        setInventory(res.data);
      } catch (err) {
        setError("Failed to load inventory");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) return <div className="container mt-4"><p>Loading inventory...</p></div>;
  if (error) return <div className="container mt-4 alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Inventory Dashboard</h3>
      {inventory.length === 0 ? (
        <p className="text-muted">No inventory records available.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i._id}>
                <td>{i.bloodGroup}</td>
                <td>{i.units}</td>
                <td>{new Date(i.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InventoryDashboard;
