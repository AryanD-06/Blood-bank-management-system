import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true, // Prevent duplicate donor profiles
    required: true,
  },
  bloodGroup: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  hemoglobinLevel: { type: Number, required: true },
  diseases: [{ type: String }],
  lastDonationDate: { type: Date },
  eligible: { type: Boolean, default: false },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
});

export default mongoose.model("Donor", donorSchema);
