import axios from "./api"; // your existing axios instance

// Get holdings by user email
export const getUserHoldings = (email) => {
  return axios.get(`/api/holdings/${encodeURIComponent(email)}`);
};
