import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageRecipients = () => {
  const [recipients, setRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/recipients`, {
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
        `${import.meta.env.VITE_API_BASE_URL}/api/recipients/add`,
        { email: newEmail },
        { withCredentials: true }
      );
      setNewEmail("");
      fetchRecipients();
    } catch (error) {
      console.error("Error adding recipient:", error);
    }
  };

  const deleteRecipient = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/recipients/delete/${id}`,
        { withCredentials: true }
      );
      fetchRecipients();
    } catch (error) {
      console.error("Error deleting recipient:", error);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-5">Manage Recipients</h2>
      <div className="mb-5">
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
              <td className="border p-2">
                <button
                  onClick={() => deleteRecipient(recipient._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageRecipients;
