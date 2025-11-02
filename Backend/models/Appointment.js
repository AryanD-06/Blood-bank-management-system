import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    hospital: { type: String, required: true }, // 🏥 New field
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled","rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// 🧭 Add geospatial index for queries (optional but good)
appointmentSchema.index({ location: "2dsphere" });

export default mongoose.model("Appointment", appointmentSchema);
