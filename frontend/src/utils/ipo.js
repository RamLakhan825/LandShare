import axios from 'axios';

export const getPendingIPOs = async (token) => {
  const res = await axios.get("http://localhost:5000/ipo/pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const approveIPO = async (id, token) => {
  const res = await axios.put(`http://localhost:5000/ipo/approve/${id}`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


// src/utils/ipo.js
export const deleteIPO = async (id, token) => {
  const res = await fetch(`http://localhost:5000/ipo/delete/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to delete IPO');
  return res.json();
};
