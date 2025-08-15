// src/api/transactions.js
import axios from "axios";
const API = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL || "https://landshare-2.onrender.com/" });

export const createOrder = (payload) => API.post("/transaction/create-order", payload);
export const verifyPayment = (payload) => API.post("/transaction/verify", payload);
export const getUserTransactions = (email) => API.get(`/transaction/user/${encodeURIComponent(email)}`);
// src/api/transactions.js (extend)

export const createSellOrder = (payload) => API.post("/transaction/sell-order", payload);
export const verifySellPayment = (payload) => API.post("/transaction/verify-sell", payload);
export const createPayout = (payload) => API.post("/transaction/payout", payload);
