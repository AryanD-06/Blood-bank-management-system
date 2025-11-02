// controllers/donorController.js
import Donor from "../models/Donor.js";

export const createDonor = async (req, res) => {
  try {
    const donor = await Donor.create(req.body);
    res.status(201).json({ message: "Donor created successfully", donor });
  } catch (err) {
    console.error("❌ Donor creation failed:", err);
    res.status(400).json({ error: err.message });
  }
};
