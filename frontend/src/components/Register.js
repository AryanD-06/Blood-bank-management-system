import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Fix Leaflet marker icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "donor",
    bloodGroup: "",
    age: "",
    weight: "",
    hemoglobinLevel: "",
    diseases: "",
  });

  const [location, setLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(true);
  const navigate = useNavigate();

  // ✅ Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setFetchingLocation(false);
        },
        (err) => {
          console.warn("Location access denied:", err);
          setFetchingLocation(false);
        }
      );
    } else setFetchingLocation(false);
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        bloodGroup: formData.bloodGroup,
        age: formData.age,
        weight: formData.weight,
        hemoglobinLevel: formData.hemoglobinLevel,
        diseases: formData.diseases,
        location: location
          ? {
              type: "Point",
              coordinates: [location.longitude, location.latitude],
            }
          : undefined,
      };

      // 🔹 POST request to backend
      const res = await api.post("/auth/register", baseData);

      // ✅ Backend returns both user + donor info
      alert("✅ Registration successful!");

      if (res.data?.donor && res.data.donor.eligible === false) {
        alert("⚠️ Note: You are currently not eligible to donate blood.");
      }

      navigate("/login");
    } catch (err) {
      alert(
        "❌ Registration failed: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  return (
    <div className="container-fluid py-5 bg-light">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-md-11 shadow-lg bg-white rounded overflow-hidden">
          <div className="row">
            {/* Left Image */}
            <div className="col-md-5 d-none d-md-block p-0">
              <img
                src="https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5?auto=format&fit=crop&w=900&q=80"
                alt="Blood Donation"
                className="img-fluid h-100"
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Right Form */}
            <div
              className="col-md-7 p-4"
              style={{ maxHeight: "90vh", overflowY: "auto" }}
            >
              <h2 className="text-center text-danger mb-4">Create Account</h2>
              <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Password & Role */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-control"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="donor">Donor</option>
                      <option value="receiver">Receiver</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Donor Info */}
                {formData.role === "donor" && (
                  <>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Blood Group</label>
                        <select
                          className="form-control"
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          required
                        >
                          <option value="">-- Select --</option>
                          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(
                            (bg) => (
                              <option key={bg} value={bg}>
                                {bg}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Age</label>
                        <input
                          type="number"
                          className="form-control"
                          name="age"
                          min="18"
                          max="65"
                          value={formData.age}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Weight (kg)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="weight"
                          min="40"
                          value={formData.weight}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Hemoglobin Level (g/dL)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control"
                          name="hemoglobinLevel"
                          min="10"
                          value={formData.hemoglobinLevel}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">
                          Diseases (comma separated)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="diseases"
                          placeholder="e.g. none or diabetes"
                          value={formData.diseases}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Map Location */}
                <div className="mb-3">
                  <label className="form-label">Your Location</label>
                  {fetchingLocation ? (
                    <p className="text-muted">Fetching location...</p>
                  ) : location ? (
                    <>
                      <div
                        className="border rounded"
                        style={{ height: "200px", width: "100%" }}
                      >
                        <MapContainer
                          center={[location.latitude, location.longitude]}
                          zoom={13}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker
                            position={[location.latitude, location.longitude]}
                          >
                            <Popup>Your Current Location</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                      <p className="small mt-2 text-muted">
                        Lat: {location.latitude.toFixed(4)} | Lng:{" "}
                        {location.longitude.toFixed(4)}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted">
                      Unable to detect location. Please enable GPS.
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn-danger w-100 mt-2">
                  Register
                </button>
              </form>

              <p className="mt-3 text-center">
                Already have an account?{" "}
                <Link to="/login" className="link-danger fw-bold">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
