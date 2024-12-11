import React, { useState } from "react";

const IncomeExpense = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    amount: "",
    date: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Add or update a transaction
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction, index) =>
          index === currentId ? formData : transaction
        )
      );
      setIsEditing(false);
    } else {
      setTransactions((prevTransactions) => [...prevTransactions, formData]);
    }
    setFormData({ type: "", category: "", amount: "", date: "", description: "" });
  };

  // Edit transaction
  const handleEdit = (index) => {
    setFormData(transactions[index]);
    setIsEditing(true);
    setCurrentId(index);
  };

  // Delete transaction
  const handleDelete = (index) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="p-6 bg-gray-100 mt-20 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Income & Expense Tracker</h2>
      <form
        className="space-y-4 bg-white p-6 rounded shadow-md"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full bg-white"
            required
          >
            <option value="" disabled>
              Select Type
            </option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <input
            type="text"
            name="category"
            value={formData.category}
            placeholder="Category"
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="amount"
            value={formData.amount}
            placeholder="Amount"
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <input
          type="text"
          name="description"
          value={formData.description}
          placeholder="Description"
          onChange={handleChange}
          className="border border-gray-300 rounded p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {isEditing ? "Update Transaction" : "Add Transaction"}
        </button>
      </form>

      {/* Transactions Table */}
      <table className="table-auto w-full mt-8 border border-gray-300 bg-white rounded shadow-md">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="border p-2">Type</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="border p-2">{transaction.type}</td>
                <td className="border p-2">{transaction.category}</td>
                <td className="border p-2">${transaction.amount}</td>
                <td className="border p-2">{transaction.date}</td>
                <td className="border p-2">{transaction.description}</td>
                <td className="border p-2 space-x-2">
                  <button
                    className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default IncomeExpense;
