import express from "express";
import { createRequest, getMyRequests, getAllRequests } from "../controllers/requestController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Receiver actions
router.post("/", authMiddleware,authorizeRoles("receiver"), createRequest);
router.get("/mine", authMiddleware,authorizeRoles("receiver"), getMyRequests);

// Admin action (to review all requests)
router.get("/", authMiddleware,authorizeRoles("admin"), getAllRequests);

export default router;
