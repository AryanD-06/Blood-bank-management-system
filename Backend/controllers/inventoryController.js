import Inventory from "../models/Inventory.js";
import Request from "../models/Request.js";

// Add/update inventory (Admin)
export const updateInventory = async (req, res) => {
  try {
    const { bloodGroup, units } = req.body;
    console.log("[Inventory][update] payload:", { bloodGroup, units, by: req.user?.id });
    let record = await Inventory.findOne({ bloodGroup });

    if (record) {
      record.units += units; // increase stock
      record.lastUpdated = Date.now();
      await record.save();
      console.log("[Inventory][update] updated record:", record);
    } else {
      record = new Inventory({ bloodGroup, units });
      await record.save();
      console.log("[Inventory][update] created record:", record);
    }

    res.json({ message: "Inventory updated", record });
  } catch (err) {
    console.error("[Inventory][update] error:", err);
    res.status(500).json({ error: err.message });
  }
};

// View inventory
export const getInventory = async (req, res) => {
  try {
    console.log("[Inventory][get] requested by:", req.user?.id);
    const stocks = await Inventory.find();
    console.log("[Inventory][get] count:", stocks.length);
    res.json(stocks);
  } catch (err) {
    console.error("[Inventory][get] error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Approve request if stock available
export const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log("[Requests][approve] requestId:", requestId, "by:", req.user?.id);
    const request = await Request.findById(requestId);

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ error: "Already processed" });

    const stock = await Inventory.findOne({ bloodGroup: request.bloodGroup });
    if (!stock || stock.units < request.units) {
      console.warn("[Requests][approve] insufficient stock", {
        bloodGroup: request.bloodGroup,
        have: stock?.units || 0,
        need: request.units,
      });
      return res.status(400).json({ error: "Not enough stock" });
    }

    // Deduct stock
    stock.units -= request.units;
    await stock.save();
    console.log("[Requests][approve] stock updated:", stock);

    // Mark request as approved
    request.status = "approved";
    await request.save();
    console.log("[Requests][approve] request approved:", request._id);

    res.json({ message: "Request approved and stock updated", request, stock });
  } catch (err) {
    console.error("[Requests][approve] error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Reject request (Admin)
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log("[Requests][reject] requestId:", requestId, "by:", req.user?.id);
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ error: "Already processed" });

    request.status = "rejected";
    await request.save();
    console.log("[Requests][reject] request rejected:", request._id);

    res.json({ message: "Request rejected", request });
  } catch (err) {
    console.error("[Requests][reject] error:", err);
    res.status(500).json({ error: err.message });
  }
};
