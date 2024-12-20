'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const MonthlyReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i); // Generate a range of years

  // Fetch transactions data using Axios
  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions', {
        params: {
          month: selectedMonth + 1,
          year: selectedYear,
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

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `transactions_${selectedYear}_${months[selectedMonth]}.xlsx`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Monthly Report</h2>
          <p className="text-gray-700">Overview of your transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Dynamic Month Selector */}
          <div>
            <label htmlFor="month-selector" className="sr-only">Select Month</label>
            <select
              id="month-selector"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border px-4 py-2 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Year Selector */}
          <div>
            <label htmlFor="year-selector" className="sr-only">Select Year</label>
            <select
              id="year-selector"
              value={selectedYear}
              onChange={handleYearChange}
              className="border px-4 py-2 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
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
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md transition hover:shadow-lg">
          <h3 className="font-semibold text-xl">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
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
        <h3 className="font-semibold text-xl mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-4 px-6 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Category
                </th>
                <th className="text-left py-4 px-6 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Account
                </th>
                <th className="text-left py-4 px-6 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Type
                </th>
                <th className="text-right py-4 px-6 border-b border-gray-300 text-gray-700 font-medium uppercase">
                  Amount
                </th>
                <th className="text-left py-4 px-6 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Date
                </th>
                <th className="text-left py-4 px-6 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction._id}
                  className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-200`}
                >
                  <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                    {transaction.category}
                  </td>
                  <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                    {transaction.account}
                  </td>
                  <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </td>
                  <td
                    className={`py-4 px-6 border-b border-gray-300 text-right font-semibold ${
                      transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                    {transaction.time} {transaction.amPm}
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
