import Request from "../models/Request.js";
import User from "../models/User.js";       // adjust path if different
import Inventory from "../models/Inventory.js"; // adjust path if different

// Create new request
export const createRequest = async (req, res) => {
  try {
    const { bloodGroup, units, urgency, location } = req.body;
    console.log("[Requests][create] payload:", { user: req.user?.id, bloodGroup, units, urgency, hasLocation: !!location });

    // Normalize location to GeoJSON Point if coordinates provided without type
    let normalizedLocation = undefined;
    if (location && Array.isArray(location.coordinates)) {
      normalizedLocation = {
        type: location.type || "Point",
        coordinates: location.coordinates,
      };
    }
    // Add date or default to now
    const request = new Request({
      receiver: req.user.id,
      bloodGroup,
      units,
      urgency,
      date: new Date(),
      location: normalizedLocation,
    });
    await request.save();
    console.log("[Requests][create] created:", request._id);
    res.status(201).json({ message: "Blood request created", request });
  } catch (err) {
    console.error("[Requests][create] error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get requests of logged-in receiver
export const getMyRequests = async (req, res) => {
  try {
    console.log("[Requests][mine] user:", req.user?.id);
    const requests = await Request.find({ receiver: req.user.id });
    res.json(requests);
  } catch (err) {
    console.error("[Requests][mine] error:", err);
    res.status(500).json({ error: err.message });
  }
};

// (Later for Admin) Get all requests
export const getAllRequests = async (req, res) => {
  try {
    console.log("[Requests][all] by:", req.user?.id);
    const requests = await Request.find().populate("receiver", "name email");
    res.json(requests);
  } catch (err) {
    console.error("[Requests][all] error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ NEW: Dashboard stats for Admin
export const getStats = async (req, res) => {
  try {
    console.log("[Requests][stats] by:", req.user?.id);
    const donors = await User.countDocuments({ role: "donor" });
    const totalUnits = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);
    const pending = await Request.countDocuments({ status: "pending" });

    res.json({
      donors,
      units: totalUnits[0]?.total || 0,
      pending,
    });
  } catch (err) {
    console.error("[Requests][stats] error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
