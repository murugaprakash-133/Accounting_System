"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { FaTrash } from "react-icons/fa";

const MonthlyReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [transferBanks, setTransferBanks] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const handleDelete = async (id, type, account, transactionType) => {
    console.log(id, type, account, transactionType);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${type} for ${account}? This action cannot be undone.`
    );
    if (!confirmDelete) return;
  
    try {
      let response;
  
      // Delete from transactions
      if (type === "income" || type === "expense") {
        response = await axios.delete(`/api/transactions/${id}`, {
          withCredentials: true,
        });
  
        if (response.status === 200) {
          setTransactions((prev) => prev.filter((item) => item._id !== id));
          console.log("Deleted from transactions");
        }
      }
  
      // Delete from transfers or transferBanks based on account
      if (type === "transfer") {
        if (transactionType === "External") {
          // External transfers: Delete only the related schema (no relation)
          if (account === "Bank 1") {
            response = await axios.delete(`/api/transfers/${id}`, {
              withCredentials: true,
            });
  
            if (response.status === 200) {
              setTransfers((prev) => prev.filter((item) => item._id !== id));
              console.log("Deleted external transfer (Bank 1)");
            }
          } else if (account === "Bank 2") {
            response = await axios.delete(`/api/transferBanks/${id}`, {
              withCredentials: true,
            });
  
            if (response.status === 200) {
              setTransferBanks((prev) => prev.filter((item) => item._id !== id));
              console.log("Deleted external transferBank (Bank 2)");
            }
          }
        } else if (transactionType === "Internal") {
          // Internal transfers: Delete both Transfer and TransferBank records
          if (account === "Bank 1") {
            // Delete from Bank 1 (Transfer)
            response = await axios.delete(`/api/transfers/${id}`, {
              withCredentials: true,
            });
  
            if (response.status === 200) {
              setTransfers((prev) => prev.filter((item) => item._id !== id));
              console.log("Deleted internal transfer (Bank 1)");
            }
  
            // Delete corresponding record in Bank 2 (TransferBank)
            response = await axios.delete(`/api/transferBanks/${id}`, {
              withCredentials: true,
            });
  
            if (response.status === 200) {
              setTransferBanks((prev) => prev.filter((item) => item._id !== linkedTransferBankId));
              console.log("Deleted internal transferBank (Bank 2)");
            }
          } else if (account === "Bank 2") {
            // Delete from Bank 2 (TransferBank)
            response = await axios.delete(`/api/transferBanks/${id}`, {
              withCredentials: true,
            });
  
            if (response.status === 200) {
              setTransferBanks((prev) => prev.filter((item) => item._id !== id));
              console.log("Deleted internal transferBank (Bank 2)");
            }
  
            // Delete corresponding record in Bank 1 (Transfer)
            response = await axios.delete(`/api/transfers/${id}`, {
              withCredentials: true,
            });
  
            if (response.status === 200) {
              setTransfers((prev) => prev.filter((item) => item._id !== linkedTransferId));
              console.log("Deleted internal transfer (Bank 1)");
            }
          }
        }
      } 
  
      // Fetch updated data after deletion
      await Promise.all([fetchTransactions(), fetchTransfers(), fetchTransferBanks()]);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} for ${account} deleted successfully.`);
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      alert(`Failed to delete ${type} for ${account}. Please try again.`);
    }
  };
  

  const years = Array.from(
    { length: 50 },
    (_, i) => new Date().getFullYear() - 25 + i
  ); // Generate a range of years

  // Fetch transactions data using Axios
  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTransfers();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTransferBanks();
  }, [selectedMonth, selectedYear]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/transactions",
        {
          params: {
            month: selectedMonth + 1,
            year: selectedYear,
          },
          withCredentials: true, // Ensure cookies are sent with the request
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
      const response = await axios.get("http://localhost:5000/api/transfers", {
        params: {
          month: selectedMonth + 1,
          year: selectedYear,
        },
        withCredentials: true, // Ensure cookies are sent with the request
      });
      const { transfers, totalIncome, totalExpenses } = response.data;
      setTransfers(transfers);
      // setTotalIncome(totalIncome);
      // setTotalExpenses(totalExpenses);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchTransferBanks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/transferBanks",
        {
          params: {
            month: selectedMonth + 1,
            year: selectedYear,
          },
          withCredentials: true, // Ensure cookies are sent with the request
        }
      );
      const { transferBanks, totalIncome, totalExpenses } = response.data;
      setTransferBanks(transferBanks);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const downloadExcel = () => {
    // Filter transactions based on selected month and year
    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === selectedMonth &&
        transactionDate.getFullYear() === selectedYear
      );
    });

    // Filter transfers based on selected month and year
    const filteredTransfers = transfers.filter((transfer) => {
      const transferDate = new Date(transfer.date);
      return (
        transferDate.getMonth() === selectedMonth &&
        transferDate.getFullYear() === selectedYear
      );
    });

    // Filter transferBanks based on selected month and year
    const filteredTransferBanks = transferBanks.filter((transferBank) => {
      const transferBankDate = new Date(transferBank.date);
      return (
        transferBankDate.getMonth() === selectedMonth &&
        transferBankDate.getFullYear() === selectedYear
      );
    });

    // Format data for each sheet
    const formattedTransactions = filteredTransactions.map(
      (transaction, index) => ({
        ID: transaction._id || index + 1,
        User_Id: transaction.userId || "N/A",
        Date: new Date(transaction.date).toLocaleDateString(),
        Time: `${transaction.time} ${transaction.amPm}`,
        Description: transaction.description || "N/A",
        "Voucher Type": transaction.voucherType || "N/A",
        "Voucher No": transaction.voucherNo || "N/A",
        "Debit(₹)":
          transaction.type === "expense" ? transaction.amount.toFixed(2) : "",
        "Credit(₹)":
          transaction.type === "income" ? transaction.amount.toFixed(2) : "",
        "Balance(₹)": transaction.balance.toFixed(2),
      })
    );

    const formattedTransfers = filteredTransfers.map((transfer, index) => ({
      ID: transfer._id || index + 1,
      Date: new Date(transfer.date).toLocaleDateString(),
      Time: `${transfer.time} ${transfer.amPm}`,
      Description: transfer.description || "N/A",
      "Transaction Type": transfer.transactionType || "N/A",
      To: transfer.to || "N/A",
      "Bank Name": transfer.bankName || "N/A",
      "Debit(₹)":
        transfer.transactionType === "Internal" ||
        transfer.transactionType === "expense"
          ? transfer.amount.toFixed(2)
          : "",
      "Credit(₹)":
        transfer.type === "External" || transfer.transactionType === "income"
          ? transfer.amount.toFixed(2)
          : "",
      "Balance(₹)": transfer.balance.toFixed(2),
    }));

    const formattedTransferBanks = filteredTransferBanks.map(
      (transferBank, index) => ({
        ID: transferBank._id || index + 1,
        Date: new Date(transferBank.date).toLocaleDateString(),
        Time: `${transferBank.time} ${transferBank.amPm}`,
        Description: transferBank.description || "N/A",
        "Transaction Type": transferBank.transactionType || "N/A",
        To: transferBank.to || "N/A",
        "Bank Name": transferBank.bankName || "N/A",
        "Debit(₹)":
          transferBank.transactionType === "Internal" ||
          transferBank.transactionType === "expense"
            ? transferBank.amount.toFixed(2)
            : "",
        "Credit(₹)":
          transferBank.type === "External" ||
          transferBank.transactionType === "income"
            ? transferBank.amount.toFixed(2)
            : "",
        "Balance(₹)": transferBank.balance.toFixed(2),
      })
    );

    // Create workbook and add sheets
    const workbook = XLSX.utils.book_new();

    const transactionSheet = XLSX.utils.json_to_sheet(formattedTransactions);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, "Transactions");

    const transferSheet = XLSX.utils.json_to_sheet(formattedTransfers);
    XLSX.utils.book_append_sheet(workbook, transferSheet, "Transfers");

    const transferBankSheet = XLSX.utils.json_to_sheet(formattedTransferBanks);
    XLSX.utils.book_append_sheet(workbook, transferBankSheet, "TransferBanks");

    // Create filename with current date
    const filename = `financial_data_${selectedYear}_${months[selectedMonth]}.xlsx`;

    // Download Excel file
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
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">
            Monthly Report
          </h2>
          <p className="text-gray-700">Overview of your transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Dynamic Month Selector */}
          <div>
            <label htmlFor="month-selector" className="sr-only">
              Select Month
            </label>
            <select
              id="month-selector"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border px-4 py-2 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Year Selector */}
          <div>
            <label htmlFor="year-selector" className="sr-only">
              Select Year
            </label>
            <select
              id="year-selector"
              value={selectedYear}
              onChange={handleYearChange}
              className="border px-4 py-2 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadExcel}
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600 transition"
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md shadow-md transition hover:shadow-lg">
          <h3 className="font-semibold text-xl">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md transition hover:shadow-lg">
          <h3 className="font-semibold text-xl">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md transition hover:shadow-lg">
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
