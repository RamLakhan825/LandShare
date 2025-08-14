import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const IpoForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    owner_name: "",
    contact_no: "",
    email: "",
    land_size: "",
    land_cost_per_share: "",
    available_shares: "",
    address: "",
    facilities: "",
  });

  const [files, setFiles] = useState({
    aadhar: null,
    land_doc: null,
    signature: null,
    photo: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    Object.entries(files).forEach(([key, file]) => {
      if (file) data.append(key, file);
    });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/ipo/create", data, {
  headers: {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  },
});
      console.log("IPO Created", res.data);
      alert("IPO Created Successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating IPO:", error);
      alert("Failed to submit IPO");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 flex items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-8 space-y-5 animate-fade-in"
        encType="multipart/form-data"
      >
        <h2 className="text-3xl font-bold text-center text-purple-700">Submit Land IPO</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="owner_name"
            placeholder="Owner Name"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="text"
            name="contact_no"
            placeholder="Contact Number"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="number"
            name="land_size"
            placeholder="Land Size (in sq. ft.)"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="number"
            name="land_cost_per_share"
            placeholder="Share Price (₹)"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
  type="number"
  name="available_shares"
  placeholder="Available Shares"
  min={1}
  onChange={handleChange}
  required
  className="input-field"
/>
          <input
            type="text"
            name="address"
            placeholder="Address"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="text"
            name="facilities"
            placeholder="Facilities (e.g., Water, Electricity)"
            onChange={handleChange}
            className="input-field col-span-1 md:col-span-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-purple-700">Aadhar</label>
            <input type="file" name="aadhar" onChange={handleFileChange} className="file-input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-purple-700">Land Document</label>
            <input type="file" name="land_doc" onChange={handleFileChange} className="file-input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-purple-700">Signature</label>
            <input type="file" name="signature" onChange={handleFileChange} className="file-input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-purple-700">Photo</label>
            <input type="file" name="photo" onChange={handleFileChange} className="file-input" />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-full text-white bg-pink-500 hover:bg-pink-600 transition-all shadow-md"
          >
            ← Back to Homepage
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md"
          >
            Submit IPO
          </button>
        </div>
      </form>
    </div>
  );
};

export default IpoForm;
