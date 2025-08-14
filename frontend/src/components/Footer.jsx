// src/components/Footer.jsx
import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-700 pb-4">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-green-400">LandShare</h1>

          {/* Navigation Links */}
          {/* <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/" className="hover:text-green-400">Home</a>
            <a href="/dashboard" className="hover:text-green-400">Dashboard</a>
            <a href="/ipo" className="hover:text-green-400">Land Share IPO</a>
            <a href="/contact" className="hover:text-green-400">Contact Us</a>
          </div> */}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4">
          {/* Copyright */}
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} LandShare. All Rights Reserved.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
              <FaFacebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
              <FaTwitter size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
              <FaLinkedin size={20} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
