import Inventory from "../models/Inventory.js";
import Request from "../models/Request.js";

// Add/update inventory (Admin)
export const updateInventory = async (req, res) => {
  try {
    const { bloodGroup, units } = req.body;
    let record = await Inventory.findOne({ bloodGroup });

    if (record) {
      record.units += units; // increase stock
      record.lastUpdated = Date.now();
      await record.save();
    } else {
      record = new Inventory({ bloodGroup, units });
      await record.save();
    }

    res.json({ message: "Inventory updated", record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View inventory
export const getInventory = async (req, res) => {
  try {
    const stocks = await Inventory.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve request if stock available
export const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ error: "Already processed" });

    const stock = await Inventory.findOne({ bloodGroup: request.bloodGroup });
    if (!stock || stock.units < request.units) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    // Deduct stock
    stock.units -= request.units;
    await stock.save();

    // Mark request as approved
    request.status = "approved";
    await request.save();

    res.json({ message: "Request approved and stock updated", request, stock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
