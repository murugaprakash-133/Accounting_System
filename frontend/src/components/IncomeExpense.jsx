"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "../index.css";
// import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

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
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
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
      toast.warning("Please fill in all required fields.");
      return;
    }

    if (!formData.time) {
      formData.time = getCurrentTime();
      formData.amPm = getCurrentPeriod();
    }

    if (!userId) {
      toast.warning("User not authenticated.");
      return;
    }

    // Generate a unique transactionId
    const timestamp = Date.now().toString();
    const transactionId = `TXN-${userId}-${timestamp}`;

    let transactionData = {
      transactionId,
      userId,
      type: activeTab,
      date: formData.date,
      time: formData.time,
      amPm: formData.amPm,
      amount: formData.amount,
      description: formData.description,
    };

    try {
      // Handle income or expense
      if (activeTab === "income" || activeTab === "expense") {
        if (!formData.category || !formData.account || !formData.voucherType) {
          toast.warning("Please fill in all required fields.");
          return;
        }

        transactionData = {
          ...transactionData,
          category: formData.category,
          account: formData.account,
          voucherType: formData.voucherType,
          voucherNo: formData.voucherNo,
        };

        // Save the transaction in the Transaction schema
        await axios.post(`${API_BASE_URL}/api/transactions`, transactionData, {
          withCredentials: true,
        });

        // console.log("Transaction saved:", transactionData);

        // Save the corresponding transfer in Transfer or TransferBank schema
        if (formData.account === "Bank 1" || formData.account === "Bank 2") {
          const transferEndpoint =
            formData.account === "Bank 1"
              ? "/api/transfers"
              : "/api/transferBanks";

          const transferData = {
            ...transactionData,
            transactionType: activeTab, // Keep transaction type
            type: "transfer", // Ensure it's marked as a transfer
            to: formData.account, // Store the account as 'to' for income
            from: "External Source", // Indicate the source for income
          };

          await axios.post(`${API_BASE_URL}${transferEndpoint}`, transferData, {
            withCredentials: true,
          });

          // console.log("Linked transfer saved:", transferData);
        }
      }

      // Handle transfer
      else if (activeTab === "transfer") {
        if (!formData.to || !formData.from || !formData.transactionType) {
          toast.warning(
            "Please select 'Transaction Type', 'To', and 'From' accounts."
          );
          return;
        }

        transactionData = {
          ...transactionData,
          to: formData.to,
          from: formData.from,
          transactionType: formData.transactionType,
        };

        const transferEndpoint =
          formData.from === "Bank 1"
            ? "/api/transfers"
            : formData.from === "Bank 2"
            ? "/api/transferBanks"
            : null;

        if (transferEndpoint) {
          // Save the transfer
          await axios.post(
            `${API_BASE_URL}${transferEndpoint}`,
            transactionData,
            {
              withCredentials: true,
            }
          );

          // console.log("Transfer saved:", transactionData);

          // Handle linked Internal transfer
          if (formData.transactionType === "Internal") {
            const oppositeEndpoint =
              transferEndpoint === "/api/transfers"
                ? "/api/transferBanks"
                : "/api/transfers";

            await axios.post(
              `${API_BASE_URL}${oppositeEndpoint}`,
              transactionData,
              {
                withCredentials: true,
              }
            );

            // console.log("Linked internal transfer saved.");
          } else if (formData.transactionType === "External") {
            const externalTransactionData = {
              ...transactionData,
              type: "expense", // Mark as expense for external transfer
              category: "External Transfer",
              account: formData.from, // Account it originates from
            };

            // Save the external transfer in the Transaction schema
            await axios.post(
              `${API_BASE_URL}/api/transactions`,
              externalTransactionData,
              {
                withCredentials: true,
              }
            );

            // console.log(
            //   "External transaction saved in Transaction schema:",
            //   externalTransactionData
            // );
          }
        }
      }

      toast.success("Transaction successfully saved!");
      resetForm();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Error saving transaction. Please try again.");
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
    Swal.fire({
      title: "Add New Category",
      input: "text",
      inputPlaceholder: "Enter new Category",
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      customClass: {
      popup: "swal2-small-popup", // Add a custom class
    },
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter a value!";
        }
        if (voucherTypes.includes(value)) {
          return "This Category already exists!";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newVoucherType = result.value;
        setCategories((prevVoucherTypes) => [
          ...prevVoucherTypes,
          newVoucherType,
        ]);
        Swal.fire("Added!", `New Category "${newVoucherType}" added.`, "success");
      }
    });
  };

  const handleAddVoucherType = () => {
    Swal.fire({
      title: "Add New Voucher Type",
      input: "text",
      inputPlaceholder: "Enter new voucher type",
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      customClass: {
      popup: "swal2-small-popup", // Add a custom class
    },
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter a value!";
        }
        if (voucherTypes.includes(value)) {
          return "This voucher type already exists!";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newVoucherType = result.value;
        setVoucherTypes((prevVoucherTypes) => [
          ...prevVoucherTypes,
          newVoucherType,
        ]);
        Swal.fire("Added!", `New voucher type "${newVoucherType}" added.`, "success");
      }
    });
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
    Swal.fire({
      title: "Add New account",
      input: "text",
      inputPlaceholder: "Enter new account",
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      customClass: {
      popup: "swal2-small-popup", // Add a custom class
    },
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter a value!";
        }
        if (voucherTypes.includes(value)) {
          return "This account already exists!";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newVoucherType = result.value;
        setAccounts((prevVoucherTypes) => [
          ...prevVoucherTypes,
          newVoucherType,
        ]);
        Swal.fire("Added!", `New Account "${newVoucherType}" added.`, "success");
      }
    });
  };
  const handleAddTransferOption = (field) => {
    Swal.fire({
      title: (`Add New ${field}`),
      input: "text",
      inputPlaceholder: (`Enter new ${field};`),
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      customClass: {
      popup: "swal2-small-popup", // Add a custom class
    },
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter a value!";
        }
        if (voucherTypes.includes(value)) {
          return (`This ${field} already exists!`);
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newVoucherType = result.value;
        setTransferOptions((prevVoucherTypes) => [
          ...prevVoucherTypes,
          newVoucherType,
        ]);
        Swal.fire("Added!", `New ${field} "${newVoucherType}" added.`, "success");
      }
    });
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
                    onClick={() => handleAddTransferOption("To")}
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
                    Add Voucher type
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
          <ToastContainer />
        </form>
      </div>
    </div>
  );
}
