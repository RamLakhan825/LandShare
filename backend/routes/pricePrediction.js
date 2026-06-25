// routes/pricePrediction.js
const express = require("express");
const router = express.Router();
const { PredictedPrice } = require("../models");
const { Ipo } = require("../models");


router.get("/:ipoId/latest", async (req, res) => {
  try {
    const ipoId = req.params.ipoId;

    const latestPrediction = await PredictedPrice.findOne({
      where: { ipoId },
      order: [["createdAt", "DESC"]],
    });

    if (!latestPrediction) return res.json({ predictedPrice: null });

    res.json({ predictedPrice: parseFloat(latestPrediction.predictedClose) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch latest prediction" });
  }
});


module.exports = router;
