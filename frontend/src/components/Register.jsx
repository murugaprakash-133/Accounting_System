import React, { useState } from "react";
import { FaUserCircle, FaLock, FaEnvelope } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_BASE_URL = "http://localhost:5000";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false); // Track if OTP is sent
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle confirm password visibility
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    console.log("Form data being sent:", formData); // Log the payload

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/signup`,
        formData
      );

      if (response.data.message === "OTP sent to email") {
        toast.success("OTP sent to your email! Please check your inbox.");
        setOtpSent(true); // Set OTP step to true
      } else if (response.status === 201) {
        toast.success("Registration successful! Redirecting to login...");
        navigate("/login"); // Navigate to login page after success
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
      toast.error(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center">
      <div className="w-96 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-lg p-8 text-white">
        <form onSubmit={handleSubmit}>
          <h1 className="text-3xl text-center font-bold text-black mb-6">
            Register
          </h1>

          {error && <p className="text-center text-red-500 mb-4">{error}</p>}

          {/* Email Input */}
          <div className="relative w-full h-12 mb-6 flex items-center">
            <FaEnvelope className="absolute right-7 text-xl text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleInputChange}
              value={formData.email}
              required
              autoComplete="off"
              className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black pl-6 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Name Input */}
          <div className="relative w-full h-12 mb-6 flex items-center">
            <FaUserCircle className="absolute right-7 text-xl text-gray-500" />
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleInputChange}
              value={formData.name}
              required
              autoComplete="off"
              className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black pl-6 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Password Input */}
          <div className="relative w-full h-12 mb-6 flex items-center">
            {/* <FaLock className="absolute left-4 text-xl text-gray-500" /> */}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleInputChange}
              value={formData.password}
              required
              autoComplete="off"
              className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black pl-6 pr-6 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="relative w-full h-12 mb-6 flex items-center">
            {/* <FaLock className="absolute left-4 text-xl text-gray-500" /> */}
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleInputChange}
              value={formData.confirmPassword}
              required
              autoComplete="off"
              className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black pl-6 pr-6 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative w-full h-12 mb-6 flex items-center">
            <select
              name="role"
              onChange={handleInputChange}
              value={formData.role}
              required
              className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black pl-6 appearance-none placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Role</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            <IoMdArrowDropdown className="absolute right-7 text-xl text-gray-500" />
          </div>

          {/* OTP Input */}
          {otpSent && (
            <div className="relative w-full h-12 mb-6 flex items-center">
              <FaEnvelope className="absolute right-7 text-xl text-gray-500" />
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                onChange={handleInputChange}
                value={formData.otp}
                required
                autoComplete="off"
                className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black pl-6 pr-6 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-1/2 h-12 bg-sky-400 text-white font-bold rounded-full shadow-md hover:bg-sky-700 transition focus:outline-none focus:ring-2 focus:ring-white"
            >
              {otpSent ? "Verify & Register" : "Send OTP"}
            </button>
            <ToastContainer />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-800">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-gray-800 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
