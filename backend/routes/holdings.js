


// const express = require("express");
// const Holding = require("../models/Holding");
// const Ipo = require("../models/Ipo");
// const { authenticateToken } = require("../middlewares/auth");

// const router = express.Router();

// // Association
// Holding.belongsTo(Ipo, { foreignKey: "ipoId" });

// // ✅ Get holdings for the logged-in user (secure)
// router.get("/my", authenticateToken, async (req, res) => {
//   try {
//     const email = req.user.email; // email comes from JWT
//     const holdings = await Holding.findAll({
//       where: { userEmail: email },
//       include: [{ model: Ipo }],
//     });

//     res.json(holdings);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch holdings" });
//   }
// });

// // ✅ Get holdings for a specific email (public — for admin or testing)
// router.get("/:email", async (req, res) => {
//   try {
//     const { email } = req.params;
//     const holdings = await Holding.findAll({
//       where: { userEmail: email },
//       include: [{ model: Ipo }],
//     });
//     res.json(holdings);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch holdings" });
//   }
// });

// module.exports = router;


const express = require("express");
const Holding = require("../models/Holding");
const Ipo = require("../models/Ipo");
const { authenticateToken } = require("../middlewares/auth");

const router = express.Router();

// ✅ Get holdings for the logged-in user
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email; // email comes from JWT
    const holdings = await Holding.findAll({
      where: { userEmail: email },
      include: [{ model: Ipo }],
    });

    res.json(holdings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

// ✅ Get holdings for a specific email (admin/testing)
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const holdings = await Holding.findAll({
      where: { userEmail: email },
      include: [{ model: Ipo }],
    });
    res.json(holdings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

module.exports = router;
