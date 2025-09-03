import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], required: true },
  units: { type: Number, required: true },
  urgency: { type: String, enum: ["normal", "urgent"], default: "normal" },
  status: { type: String, enum: ["pending", "approved", "rejected", "fulfilled"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
