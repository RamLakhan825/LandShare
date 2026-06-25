// backend/routes/accuracy.js
const express = require("express");
const router = express.Router();
const { getIpoAccuracy } = require("../utils/accuracyCalculator");

router.get("/:id/accuracy", async (req, res) => {
  const ipoId = req.params.id;
  try {
    const accuracy = await getIpoAccuracy(ipoId);
    if (!accuracy) return res.status(404).json({ message: "Not enough data to calculate accuracy" });
    res.json(accuracy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
