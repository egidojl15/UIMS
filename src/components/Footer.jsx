import React from "react";
import { FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom"; // Import Link

const Footer = () => (
  <footer className="bg-[#06172E] text-white mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-lg font-bold mb-4">
            Upper Ichon Management System
          </h4>
          <p className="text-sm text-gray-300">
            Serving the community with digital excellence since 2025.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/announcements"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Announcements
              </Link>
            </li>
            <li>
              <Link
                to="/events"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                to="/spotmap"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Spot Map
              </Link>
            </li>
            <li>
              <Link
                to="/projectactivity"
                className="text-gray-300 hover-white transition-colors"
              >
                Project Activity
              </Link>
            </li>

            <li>
              <Link
                to="/officials"
                className="text-gray-300 hover-white transition-colors"
              >
                Officials
              </Link>
            </li>

            <li>
              <Link
                to="/request"
                className="text-gray-300 hover-white transition-colors"
              >
                Requests
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="text-gray-300 hover-white transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4">Contact Info</h4>
          <p className="text-sm text-gray-300">
            📍 Upper Ichon, Macrohon, Southern Leyte, 6601
            <br />
            📞 (09)38-392-2490 <br />
            ✉️ barangayupperichon@gmail.com <br />
            <a
              href="https://www.facebook.com/barangay.upperichon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-blue-400 transition-colors"
            >
              <FaFacebook className="mr-2" />
              Barangay Upper Ichon Facebook Page
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
        <p>&copy; 2025 Upper Ichon Management System. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
