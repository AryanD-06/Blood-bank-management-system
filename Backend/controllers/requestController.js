import Request from "../models/Request.js";

// Create new request
export const createRequest = async (req, res) => {
  try {
    const { bloodGroup, units, urgency } = req.body;
    const request = new Request({ receiver: req.user.id, bloodGroup, units, urgency });
    await request.save();
    res.status(201).json({ message: "Blood request created", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get requests of logged-in receiver
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ receiver: req.user.id });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// (Later for Admin) Get all requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate("receiver", "name email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
