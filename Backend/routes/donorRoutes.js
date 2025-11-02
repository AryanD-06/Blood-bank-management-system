import express from "express";
import { createDonor } from "../controllers/donorController.js";

const router = express.Router();
router.post("/create", createDonor);
export default router;
