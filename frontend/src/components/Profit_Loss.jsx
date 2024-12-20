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
        profit: item.income - item.expenses,
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-white border shadow-xl rounded-lg">
          <p className="font-bold text-lg text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-gray-600">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen mt-10 p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center space-x-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">Income, Expenses & Profit</h2>
          <p className="text-xl text-gray-600">A detailed breakdown for the current month</p>
        </div>
        <div className="flex space-x-6">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="border rounded-md py-2 px-4 shadow-md focus:ring-2 focus:ring-blue-500"
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
            className="border rounded-md py-2 px-4 shadow-md focus:ring-2 focus:ring-blue-500"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-green-100 p-6 rounded-md shadow-xl hover:shadow-2xl transition duration-300">
          <h3 className="font-semibold text-xl text-green-800">Total Income</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-red-100 p-6 rounded-md shadow-xl hover:shadow-2xl transition duration-300">
          <h3 className="font-semibold text-xl text-red-800">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-blue-100 p-6 rounded-md shadow-xl hover:shadow-2xl transition duration-300">
          <h3 className="font-semibold text-xl text-blue-800">Net Profit</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-md shadow-xl">
        <h3 className="font-semibold text-xl mb-6 text-gray-800">Daily Breakdown</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis reverse />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#3b82f6" // Blue for income
              name="Income"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444" // Red for expenses
              name="Expenses"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981" // Green for profit
              name="Profit"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Profit_Loss;
