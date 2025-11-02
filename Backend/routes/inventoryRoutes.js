import express from "express";
import { updateInventory, getInventory, approveRequest } from "../controllers/inventoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin actions
router.post("/update", authMiddleware,authorizeRoles("admin"), updateInventory);
router.get("/get", authMiddleware,authorizeRoles("admin"), getInventory);
router.post("/approve/:requestId", authMiddleware,authorizeRoles("admin"), approveRequest);
//router.get("/get", authMiddleware,authorizeRoles("admin"), getInventory);


export default router;
