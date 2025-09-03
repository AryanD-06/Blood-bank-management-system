import express from "express";
import {
  createAppointment,
  getAppointments,
  approveDonation,
  getAllAppointments 
} from "../controllers/appointmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js"; // <-- for role check

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("donor"), createAppointment);   // Donor books appointment
router.get("/", authMiddleware, roleMiddleware("donor"), getAppointments);      // Donor views appointments
router.get("/all", authMiddleware, roleMiddleware("admin"), getAllAppointments); // Admin views all appointments
router.post("/approve/:appointmentId", authMiddleware, roleMiddleware("admin"), approveDonation); // Admin approves donation

export default router;
