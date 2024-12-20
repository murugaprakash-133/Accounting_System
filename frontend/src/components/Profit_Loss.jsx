'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Profit_Loss = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i); // Generate a range of years

  // Fetch transactions data dynamically based on selected month and year
  useEffect(() => {
    fetchProfitLossData();
  }, [selectedMonth, selectedYear]);

  const fetchProfitLossData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions', {
        params: {
          month: selectedMonth + 1, // API expects month in 1-based index
          year: selectedYear,
        },
        withCredentials: true,
      });

      const { transactions, totalIncome, totalExpenses } = response.data;

      setTransactions(transactions);
      setTotalIncome(totalIncome);
      setTotalExpenses(totalExpenses);

      // Prepare data for chart
      const dailyData = Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => ({
        day: `Day ${i + 1}`,
        income: 0,
        expenses: 0,
      }));

      transactions.forEach((transaction) => {
        const day = new Date(transaction.date).getDate();
        if (transaction.type === 'income') {
          dailyData[day - 1].income += transaction.amount;
        } else if (transaction.type === 'expense') {
          dailyData[day - 1].expenses += transaction.amount;
        }
      });

      setMonthlyData(dailyData.map((item) => ({
        ...item,
        netProfit: item.income - item.expenses,
      })));
    } catch (error) {
      console.error('Error fetching profit/loss data:', error);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Profit & Loss</h2>
          <p className="text-gray-700">Overview of your income and expenses</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Month Selector */}
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

          {/* Year Selector */}
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-md shadow-md">
          <h3 className="font-semibold text-xl">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${(totalIncome - totalExpenses).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-md shadow-md">
        <h3 className="font-semibold text-xl mb-4">Daily Breakdown</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#3b82f6" name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#10b981" name="Expenses" />
            <Line type="monotone" dataKey="netProfit" stroke="#8b5cf6" name="Net Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Profit_Loss;
