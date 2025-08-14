import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/api";
import { useAuth } from "../context/AuthContext";

function ContactUs() {
  const { user } = useAuth(); // Firebase logged-in user
  const [name, setName] = useState(user?.displayName || "");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/contact/send", {
        name,
        contact,
        message,
        email: user?.email,
      });

      alert("Message sent successfully!");
      navigate("/"); // redirect to homepage
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-200 p-6">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-lg transform transition-all hover:scale-[1.01]">
        <h2 className="text-3xl font-extrabold text-center text-green-700 mb-6">
          Contact Us
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Have any questions or feedback? We’d love to hear from you!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 focus:ring-2 focus:ring-green-400 rounded-lg p-3 w-full outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              placeholder="Enter your contact number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="border border-gray-300 focus:ring-2 focus:ring-green-400 rounded-lg p-3 w-full outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Your Message
            </label>
            <textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              className="border border-gray-300 focus:ring-2 focus:ring-green-400 rounded-lg p-3 w-full outline-none transition resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold shadow-lg transition duration-300 transform hover:scale-105"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactUs;
