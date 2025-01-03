import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function getCurrentPeriod() {
  return new Date().getHours() >= 12 ? "PM" : "AM";
}

const ModifyOB = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0], // Set the formatted date (DD-MM-YYYY)
    time: getCurrentTime(), // Get current time
    amPm: getCurrentPeriod(), // Get current AM/PM
    bank: "", // Selected bank
    reasonForModification: "", // Reason for modification
    previousOB: "", // Previous open balance (fetched from backend)
    modifiedOB: "", // Modified OB
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch the last modified balances for both banks when the bank is selected
  useEffect(() => {
    const fetchLastModifiedBalances = async () => {
      if (formData.bank) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/modifyOb/lastModifiedBalancesForBothBanks`,
            {
              withCredentials: true, // Include cookies if authentication is required
            }
          );
          const bankBalance =
            formData.bank === "Bank 1"
              ? response.data.bank1ModifiedOB
              : response.data.bank2ModifiedOB;
          setFormData((prevData) => ({
            ...prevData,
            previousOB: bankBalance,
          }));
        } catch (err) {
          setError(
            err.response?.data?.message ||
              "Failed to fetch last modified balances."
          );
          setSuccess("");
        }
      }
    };

    fetchLastModifiedBalances();
  }, [formData.bank]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation to check if all required fields are filled
    if (!formData.bank || !formData.modifiedOB || !formData.reasonForModification) {
      setError("Bank, Modified OB, and Reason for modification are required.");
      setSuccess("");
      return;
    }

    // Validate if `modifiedOB` is a valid number
    if (isNaN(formData.modifiedOB)) {
      setError("Modified OB must be a valid number.");
      setSuccess("");
      return;
    }

    try {
      // Prepare the payload
      const payload = {
        date: formData.date,
        time: `${formData.time} ${formData.amPm}`, // Combine time and AM/PM
        bank: formData.bank,
        reason: formData.reasonForModification,
        previousOB: parseFloat(formData.modifiedOB), // Convert to number
        modifiedOB: parseFloat(formData.modifiedOB), // Convert to number
      };

      // Send POST request to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/modifyOb`, // Replace with your backend endpoint
        payload,
        {
          withCredentials: true, // Include cookies if authentication is required
        }
      );

      // Handle success
      setSuccess("Open balance modified successfully!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to modify balance.");
      setSuccess("");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      <div className="flex items-center mb-6 space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg"
        >
          <FiArrowLeft className="mr-2 text-xl" />
          Back
        </button>
        <h1 className="text-3xl font-semibold capitalize text-gray-800">
          Modify Open Balance
        </h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Date Input */}
          <div className="flex justify-between gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Time and AM/PM Inputs */}
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Time</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="HH:MM"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  AM/PM
                </label>
                <select
                  name="amPm"
                  value={formData.amPm}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bank Selection */}
          <div>
            <select
              name="bank"
              value={formData.bank}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Bank</option>
              <option value="Bank 1">Bank 1</option>
              <option value="Bank 2">Bank 2</option>
            </select>
          </div>

          {/* Reason for Modification */}
          <input
            type="text"
            name="reasonForModification"
            value={formData.reasonForModification}
            onChange={handleChange}
            placeholder="Reason for modification"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Previous Open Balance (Read-only) */}
          <input
            type="text"
            name="previousOB"
            value={formData.previousOB}
            onChange={handleChange}
            placeholder="Previous Open Balance"
            readOnly
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Modified Open Balance */}
          <input
            type="text"
            name="modifiedOB"
            value={formData.modifiedOB}
            onChange={handleChange}
            placeholder="Modified Open Balance"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Modify Balance
          </button>
        </form>

        {/* Success or Error Message */}
        {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ModifyOB;
