import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons
import logo from "../assets/logo.png";

const Sidebar = () => {
  const { isLoggedIn, userDetails } = useAuth();
  const [activeMenu, setActiveMenu] = useState("/");
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu toggle

  const Menus = [
    { title: "Dashboard", icon: "📊", path: "/" },
    { title: "Income & Expense Tracker", icon: "💸", path: "/income-expense" },
    {
      title: "Profit & Loss",
      icon: "📈",
      path: "/profit-loss",
      restricted: true,
    },
    { title: "Monthly Reports", icon: "📅", path: "/monthly-reports" },
    {
      title: "Detailed Reports",
      icon: "📄",
      path: "/detailed-reports",
      restricted: true,
    },
    {
      title: "Manage Recipients",
      icon: "✉️",
      path: "/manage-recipients",
      restricted: true,
    },
  ];

  return (
    <div className="flex h-full">
      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full bg-gradient-to-br from-gray-800 to-gray-600 w-full p-5 pt-4 md:p-5 md:pt-4 md:w-64 transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between md:justify-start mb-6">
          <img
            src={logo}
            alt="logo"
            className="cursor-pointer object-contain w-10 h-10 md:w-12 md:h-12 transition-transform duration-500 transform hover:rotate-[360deg]"
          />
          <span className="text-2xl font-bold px-3 py-2 text-gray-200 hover:text-white transition duration-300 ease-in-out w-full md:inline-block">
            Accountify
          </span>

          {/* Close Button (Mobile) */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <ul className="space-y-6 mt-10">
          {Menus.map((menu, index) => {
            if (menu.restricted && userDetails?.role !== "Admin") {
              return null;
            }
            return (
              <li key={index} className="w-full">
                <Link
                  to={menu.path}
                  onClick={() => {
                    setActiveMenu(menu.path);
                    setIsOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`flex items-center gap-x-4 px-3 py-2 text-gray-200 rounded-md hover:text-white transition duration-300 ease-in-out w-full ${
                    activeMenu === menu.path
                      ? "bg-gray-700"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <span className="text-2xl">{menu.icon}</span>
                  <span className="md:inline-block">{menu.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main Content */}
      <div className="ml-0 md:ml-64 w-full h-full bg-gray-100 transition-all duration-300 ease-in-out">
        <div className="w-full">{/* Place for content rendering */}</div>
      </div>
    </div>
  );
};

export default Sidebar;
