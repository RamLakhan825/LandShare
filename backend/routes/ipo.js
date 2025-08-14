// // routes/ipo.js
// const express = require("express");
// const router = express.Router();
// const ipoController = require("../controllers/ipoController");
// const { upload } = require("../utils/cloudinary"); // ✅ Use cloudinary upload
// const { authenticateToken } = require('../middlewares/auth'); // ✅ adjust the path if needed
// const Ipo = require('../models/Ipo');
// const PriceHistory = require("../models/PriceHistory");

// const multipleUpload = upload.fields([
//   { name: "aadhar", maxCount: 1 },
//   { name: "land_doc", maxCount: 1 },
//   { name: "signature", maxCount: 1 },
//   { name: "photo", maxCount: 1 },
// ]);

// router.post("/create", authenticateToken,multipleUpload, ipoController.createIPO);
// router.get("/approved", ipoController.getApprovedIPOs);
// router.get("/pending", ipoController.getPendingIPOs);
// router.put("/approve/:id", ipoController.approveIPO);
// router.delete("/decline/:id", ipoController.declineIPO);
// router.get("/list", ipoController.getAllIPOs);


// // Get price history candles for an IPO
// router.get("/:id/price-history", async (req, res) => {
//   try {
//     const ipoId = req.params.id;

//     // Fetch last 30 price candles sorted by timestamp ascending
//     const candles = await PriceHistory.findAll({
//       where: { ipoId },
//       order: [["timestamp", "ASC"]],
//       limit: 30,
//     });

//     res.json(candles);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error fetching price history" });
//   }
// });



// module.exports = router;


// routes/ipo.js
const express = require("express");
const router = express.Router();
const ipoController = require("../controllers/ipoController");
const { upload } = require("../utils/cloudinary");
const { authenticateToken } = require("../middlewares/auth");
const Ipo = require('../models/Ipo');
const PriceHistory = require("../models/PriceHistory");

// File upload config (Cloudinary)
const multipleUpload = upload.fields([
  { name: "aadhar", maxCount: 2 },
  { name: "land_doc", maxCount: 10 },
  { name: "signature", maxCount: 1 },
  { name: "photo", maxCount: 1 },
]);

// ✅ Routes
router.post("/create", authenticateToken, multipleUpload, ipoController.createIPO);
router.get("/approved", ipoController.getApprovedIPOs);
router.get("/pending", ipoController.getPendingIPOs);
router.put("/approve/:id", ipoController.approveIPO);
router.delete("/decline/:id", ipoController.declineIPO);
router.get("/list", ipoController.getAllIPOs);

// ✅ Price history for an IPO
router.get("/:id/price-history", async (req, res) => {
  try {
    const ipoId = req.params.id;

    // Fetch last 30 price candles sorted by timestamp ascending
    const candles = await PriceHistory.findAll({
      where: { ipoId },
      order: [["timestamp", "ASC"]],
      limit: 100,
    });

    res.json(candles);
  } catch (err) {
    console.error("Error fetching price history:", err);
    res.status(500).json({ error: "Server error fetching price history" });
  }
});

module.exports = router;
