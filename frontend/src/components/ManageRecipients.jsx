import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ManageRecipients = () => {
  const [recipients, setRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipients`, {
        withCredentials: true, // For cookies
      });
      setRecipients(response.data);
    } catch (error) {
      console.error("Error fetching recipients:", error);
    }
  };

  const addRecipient = async () => {
    try {
      if (!newEmail) return alert("Email is required.");
      await axios.post(
        `${API_BASE_URL}/api/recipients/add`,
        { email: newEmail },
        { withCredentials: true }
      );
      setNewEmail("");
      fetchRecipients();
      toast.success("Add Email Successfully!");
    } catch (error) {
      console.error("Error adding recipient:", error);
    }
  };

  const deleteRecipient = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/recipients/delete/${id}`,
        { withCredentials: true }
      );
      fetchRecipients();
      toast.error("Delete Email Successfully!");
    } catch (error) {
      console.error("Error deleting recipient:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-8 mt-20">
      <h2 className="text-4xl font-bold mb-6 text-gray-800">Manage Recipients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Recipient Email"
          className="border p-2 rounded-md"
        />
        <button
          onClick={addRecipient}
          className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Email</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((recipient) => (
            <tr key={recipient._id}>
              <td className="border p-2">{recipient.email}</td>
              <td className="flex justify-center items-center border p-3">
                <FaTrash
                  onClick={() => deleteRecipient(recipient._id)}
                  className="text-red-500  cursor-pointer hover:text-red-600 transition-transform transform hover:scale-110" 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageRecipients;
