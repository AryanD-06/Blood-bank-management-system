import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  bloodGroup: { 
    type: String, 
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], 
    required: true 
  },
  units: { 
    type: Number, 
    required: true 
  },
  urgency: { 
    type: String, 
    enum: ["normal", "urgent"], 
    default: "normal" 
  },
  
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "fulfilled"], 
    default: "pending" 
  },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
  },
  // Added date field
  date: {
    type: Date,
    default: Date.now // Automatically sets the current date and time
  },
}, { timestamps: true }); // This option also adds createdAt and updatedAt fields

export default mongoose.model("Request", requestSchema);