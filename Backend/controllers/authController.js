import User from "../models/User.js";
import Donor from "../models/Donor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, ...otherFields } = req.body;

    // 1️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();

    // 4️⃣ If donor → validate & create donor profile
    if (role === "donor") {
      const age = Number(otherFields.age);
      const weight = Number(otherFields.weight);
      const hemoglobinLevel = Number(otherFields.hemoglobinLevel);
      const diseases =
        typeof otherFields.diseases === "string"
          ? otherFields.diseases.split(",").map((d) => d.trim().toLowerCase())
          : [];

      const eligible = checkEligibility(age, weight, hemoglobinLevel, diseases);

      if (!eligible) {
        // ❌ Delete user to keep data clean
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          error: "You are not eligible to donate blood.",
        });
      }

      const donor = new Donor({
        user: user._id,
        bloodGroup: otherFields.bloodGroup,
        age,
        weight,
        hemoglobinLevel,
        diseases,
        location: otherFields.location,
        eligible,
      });

      await donor.save();
    }

    res.status(201).json({ message: "Registration successful", user });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Helper: Eligibility check
const checkEligibility = (age, weight, hemoglobin, diseases) => {
  if (age < 18 || weight < 50 || hemoglobin < 12) return false;
  if (diseases.some((d) => d && d !== "none" && d !== "")) return false;
  return true;
};


// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
