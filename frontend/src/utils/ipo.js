import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

export const getPendingIPOs = async (token) => {
  const res = await axios.get(`${BASE_URL}/ipo/pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const approveIPO = async (id, token) => {
  const res = await axios.put( `${BASE_URL}/ipo/approve/${id}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


// src/utils/ipo.js
export const declineIPO = async (id, token) => {
  const res = await fetch(`https://landshare-2.onrender.com/ipo/decline/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete IPO');
  return res.json();
};
