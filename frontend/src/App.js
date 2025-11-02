import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

import BookAppointment from "./components/Donor/BookAppointment";
import MyAppointments from "./components/Donor/MyAppointments";

import RequestBlood from "./components/Receiver/RequestBlood";
import MyRequests from "./components/Receiver/MyRequests";
import InventoryView from "./components/Receiver/InventoryView";

import ManageAppointments from "./components/Admin/ManageAppointments";
import ManageRequests from "./components/Admin/ManageRequests";
import InventoryDashboard from "./components/Admin/InventoryDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Donor */}
        <Route path="/donor/book" element={<BookAppointment />} />
        <Route path="/donor/appointments" element={<MyAppointments />} />

        {/* Receiver */}
        <Route path="/receiver/request" element={<RequestBlood />} />
        <Route path="/receiver/myrequests" element={<MyRequests />} />
        <Route path="/receiver/inventory" element={<InventoryView />} />

        {/* Admin */}
        <Route path="/admin/appointments" element={<ManageAppointments />} />
        <Route path="/admin/requests" element={<ManageRequests />} />
        <Route path="/admin/inventory" element={<InventoryDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
