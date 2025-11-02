import Appointment from "../models/Appointment.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";
import Donor from "../models/Donor.js";

// Donor books an appointment (with health + eligibility check)
// ✅ Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const { date, hospital, location } = req.body;
    console.log("[Appt][create] payload:", { user: req.user?.id, date, hospital, hasLocation: !!location });

    if (!hospital || !location || !location.coordinates) {
      console.warn("[Appt][create] missing fields", { hospitalPresent: !!hospital, locationPresent: !!location });
      return res.status(400).json({ error: "Hospital and location are required." });
    }

    // Fetch donor profile
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) {
      console.warn("[Appt][create] donor profile not found for user", req.user?.id);
      return res.status(404).json({ error: "Donor profile not found. Please complete registration first." });
    }

    // --- Eligibility checks ---
    const today = new Date();

    const lastDonationGap = donor.lastDonationDate
      ? Math.floor(
          (today.getTime() - new Date(donor.lastDonationDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : Infinity;

    // Normalize diseases: treat ["none"] or empty strings as no disease
    const cleanDiseases = (donor.diseases || []).filter(
      (d) => d && String(d).trim().toLowerCase() !== "none"
    );

    // Use donor.eligible flag established at registration + donation gap
    const isEligible = donor.eligible && lastDonationGap >= 90 && cleanDiseases.length === 0;

    if (!isEligible) {
      let reason = "You are not eligible to donate blood right now.";
      if (cleanDiseases.length > 0) reason = "You have disqualifying medical conditions.";
      else if (lastDonationGap < 90) reason = `You must wait ${90 - lastDonationGap} more days before donating again.`;
      console.warn("[Appt][create] ineligible:", { user: req.user?.id, donorEligible: donor.eligible, lastDonationGap, cleanDiseases });
      return res.status(400).json({ error: reason });
    }

    // --- Create appointment ---
    const normalizedLocation = {
      type: location.type || "Point",
      coordinates: location.coordinates,
    };

    const appointment = new Appointment({ donor: req.user.id, date, hospital, location: normalizedLocation, status: "pending" });

    await appointment.save();
    console.log("[Appt][create] created:", appointment._id);

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
    console.log("[Appt][all] requested by:", req.user?.id);

    // Step 1: populate donor as User (name, email)
    const appts = await Appointment.find()
      .populate("donor", "name email")
      .sort({ date: -1 })
      .lean();

    // Step 2: join donor profile from Donor collection to fetch bloodGroup and lastDonationDate
    const userIds = appts.map((a) => a.donor?._id).filter(Boolean);
    const donorProfiles = await Donor.find({ user: { $in: userIds } })
      .select("user bloodGroup lastDonationDate")
      .lean();
    const donorByUser = new Map(donorProfiles.map((d) => [String(d.user), d]));

    const merged = appts.map((a) => {
      const d = a.donor ? { ...a.donor } : null;
      const profile = a.donor ? donorByUser.get(String(a.donor._id)) : null;
      if (d && profile) {
        d.bloodGroup = profile.bloodGroup;
        d.lastDonationDate = profile.lastDonationDate;
      }
      return { ...a, donor: d };
    });

    console.log("[Appt][all] returned count:", merged.length);
    res.json(merged);
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
      { $inc: { units: 1 } },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("[Appt][approve] inventory updated:", inventoryUpdate);

    // Step 5: Update appointment status
    appointment.status = "completed";
    await appointment.save();

    // Update donor's last donation date to the appointment date
    donor.lastDonationDate = appointment.date;
    await donor.save();
    console.log("[Appt][approve] appointment completed and donor updated:", { appointmentId: appointment._id, donorId: donor._id });

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

