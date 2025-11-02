import express from "express";
import { updateInventory, getInventory, approveRequest, rejectRequest } from "../controllers/inventoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin actions
router.post("/update", authMiddleware,authorizeRoles("admin"), updateInventory);
router.get("/get", authMiddleware,authorizeRoles("admin"), getInventory);
router.post("/approve/:requestId", authMiddleware,authorizeRoles("admin"), approveRequest);
router.post("/reject/:requestId", authMiddleware,authorizeRoles("admin"), rejectRequest);

// Read-only inventory for any authenticated user (receiver/donor)
router.get("/public", authMiddleware, getInventory);

export default router;
