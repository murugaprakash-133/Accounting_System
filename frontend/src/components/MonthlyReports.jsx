'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const MonthlyReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch transactions data using Axios
  useEffect(() => {
    fetchTransactions();
  }, [currentDate]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions', {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
        },
        withCredentials: true, // Ensure cookies are sent with the request
      });
      const { transactions, totalIncome, totalExpenses } = response.data;
      setTransactions(transactions);
      setTotalIncome(totalIncome);
      setTotalExpenses(totalExpenses);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const changeMonth = (change) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + change);
      return newDate;
    });
  };

  const handleMonthChange = (value) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(parseInt(value));
      return newDate;
    });
  };

    const downloadExcel = () => {
      // Prepare formatted data for Excel
      const formattedTransactions = transactions.map((transaction, index) => ({
        ID: transaction._id || index + 1, // Provide a unique ID
        User_Id: transaction.userId || "N/A", // Include user ID if available
        Date: new Date(transaction.date).toLocaleDateString(),
        Time: `${transaction.time} ${transaction.amPm}`,
        Description: transaction.description || "N/A",
        "Voucher Type": transaction.voucherType || "N/A",
        "Voucher No": transaction.voucherNo || "N/A",
        "Debit(₹)": transaction.type === "expense" ? transaction.amount.toFixed(2) : "",
        "Credit(₹)": transaction.type === "income" ? transaction.amount.toFixed(2) : "",
        "Balance(₹)": (totalIncome - totalExpenses).toFixed(2),
      }));
    
      // Create Excel sheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(formattedTransactions);
      const workbook = XLSX.utils.book_new();
    
      // Append sheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    
      // Create filename with current date
      const currentDate = new Date();
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const filename = `transactions_${currentDate.getFullYear()}_${months[currentDate.getMonth()]}.xlsx`;
    
      // Download Excel file
      XLSX.writeFile(workbook, filename);
    };
  

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Monthly Report</h2>
          <p className="text-gray-700">Overview of your transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={currentDate.getMonth().toString()}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="border px-4 py-2 rounded-md"
          >
            {months.map((month, index) => (
              <option key={index} value={index.toString()}>{month}</option>
            ))}
          </select>
          <button
            onClick={downloadExcel}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600">
          ₹{(totalIncome - totalExpenses).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white p-6 rounded-md shadow-md">
        <h3 className="font-semibold text-xl mb-4">Detailed Breakdown</h3>
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
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction._id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-200`}
                >
                  <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                    {new Date(transaction.date).toLocaleDateString()}
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
                    {transaction.type === 'expense'
                      ? `₹${transaction.amount.toFixed(2)}`
                      : " "}
                  </td>
                  <td className="py-4 px-6 border-b border-gray-300 text-right font-semibold text-green-600">
                    {transaction.type === 'income'
                      ? `₹${transaction.amount.toFixed(2)}`
                      : " "}
                  </td>
                  <td className="py-4 px-6 border-b border-gray-300 text-right text-gray-800">
                    ₹{(totalIncome - totalExpenses).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
