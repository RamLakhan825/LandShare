const express = require("express");
const router = express.Router();
const { PredictedPriceV2 } = require("../models");

router.get("/:ipoId/latest", async (req, res) => {
  try {
    const ipoId = req.params.ipoId;

    const latest = await PredictedPriceV2.findOne({
      where: { ipoId },
      order: [["createdAt", "DESC"]],
    });

    res.json({ predictedPriceV2: latest ? parseFloat(latest.predictedClose) : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch model2 prediction" });
  }
});

module.exports = router;
