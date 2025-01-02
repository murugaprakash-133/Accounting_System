'use client';

import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import 'chart.js/auto';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DetailedReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedReport, setSelectedReport] = useState('Income by Category');
  const [dataMap, setDataMap] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i); // Generate a range of years

  useEffect(() => {
    fetchMonthlyReportData();
  }, [selectedMonth, selectedYear]); // Re-fetch data when month or year changes

  const fetchMonthlyReportData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions`, {
        params: { month: selectedMonth + 1, year: selectedYear },
        withCredentials: true,
      });

      const { transactions } = response.data;

      const incomeByCategory = {};
      const expensesByCategory = {};

      // Aggregate data dynamically
      transactions.forEach((transaction) => {
        const { type, category, amount } = transaction;

        if (type === 'income') {
          incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
        } else if (type === 'expense') {
          expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
        }
      });

      // Map data into the required format
      setDataMap({
        'Income by Category': {
          labels: Object.keys(incomeByCategory),
          datasets: [
            {
              data: Object.values(incomeByCategory),
              backgroundColor: ['#FF5722', '#4CAF50', '#2196F3', '#FFC107'],
            },
          ],
        },
        'Expenses by Category': {
          labels: Object.keys(expensesByCategory),
          datasets: [
            {
              data: Object.values(expensesByCategory),
              backgroundColor: ['#FF5722', '#4CAF50', '#2196F3', '#FFC107'],
            },
          ],
        },
        'Profit by Product': {
          labels: ['Placeholder A', 'Placeholder B', 'Placeholder C'],
          datasets: [
            {
              data: [300, 200, 100], // Placeholder data
              backgroundColor: ['#FF5722', '#4CAF50', '#2196F3', '#FFC107'],
            },
          ],
        },
      });
    } catch (error) {
      console.error('Error fetching monthly report data:', error);
    }
  };

  const handleReportChange = (event) => {
    setSelectedReport(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Detailed Reports</h2>

      {/* Selectors for Month and Year */}
      <div className="flex justify-center space-x-4 mb-6">
        <select
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

        <select
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

      {/* Report Selector */}
      <select
        value={selectedReport}
        onChange={handleReportChange}
        className="block mx-auto mb-6 w-full max-w-sm px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option>Income by Category</option>
        <option>Expenses by Category</option>
        <option>Profit by Product</option>
      </select>

      {/* Pie Chart */}
      {dataMap[selectedReport] && (
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <Pie
              data={dataMap[selectedReport]}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#4a5568',
                    },
                  },
                },
                animation: {
                  animateScale: true,
                  animateRotate: true,
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full mt-8 text-sm border-collapse rounded-lg">
        <thead className="bg-gray-200 text-gray-600">
          <tr>
            <th className="border-b px-8 py-4 text-left">Category</th>
            <th className="border-b px-4 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {dataMap[selectedReport]?.labels.map((label, index) => (
            <tr key={label} className="even:bg-gray-50">
              <td className="px-8 py-4 border-b text-gray-700">{label}</td>
              <td className="px-8 py-4 border-b text-right text-gray-700">
                {formatCurrency(dataMap[selectedReport].datasets[0].data[index])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailedReports;
