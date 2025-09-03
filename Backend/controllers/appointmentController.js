import Appointment from "../models/Appointment.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";

// Donor books an appointment (no inventory update here)
export const createAppointment = async (req, res) => {
  try {
    const { date } = req.body;

    // Create appointment with status "pending"
    const appointment = new Appointment({
      donor: req.user.id,
      date,
      status: "pending"
    });

    await appointment.save();

    res.status(201).json({
      message: "Appointment booked (waiting for admin approval)",
      appointment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      .populate("donor", "name email bloodGroup"); // fetch donor info
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin approves donation (update stock + mark appointment completed)
export const approveDonation = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId).populate("donor");
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    if (appointment.status !== "pending")
      return res.status(400).json({ error: "Appointment already processed" });

    // Get donor details
    const donor = appointment.donor;
    if (!donor || !donor.bloodGroup) {
      return res.status(400).json({ error: "Donor blood group not found" });
    }

    // Update inventory for donor's blood group
    let inventory = await Inventory.findOne({ bloodGroup: donor.bloodGroup });
    if (inventory) {
      inventory.units += 1;
      await inventory.save();
    } else {
      inventory = new Inventory({ bloodGroup: donor.bloodGroup, units: 1 });
      await inventory.save();
    }

    // Mark appointment as completed
    appointment.status = "completed";
    await appointment.save();

    res.json({
      message: "Donation approved & inventory updated",
      appointment,
      inventory,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
