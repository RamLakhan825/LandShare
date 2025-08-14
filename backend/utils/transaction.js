// utils/transaction.js
const axios = require("axios");

const RAZORPAYX_API_KEY = process.env.RAZORPAYX_API_KEY;
const RAZORPAYX_API_SECRET = process.env.RAZORPAYX_API_SECRET;
const RAZORPAYX_ACCOUNT_NUMBER = process.env.RAZORPAYX_ACCOUNT_NUMBER;

const razorpayAxios = axios.create({
  baseURL: "https://api.razorpay.com/v1/",
  auth: {
    username: RAZORPAYX_API_KEY,
    password: RAZORPAYX_API_SECRET,
  },
});

// Create payout to seller
async function createPayout(accountNumber, ifsc, amount, sellerName) {
  try {
    // 1️⃣ Create Contact
    const contactRes = await razorpayAxios.post("contacts", {
      name: sellerName,
      type: "vendor", // seller
    });
    const contactId = contactRes.data.id;

    // 2️⃣ Create Fund Account
    const fundAccountRes = await razorpayAxios.post("fund_accounts", {
      contact_id: contactId,
      account_type: "bank_account",
      bank_account: {
        name: sellerName,
        ifsc: ifsc,
        account_number: accountNumber,
      },
    });
    const fundAccountId = fundAccountRes.data.id;

    // 3️⃣ Create Payout
    const payoutRes = await razorpayAxios.post("payouts", {
      account_number: RAZORPAYX_ACCOUNT_NUMBER,
      fund_account_id: fundAccountId,
      amount: amount, // paise
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
    });

    return payoutRes.data;
  } catch (err) {
    console.error("Error creating payout:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { createPayout };
