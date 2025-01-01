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
      await Promise.all([
        fetchTransactions(),
        fetchTransfers(),
        fetchTransferBanks(),
      ]);
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
        "http://localhost:5000/api/transactions",
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
      const response = await axios.get("http://localhost:5000/api/transfers", {
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
        "http://localhost:5000/api/transferBanks",
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
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${type} for ${account}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      if (type === "income" || type === "expense") {
        await deleteEntry(`/api/transactions/${id}`, id, setTransactions);
      } else if (type === "transfer") {
        if (transactionType === "External") {
          const url =
            account === "Bank 1"
              ? `/api/transfers/${id}`
              : `/api/transferBanks/${id}`;
          const setter = account === "Bank 1" ? setTransfers : setTransferBanks;

          // Delete from transfers or transferBanks
          await deleteEntry(url, id, setter);

          // Additionally, delete the corresponding transaction
          await deleteEntry(`/api/transactions/${id}`, id, setTransactions);
        } else if (transactionType === "Internal") {
          if (account === "Bank 1") {
            await deleteEntry(`/api/transfers/${id}`, id, setTransfers);
            const linkedId = id.replace("Bank1", "Bank2");
            await deleteEntry(
              `/api/transferBanks/${linkedId}`,
              linkedId,
              setTransferBanks
            );
          } else if (account === "Bank 2") {
            await deleteEntry(`/api/transferBanks/${id}`, id, setTransferBanks);
            const linkedId = id.replace("Bank2", "Bank1");
            await deleteEntry(
              `/api/transfers/${linkedId}`,
              linkedId,
              setTransfers
            );
          }
        }
      }

      // Fetch updated data after deletion
      await fetchData();
      alert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`
      );
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  const downloadExcel = () => {
    const formatData = (data) => {
      // Sort data by date (descending) and time (descending within the same date)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time} ${a.amPm}`);
        const dateB = new Date(`${b.date} ${b.time} ${b.amPm}`);
        return dateB - dateA; // Descending order
      });

      return sortedData.map((item, index) => ({
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

    const autoFitColumns = (sheet, data) => {
      const keys = Object.keys(data[0]);
      sheet["!cols"] = keys.map((key) => {
        const maxLength = Math.max(
          ...data.map((row) => (row[key] ? row[key].toString().length : 10)),
          key.length // Include the header length
        );
        return { wch: maxLength + 2 }; // Add padding to the width
      });
    };

    const workbook = XLSX.utils.book_new();

    // Format Transactions
    const transactionsData = formatData(transactions);
    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
    autoFitColumns(transactionsSheet, transactionsData);
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");

    // Format Transfers
    const transfersData = formatData(transfers);
    const transfersSheet = XLSX.utils.json_to_sheet(transfersData);
    autoFitColumns(transfersSheet, transfersData);
    XLSX.utils.book_append_sheet(workbook, transfersSheet, "Transfers");

    // Format TransferBanks
    const transferBanksData = formatData(transferBanks);
    const transferBanksSheet = XLSX.utils.json_to_sheet(transferBanksData);
    autoFitColumns(transferBanksSheet, transferBanksData);
    XLSX.utils.book_append_sheet(workbook, transferBanksSheet, "TransferBanks");

    const filename = `financial_data_${selectedYear}_${months[selectedMonth]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const [selectedTable, setSelectedTable] = useState(null); // Tracks open table in mobile view
  const [isMobileView, setIsMobileView] = useState(false); // Tracks if the view is mobile

  // Determine screen size and update state
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768); // Set breakpoint for mobile view
    };

    handleResize(); // Check on component mount
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to toggle table visibility in mobile view
  const toggleTable = (tableName) => {
    setSelectedTable((prev) => (prev === tableName ? null : tableName)); // Open or close the clicked table
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Monthly Report
            </h2>
            <p className="text-gray-700">Overview of your transactions</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-0 sm:space-x-4 w-full sm:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border px-4 py-2 rounded-md w-full sm:w-auto"
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
              className="border px-4 py-2 rounded-md w-full sm:w-auto"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={downloadExcel}
              className="bg-green-500 text-white px-4 py-2 rounded-md shadow hover:bg-green-600 w-full sm:w-auto"
            >
              Download Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h3 className="font-semibold text-lg sm:text-xl">Total Income</h3>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-md">
            <h3 className="font-semibold text-lg sm:text-xl">Total Expenses</h3>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-md">
            <h3 className="font-semibold text-lg sm:text-xl">Net Profit</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="overflow-y-auto max-h-[500px] bg-white rounded-md shadow-md p-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl">Income & Expense</h3>
          {isMobileView && (
            <button
              onClick={() => toggleTable("IncomeExpense")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
            >
              {selectedTable === "IncomeExpense" ? "Hide Table" : "Show Table"}
            </button>
          )}
        </div>
        {(selectedTable === "IncomeExpense" || !isMobileView) && (
          <div className="overflow-x-auto max-h-96">
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
                            handleDelete(
                              transaction.transactionId,
                              transaction.type,
                              transaction.account
                            )
                          }
                          className="text-red-500 cursor-pointer hover:text-red-600 transition-transform transform hover:scale-110"
                          size={20}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer Bank 1 */}
      <div className="bg-white rounded-md shadow-md p-6 mb-6 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl">Transfer Bank 1</h3>
          {isMobileView && (
            <button
              onClick={() => toggleTable("TransferBank1")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
            >
              {selectedTable === "TransferBank1" ? "Hide Table" : "Show Table"}
            </button>
          )}
        </div>
        {(selectedTable === "TransferBank1" || !isMobileView) && (
          <div className="overflow-x-auto max-h-96">
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
                {transfers.map((transfer, index) => {
                  const date = new Date(transfer.date);
                  const formattedDate = `${date
                    .getDate()
                    .toString()
                    .padStart(2, "0")}-${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}-${date.getFullYear()}`;

                  return (
                    <tr
                      key={transfer._id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200`}
                    >
                      <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                        {formattedDate}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                        {transfer.time} {transfer.amPm}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                        {transfer.description}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                        {transfer.transactionType}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-red-600">
                        {transfer.transactionType === "expense" ||
                        transfer.from === "Bank 1"
                          ? `₹${transfer.amount.toFixed(2)}`
                          : " "}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-green-600">
                        {transfer.transactionType === "income" ||
                        transfer.from === "Bank 2"
                          ? `₹${transfer.amount.toFixed(2)}`
                          : " "}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-right text-gray-800">
                        ₹{transfer.balance.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300">
                        <FaTrash
                          onClick={() =>
                            handleDelete(
                              transfer.transactionId,
                              transfer.type,
                              transfer.account
                            )
                          }
                          className="text-red-500 cursor-pointer hover:text-red-600 transition-transform transform hover:scale-110"
                          size={20}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer Bank 2 */}
      <div className="overflow-y-auto max-h-[500px] bg-white rounded-md shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl">Transfer Bank 2</h3>
          {isMobileView && (
            <button
              onClick={() => toggleTable("TransferBank2")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
            >
              {selectedTable === "TransferBank2" ? "Hide Table" : "Show Table"}
            </button>
          )}
        </div>
        {(selectedTable === "TransferBank2" || !isMobileView) && (
          <div className="overflow-x-auto max-h-96">
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
                {transferBanks.map((transferBank, index) => {
                  const date = new Date(transferBank.date);
                  const formattedDate = `${date
                    .getDate()
                    .toString()
                    .padStart(2, "0")}-${(date.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}-${date.getFullYear()}`;

                  return (
                    <tr
                      key={transferBank._id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-200`}
                    >
                      <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                        {formattedDate}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                        {transferBank.time} {transferBank.amPm}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                        {transferBank.description}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                        {transferBank.transactionType}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-red-600">
                        {transferBank.transactionType === "expense" ||
                        transferBank.from === "Bank 2"
                          ? `₹${transferBank.amount.toFixed(2)}`
                          : " "}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-green-600">
                        {transferBank.transactionType === "income" ||
                        transferBank.from === "Bank 1"
                          ? `₹${transferBank.amount.toFixed(2)}`
                          : " "}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300 text-right text-gray-800">
                        ₹{transferBank.balance.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-300">
                        <FaTrash
                          onClick={() =>
                            handleDelete(
                              transferBank.transactionId,
                              transferBank.type,
                              transferBank.account
                            )
                          }
                          className="text-red-500 cursor-pointer hover:text-red-600 transition-transform transform hover:scale-110"
                          size={20}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;
