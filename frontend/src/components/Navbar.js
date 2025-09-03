import { Link } from "react-router-dom";

function Navbar() {
  const role = localStorage.getItem("role"); // donor, receiver, admin

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">Blood Bank</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {role === "donor" && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/donor/book">Book Appointment</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/donor/appointments">My Appointments</Link></li>
            </>
          )}
          {role === "receiver" && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/receiver/request">Request Blood</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/receiver/myrequests">My Requests</Link></li>
            </>
          )}
          {role === "admin" && (
            <>
              <li className="nav-item"><Link className="nav-link" to="/admin/appointments">Manage Appointments</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/requests">Manage Requests</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/admin/inventory">Inventory</Link></li>
            </>
          )}
        </ul>
        <button onClick={handleLogout} className="btn btn-outline-light">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
