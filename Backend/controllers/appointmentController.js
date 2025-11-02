import Appointment from "../models/Appointment.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";
import Donor from "../models/Donor.js";

// Donor books an appointment (with health + eligibility check)
// ✅ Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { date, hospital, location } = req.body;

    if (!hospital || !location || !location.coordinates) {
      return res.status(400).json({ error: "Hospital and location are required." });
    }

    // Fetch donor profile
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) {
      return res.status(404).json({
        error: "Donor profile not found. Please complete registration first.",
      });
    }

    // --- Eligibility checks ---
    const today = new Date();

    const lastDonationGap = donor.lastDonationDate
      ? Math.floor(
          (today.getTime() - new Date(donor.lastDonationDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : Infinity;

    const isEligible =
      donor.weight >= 50 &&
      donor.hemoglobinLevel >= 12.5 &&
      (!donor.diseases || donor.diseases.length === 0) &&
      lastDonationGap >= 90;

    if (!isEligible) {
      let reason = "You are not eligible to donate blood right now.";
      if (donor.weight < 50)
        reason = "Your weight must be at least 50 kg to donate blood.";
      else if (donor.hemoglobinLevel < 12.5)
        reason = "Your hemoglobin level must be at least 12.5 g/dL.";
      else if (donor.diseases && donor.diseases.length > 0)
        reason = "You have disqualifying medical conditions.";
      else if (lastDonationGap < 90)
        reason = `You must wait ${90 - lastDonationGap} more days before donating again.`;

      return res.status(400).json({ error: reason });
    }

    // --- Create appointment ---
    const appointment = new Appointment({
      donor: req.user.id,
      date,
      hospital,
      location,
      status: "pending",
    });

    await appointment.save();

    // Tentatively update last donation date (admin confirmation later)
    donor.lastDonationDate = date;
    await donor.save();

    res.status(201).json({
      message: "Appointment booked successfully.",
      appointment,
    });
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get all appointments of logged-in donor
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ donor: req.user.id });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Admin: Get all appointments with donor details
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("donor", "name email bloodGroup lastDonationDate") // ✅ include lastDonationDate
      .sort({ date: -1 }); // optional: newest first

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const approveDonation = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Step 2: Fetch donor details from Donors collection
    const donor = await Donor.findOne({ user: appointment.donor });
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Step 3: Validate donor blood group
    if (!donor.bloodGroup) {
      return res.status(400).json({ message: "Donor blood group missing" });
    }

    // Step 4: Update inventory
    const inventoryUpdate = await Inventory.findOneAndUpdate(
      { bloodGroup: donor.bloodGroup },
      { $inc: { quantity: 1 } },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("✅ Inventory updated:", inventoryUpdate);

    // Step 5: Update appointment status
    appointment.status = "completed";
    await appointment.save();

    res.json({ message: "Donation approved successfully" });

  } catch (err) {
    console.error("❌ Error approving donation:", err);
    res.status(500).json({
      message: "Failed to approve donation",
      error: err.message
    });
  }
};




export const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    if (appointment.status !== "pending") return res.status(400).json({ error: "Already processed" });

    appointment.status = "rejected";
    await appointment.save();

    res.json({ message: "Appointment rejected successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

