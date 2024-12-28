"use client";

import { useState, useEffect } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";

export default function Transactions() {
  // const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("income");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: getCurrentTime(),
    amPm: getCurrentPeriod(),
    amount: "",
    voucherType: "",
    voucherNo: "",
    category: "",
    account: "",
    description: "",
    to: "",
    from: "",
    transactionType: "",
  });

  const [userId, setUserId] = useState(null); // Store the user ID here

  // Fetch user details to get userId
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          withCredentials: true,
        });
        setUserId(response.data._id); // Store userId from the backend response
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  const [voucherTypes, setVoucherTypes] = useState(["DD", "Check", "Challan"]);
  const [categories, setCategories] = useState([
    "Food",
    "Education",
    "Household",
    "Transport",
  ]);
  const [accounts, setAccounts] = useState(["Bank 1", "Bank 2"]);
  const [transferOptions, setTransferOptions] = useState(["Bank 1", "Bank 2"]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!formData.amount) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!formData.time) {
      formData.time = getCurrentTime();
      formData.amPm = getCurrentPeriod();
    }

    if (!userId) {
      alert("User not authenticated.");
      return;
    }

    let transactionData = {
      userId: userId,
      type: activeTab,
      date: formData.date,
      time: formData.time,
      amPm: formData.amPm,
      amount: formData.amount,
      description: formData.description,
    };

    if (activeTab === "income" || activeTab === "expense") {
      if (!formData.category || !formData.account || !formData.voucherType) {
        alert("Please fill in all required fields.");
        return;
      }
      transactionData = {
        ...transactionData,
        category: formData.category,
        account: formData.account,
        voucherType: formData.voucherType,
        voucherNo: formData.voucherNo,
      };
    } else if (activeTab === "transfer") {
      if (!formData.to || !formData.from || !formData.transactionType) {
        alert("Please select 'Transaction Type', 'To', and 'From' accounts.");
        return;
      }
      transactionData = {
        ...transactionData,
        to: formData.to,
        from: formData.from,
        transactionType: formData.transactionType,
      };
    }

    try {
      if (activeTab === "income" || activeTab === "expense") {
        await axios.post(
          "http://localhost:5000/api/transactions",
          transactionData,
          {
            withCredentials: true,
          }
        );
        console.log("Transaction saved:", transactionData);
        alert("Transaction successfully saved!");

        if (formData.account === "Bank 1" || formData.account === "Bank 2") {
          const transferEndpoint =
            formData.account === "Bank 1"
              ? "/api/transfers"
              : "/api/transferBanks";
          const transferData = {
            ...transactionData,
            transactionType: activeTab,
            type: "transfer",
            to: "ToEmpty",
            from: "FromEmpty",
          };

          await axios.post(
            `http://localhost:5000${transferEndpoint}`,
            transferData,
            {
              withCredentials: true,
            }
          );
        }
      } else if (activeTab === "transfer") {
        const transferEndpoint =
          formData.from === "Bank 1"
            ? "/api/transfers"
            : formData.from === "Bank 2"
            ? "/api/transferBanks"
            : null;

        if (transferEndpoint) {
          await axios.post(
            `http://localhost:5000${transferEndpoint}`,
            transactionData,
            {
              withCredentials: true,
            }
          );

          if (formData.transactionType === "External") {
            const transactionFormatData = {
              ...transactionData,
              category: formData.category || "",
              account: formData.account || "",
              voucherType: formData.voucherType || "",
              voucherNo: formData.voucherNo || "",
            };
            console.log(transactionFormatData);
            await axios.post(
              "http://localhost:5000/api/transactions",
              transactionFormatData,
              {
                withCredentials: true,
              }
            );
          } else if(formData.transactionType === "Internal") {
            await axios.post(
              `http://localhost:5000${transferEndpoint === "/api/transfers" ? "/api/transferBanks" : "/api/transfers"}`,
              transactionData,
              {
                withCredentials: true,
              }
            );
          }
        }
      }
      alert("Transaction successfully saved!");
      resetForm();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Error saving transaction. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      time: "",
      amPm: "",
      amount: "",
      voucherType: "",
      voucherNo: "",
      category: "",
      account: "",
      description: "",
      to: "",
      from: "",
      transactionType: "",
    });
  };

  const handleAddCategory = () => {
    const newCategory = prompt("Enter new category:");
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prevCategories) => [...prevCategories, newCategory]);
    }
  };

  const handleAddVoucherType = () => {
    const newVoucherType = prompt("Enter new category:");
    if (newVoucherType && !voucherTypes.includes(newVoucherType)) {
      setVoucherTypes((prevVoucherTypes) => [
        ...prevVoucherTypes,
        newVoucherType,
      ]);
    }
  };
  const filteredOptions = (field) => {
    if (formData.transactionType === "Internal") {
      if (field === "from") {
        // "From" can include all banks
        return transferOptions;
      }
      if (field === "to") {
        // "To" should exclude the selected "From"
        return transferOptions.filter((option) => option !== formData.from);
      }
    }

    if (formData.transactionType === "External") {
      if (field === "from") {
        // "From" can include all banks
        return transferOptions;
      }
      // For "External", exclude "Bank 1" and "Bank 2" from both "From" and "To"
      return transferOptions.filter(
        (option) => !["Bank 1", "Bank 2"].includes(option)
      );
    }

    // Default to all options if no transactionType is selected
    return transferOptions;
  };

  const handleAddAccount = () => {
    const newAccount = prompt("Enter new account:");
    if (newAccount && !accounts.includes(newAccount)) {
      setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
    }
  };

  const handleAddTransferOption = (field) => {
    const newOption = prompt(`Enter new ${field}:`);
    if (newOption && !transferOptions.includes(newOption)) {
      setTransferOptions((prevOptions) => [...prevOptions, newOption]);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold capitalize text-gray-800">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Transactions
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {["income", "expense", "transfer"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg shadow transition-all ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(activeTab === "income" ||
              activeTab === "expense" ||
              activeTab === "transfer") && (
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">
                    Time
                  </label>
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
                    <option value="">Am|Pm</option>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {activeTab === "transfer" ? (
            <>
              <div>
                <select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Transaction Type</option>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </select>
              </div>
              <div>
                <select
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">From</option>
                  {filteredOptions("from").map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleAddTransferOption("from")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                  >
                    Add From
                  </button>
                </div>
              </div>
              <div>
                <select
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">To</option>
                  {filteredOptions("to").map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleAddTransferOption("to")}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                  >
                    Add To
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <select
                  name="voucherType"
                  value={formData.voucherType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Voucher Type</option>
                  {voucherTypes.map((voucherType) => (
                    <option key={voucherType} value={voucherType}>
                      {voucherType}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleAddVoucherType}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                  >
                    Add Category
                  </button>
                </div>
              </div>
              <input
                type="text"
                name="voucherNo"
                value={formData.voucherNo}
                onChange={handleChange}
                placeholder="Voucher No"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                  >
                    Add Category
                  </button>
                </div>
              </div>
              {activeTab === "income" ? (
                <div>
                  <select
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Towards</option>
                    {accounts.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleAddAccount}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                    >
                      Add Towards
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <select
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Spends From</option>
                    {accounts.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleAddAccount}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2"
                    >
                      Add Spend From
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
