"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MonthlyReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [transferBanks, setTransferBanks] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 50 },
    (_, i) => new Date().getFullYear() - 25 + i
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchTransfers(), fetchTransferBanks()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/transactions`,
        {
          params: {
            month: selectedMonth + 1,
            year: selectedYear,
          },
          withCredentials: true,
        }
      );
      const { transactions, totalIncome, totalExpenses } = response.data;
      setTransactions(transactions);
      setTotalIncome(totalIncome);
      setTotalExpenses(totalExpenses);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transfers`, {
        params: {
          month: selectedMonth + 1,
          year: selectedYear,
        },
        withCredentials: true,
      });
      setTransfers(response.data.transfers);
    } catch (error) {
      console.error("Error fetching transfers:", error);
    }
  };

  const fetchTransferBanks = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/transferBanks`,
        {
          params: {
            month: selectedMonth + 1,
            year: selectedYear,
          },
          withCredentials: true,
        }
      );
      setTransferBanks(response.data.transferBanks);
    } catch (error) {
      console.error("Error fetching transferBanks:", error);
    }
  };

  const deleteEntry = async (url, id, setter) => {
    const response = await axios.delete(url, { withCredentials: true });
    if (response.status === 200) {
        setter((prev) => prev.filter((item) => item._id !== id));
        console.log(`Deleted successfully from ${url}`);
    }
};

const handleDelete = async (id, type, account, transactionType) => {
  const confirmDelete = await Swal.fire({
    title: "Are you sure?",
    text: `Are you sure you want to delete this ${type}? This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!"
  }).then(result => result.isConfirmed);

  if (!confirmDelete) return;

  try {
    // Handle different types for deletion
    if (type === "income" || type === "expense") {
      await deleteEntry(`/api/transactions/${id}`, id, setTransactions);
    } else if (type === "transfer") {
      if (transactionType === "External") {
        const url = account === "Bank 1" ? `/api/transfers/${id}` : `/api/transferBanks/${id}`;
        const setter = account === "Bank 1" ? setTransfers : setTransferBanks;

        await deleteEntry(url, id, setter);
        await deleteEntry(`/api/transactions/${id}`, id, setTransactions);
      } else if (transactionType === "Internal") {
        if (account === "Bank 1") {
          await deleteEntry(`/api/transfers/${id}`, id, setTransfers);
          const linkedId = id.replace("Bank1", "Bank2");
          await deleteEntry(`/api/transferBanks/${linkedId}`, linkedId, setTransferBanks);
        } else if (account === "Bank 2") {
          await deleteEntry(`/api/transferBanks/${id}`, id, setTransferBanks);
          const linkedId = id.replace("Bank2", "Bank1");
          await deleteEntry(`/api/transfers/${linkedId}`, linkedId, setTransfers);
        }
      }
    }

    // Fetch updated data
    await fetchData();
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    toast.error(`Failed to delete ${type}. Please try again.`);
  }
};


  const downloadExcel = () => {
    const formatData = (data, type) => {
      return data.map((item, index) => ({
        ID: item._id || index + 1,
        Date: new Date(item.date).toLocaleDateString(),
        Time: `${item.time} ${item.amPm}`,
        Description: item.description || "N/A",
        "Transaction Type": item.transactionType || "N/A",
        "Debit(₹)": item.type === "expense" ? item.amount.toFixed(2) : "",
        "Credit(₹)": item.type === "income" ? item.amount.toFixed(2) : "",
        "Balance(₹)": item.balance.toFixed(2),
      }));
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(formatData(transactions, "Transactions")),
      "Transactions"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(formatData(transfers, "Transfers")),
      "Transfers"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(formatData(transferBanks, "TransferBanks")),
      "TransferBanks"
    );

    const filename = `financial_data_${selectedYear}_${months[selectedMonth]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      {loading && <p>Loading...</p>}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Monthly Report</h2>
          <p className="text-gray-700">Overview of your transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border px-4 py-2 rounded-md"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border px-4 py-2 rounded-md"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            onClick={downloadExcel}
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600"
          >
            Download Excel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white p-6 rounded-md shadow-md">
        <h3 className="font-semibold text-xl mb-4">Income & Expense</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Date
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Time
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Description
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Voucher Type
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Voucher No
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Debit ₹
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Credit ₹
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Balance
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => {
                const date = new Date(transaction.date);
                const formattedDate = `${date
                  .getDate()
                  .toString()
                  .padStart(2, "0")}-${(date.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}-${date.getFullYear()}`;

                return (
                  <tr
                    key={transaction._id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200`}
                  >
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {formattedDate}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {transaction.time} {transaction.amPm}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {transaction.description}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {transaction.voucherType}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {transaction.voucherNo}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-red-600">
                      {transaction.type === "expense" ||
                      transaction.type === "transfer"
                        ? `₹${transaction.amount.toFixed(2)}`
                        : " "}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-green-600">
                      {transaction.type === "income"
                        ? `₹${transaction.amount.toFixed(2)}`
                        : " "}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right text-gray-800">
                      ₹{transaction.balance.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300">
                      <FaTrash
                        onClick={() => 
                          handleDelete(transaction.transactionId, transaction.type, transaction.account) }
                        className="text-red-500 cursor-pointer hover:text-red-600 transition-transform transform hover:scale-110"
                        size={20} // You can adjust the size as needed
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ToastContainer/>
        </div>
      </div>
      <div className="bg-white p-6 rounded-md pt-4 mt-2 shadow-md">
        <h3 className="font-semibold text-xl mb-4">Transfer Bank 1</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Date
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Time
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Description
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Transaction Type
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Debit ₹
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Credit ₹
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Balance
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {[...transfers].map((item, index) => {
                const UserDate = new Date(item.date);
                const day = UserDate.getDate().toString().padStart(2, "0"); // Ensure two digits for the day
                const month = (UserDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0"); // getMonth() is 0-indexed, so add 1
                const year = UserDate.getFullYear();

                // Combine them in the desired format
                const formattedDate = `${day}-${month}-${year}`;
                return (
                  <tr
                    key={item._id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200`}
                  >
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {formattedDate}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {item.time} {item.amPm}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {item.description}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {item.transactionType}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-red-600">
                      {item.transactionType === "expense" ||
                      item.from === "Bank 1"
                        ? `₹${item.amount.toFixed(2)}`
                        : " "}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-green-600">
                      {item.transactionType === "income" ||
                      item.from === "Bank 2"
                        ? `₹${item.amount.toFixed(2)}`
                        : " "}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right text-gray-800">
                      ₹{item.balance.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300">
                      <FaTrash
                        onClick={() => 
                          handleDelete(item.transactionId, (item.transactionType === "income" || item.transactionType === "expense") ? item.transactionType : item.type, (item.transactionType === "External" || item.transactionType === "Internal") ? item.from : item.to, item.transactionType)}
                        className="text-red-500 cursor-pointer hover:text-red-600 transition-transform transform hover:scale-110"
                        size={20} // You can adjust the size as needed
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-6 rounded-md pt-4 mt-2 shadow-md">
        <h3 className="font-semibold text-xl mb-4">Transfer Bank 2</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Date
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Time
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Description
                </th>
                <th className="text-left py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Transaction Type
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Debit ₹
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Credit ₹
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Balance
                </th>
                <th className="text-right py-4 px-4 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {[...transferBanks].map((item, index) => {
                const UserDate = new Date(item.date);
                const day = UserDate.getDate().toString().padStart(2, "0"); // Ensure two digits for the day
                const month = (UserDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0"); // getMonth() is 0-indexed, so add 1
                const year = UserDate.getFullYear();

                // Combine them in the desired format
                const formattedDate = `${day}-${month}-${year}`;

                return (
                  <tr
                    key={item._id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-200`}
                  >
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {formattedDate}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {item.time} {item.amPm}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {item.description}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                      {item.transactionType}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-red-600">
                      {item.transactionType === "expense" ||
                      item.from === "Bank 2"
                        ? `₹${item.amount.toFixed(2)}`
                        : " "}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-green-600">
                      {item.transactionType === "income" ||
                      item.from === "Bank 1"
                        ? `₹${item.amount.toFixed(2)}`
                        : " "}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300 text-right text-gray-800">
                      ₹{item.balance.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 border-b border-gray-300">
                      <FaTrash
                        onClick={() =>
                          handleDelete(item.transactionId, (item.transactionType === "income" || item.transactionType === "expense") ? item.transactionType : item.type, (item.transactionType === "External" || item.transactionType === "Internal") ? item.from : item.to, item.transactionType)}
                        className="text-red-500 cursor-pointer hover:text-red-600 transition-transform transform hover:scale-110"
                        size={20} // You can adjust the size as needed
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
