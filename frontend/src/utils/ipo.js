import axios from 'axios';

export const getPendingIPOs = async (token) => {
  const res = await axios.get("https://landshare-2.onrender.com//ipo/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const approveIPO = async (id, token) => {
  const res = await axios.put(`https://landshare-2.onrender.com//ipo/approve/${id}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


// src/utils/ipo.js
export const deleteIPO = async (id, token) => {
  const res = await fetch(`https://landshare-2.onrender.com//ipo/delete/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete IPO');
  return res.json();
};
