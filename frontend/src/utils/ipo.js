import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const getPendingIPOs = async (token) => {
  const res = await axios.get(`${BASE_URL}/ipo/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const approveIPO = async (id, token) => {
  const res = await axios.put(`${BASE_URL}/ipo/approve/${id}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


// src/utils/ipo.js
export const declineIPO = async (id, token) => {
  const res = await axios.delete(`${BASE_URL}/ipo/decline/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete IPO');
  return res.json();
};
