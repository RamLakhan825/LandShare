import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react"; // nice icons

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center relative">
      {/* Logo */}
      <h1
        className="text-2xl font-bold text-green-600 cursor-pointer"
        onClick={() => navigate("/home")}
      >
        LandShare
      </h1>

      {/* Desktop Buttons */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={() => navigate("/ipo-form")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add IPO
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          My Dashboard
        </button>
        <button
          onClick={() => navigate("/contact")}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Contact Us
        </button>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 rounded hover:bg-gray-100"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform z-50 md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-green-600">Menu</h2>
          <button onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-4">
          <button
            onClick={() => {
              navigate("/ipo-form");
              toggleSidebar();
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add IPO
          </button>
          <button
            onClick={() => {
              navigate("/dashboard");
              toggleSidebar();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            My Dashboard
          </button>
          <button
            onClick={() => {
              navigate("/contact");
              toggleSidebar();
            }}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Contact Us
          </button>
          <button
            onClick={() => {
              logout();
              toggleSidebar();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
