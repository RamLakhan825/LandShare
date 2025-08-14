// routes/transactions.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const axios = require("axios");

const Ipo = require("../models/Ipo");
const Transaction = require("../models/Transaction");
const Holding = require("../models/Holding");

// set up instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// helper: RazorpayX API instance
const razorpayX = axios.create({
  baseURL: "https://api.razorpay.com/v1/",
  auth: {
    username: process.env.RAZORPAY_KEY_ID,
    password: process.env.RAZORPAY_KEY_SECRET
  }
});

// Create a new Razorpay order and pending transaction
router.post("/create-order", async (req, res) => {
  try {
    const { ipoId, shares, buyerEmail } = req.body;
    //console.log("Create order body:", req.body);

    if (!ipoId || !shares || !buyerEmail) return res.status(400).json({ error: "Missing fields" });

    const ipo = await Ipo.findByPk(ipoId);
    if (!ipo || !ipo.approved) return res.status(400).json({ error: "IPO not available" });

    if (ipo.availableShares < shares) return res.status(400).json({ error: "Not enough shares available" });

    const pricePerShare = parseFloat(ipo.shareCost || ipo.sharePrice); // field name
    const totalAmount = +(pricePerShare * shares).toFixed(2);
    const adminFee = +((totalAmount * 0.01)).toFixed(2);
    const payableAmount = Math.round((totalAmount + adminFee) * 100); // paise

    // create Razorpay order
    const order = await razorpay.orders.create({
      amount: payableAmount,
      currency: "INR",
      receipt: `ipo_${ipoId}_${Date.now()}`
    });

    // create pending transaction in DB
    const tx = await Transaction.create({
      ipoId,
      buyerEmail,
      shares,
      pricePerShare,
      totalAmount,
      adminFee,
      status: "pending"
    });

    // return order details and local transaction id
    res.json({ orderId: order.id, amount: payableAmount, currency: "INR", txId: tx.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify payment (Razorpay handler) -> mark transaction complete, update holdings and ipo, emit socket event
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, txId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !txId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // validate signature
    const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // mark tx failed
      await Transaction.update({ status: "failed", paymentId: razorpay_payment_id }, { where: { id: txId } });
      return res.status(400).json({ error: "Invalid signature" });
    }

    // mark tx completed
    const tx = await Transaction.findByPk(txId);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    tx.paymentId = razorpay_payment_id;
    tx.status = "completed";
    await tx.save();

    // update IPO available shares atomically
    const ipo = await Ipo.findByPk(tx.ipoId);
    if (!ipo) return res.status(404).json({ error: "IPO not found" });

    // decrease available shares
    // ipo.availableShares = ipo.availableShares - tx.shares;
    // await ipo.save();
    ipo.availableShares = parseInt(ipo.availableShares) - parseInt(tx.shares);
const increasePercent = (Math.random() * 4 + 1) / 100;
ipo.shareCost = parseFloat((parseFloat(ipo.shareCost) * (1 + increasePercent)).toFixed(2));
await ipo.save();



    // Random increase between 1% and 5%
// const increasePercent = (Math.random() * 4 + 1) / 100;  // 0.01 to 0.05
// ipo.shareCost = (parseFloat(ipo.shareCost) * (1 + increasePercent)).toFixed(2);
// await ipo.save();


    // update holdings for buyer
    const [holding, created] = await Holding.findOrCreate({
      where: { ipoId: tx.ipoId, userEmail: tx.buyerEmail },
      defaults: { shares: tx.shares, purchasePrice: tx.pricePerShare }
    });
    if (!created) {
      const totalShares = parseInt(holding.shares) + parseInt(tx.shares);
      if (totalShares === 0) {
    holding.purchasePrice = 0;
  } else {
    const totalCost = (parseFloat(holding.purchasePrice) * parseInt(holding.shares)) + (parseFloat(tx.pricePerShare) * parseInt(tx.shares));
    holding.purchasePrice = totalCost / totalShares;
  }
  holding.shares = totalShares;
  await holding.save();
    }

    // emit socket.io update (global) using app.io if set on app
    if (global.io) {
      // emit event with updated ipo id and availableShares
      global.io.emit("ipo:update", { ipoId: ipo.id, availableShares: ipo.availableShares });
      // optionally emit new transaction
      global.io.emit("transaction:new", { txId: tx.id, ipoId: ipo.id });
    }

    res.json({ success: true, txId: tx.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// get transactions for a user
router.get("/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const txs = await Transaction.findAll({ where: { buyerEmail: email }, order: [["createdAt", "DESC"]] });
    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// SELL ORDER: User wants to sell shares they hold
router.post("/sell-order", async (req, res) => {
  try {
    const { ipoId, shares, sellerEmail } = req.body;
    if (!ipoId || !shares || !sellerEmail)
      return res.status(400).json({ error: "Missing fields" });

    // Check seller holdings
    const holding = await Holding.findOne({ where: { ipoId, userEmail: sellerEmail } });
    if (!holding || holding.shares < shares) {
      return res.status(400).json({ error: "Insufficient shares to sell" });
    }

    const ipo = await Ipo.findByPk(ipoId);
    if (!ipo || !ipo.approved) return res.status(400).json({ error: "IPO not available" });

    const pricePerShare = parseFloat(ipo.sharePrice || ipo.shareCost);
    const totalAmount = +(pricePerShare * shares).toFixed(2);
    const adminFee = +((totalAmount * 0.01)).toFixed(2);
    const payableAmount = Math.round((totalAmount - adminFee) * 100); // paise, seller receives after fees

    // create Razorpay order for payout to seller
    const order = await razorpay.orders.create({
      amount: payableAmount,
      currency: "INR",
      receipt: `ipo_sell_${ipoId}_${Date.now()}`,
      payment_capture: 1,
    });

    // create pending sell transaction
    const tx = await Transaction.create({
      ipoId,
      sellerEmail,
      shares,
      pricePerShare,
      totalAmount,
      adminFee,
      status: "pending",
    });

    res.json({ orderId: order.id, amount: payableAmount, currency: "INR", txId: tx.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// VERIFY SELL PAYMENT (Payout verification)
router.post("/verify-sell", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, txId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !txId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // validate signature
    const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      await Transaction.update({ status: "failed", paymentId: razorpay_payment_id }, { where: { id: txId } });
      return res.status(400).json({ error: "Invalid signature" });
    }

    // mark transaction completed
    const tx = await Transaction.findByPk(txId);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    tx.paymentId = razorpay_payment_id;
    tx.status = "completed";
    await tx.save();

    // update IPO available shares (increase by shares sold)
    const ipo = await Ipo.findByPk(tx.ipoId);
    if (!ipo) return res.status(404).json({ error: "IPO not found" });

    ipo.availableShares = ipo.availableShares + tx.shares;
    await ipo.save();

    // update seller holdings (decrease shares)
    const holding = await Holding.findOne({ where: { ipoId: tx.ipoId, userEmail: tx.sellerEmail } });
    if (!holding || holding.shares < tx.shares) {
      return res.status(400).json({ error: "Invalid holdings" });
    }
    holding.shares = holding.shares - tx.shares;
    await holding.save();


    // Random decrease between 1% and 5%
const decreasePercent = (Math.random() * 4 + 1) / 100;  // 0.01 to 0.05
ipo.shareCost = (parseFloat(ipo.shareCost) * (1 - decreasePercent)).toFixed(2);

// Prevent shareCost from going too low (e.g., minimum 10)
if (parseFloat(ipo.shareCost) < 10) ipo.shareCost = "10.00";

await ipo.save();

    // Emit socket.io updates for real-time frontend sync
    if (global.io) {
      global.io.emit("ipo:update", { ipoId: ipo.id, availableShares: ipo.availableShares });
      global.io.emit("holding:update", { userEmail: tx.sellerEmail, ipoId: ipo.id });
      global.io.emit("transaction:new", { txId: tx.id, ipoId: ipo.id });
    }

    

    res.json({ success: true, txId: tx.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PAYOUT via RazorpayX
router.post("/payout", async (req, res) => {
  try {
    const { sellerEmail, amount, bankDetails } = req.body;
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET
    // });
    console.log("Payout request body:", { sellerEmail, amount, bankDetails });


    // Step 1: Create Contact
    const contactRes = await razorpayX.post("contacts", {
      name: bankDetails.accountHolderName,
      email: sellerEmail,
      type: "vendor"
    });
    console.log("Contact response:", contactRes.data);
    
    // Step 2: Create Fund Account
    const fundRes = await razorpayX.post("fund_accounts", {
      contact_id: contactRes.data.id,
      account_type: "bank_account",
      bank_account: {
        name: bankDetails.accountHolderName,
        ifsc: bankDetails.ifsc,
        account_number: bankDetails.accountNumber
      }
    });
    console.log("Fund response:", fundRes.data);


    // Step 3: Create Payout
    const payoutRes = await razorpayX.post("payouts", {
      account_number: process.env.ADMIN_ACCOUNT_NUMBER,
      fund_account_id: fundRes.data.id,
      amount: amount/100, // already in paise
      currency: "INR",
      mode: "NEFT",
      purpose: "payout"
    });

    res.json({ success: true, payout:payoutRes.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
