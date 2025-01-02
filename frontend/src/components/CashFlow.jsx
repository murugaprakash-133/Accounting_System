'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CashFlow = () => {
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
    fetchCashFlowData();
  }, [selectedMonth, selectedYear]);

  const fetchCashFlowData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transactions`, {
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
        netCashFlow: item.income - item.expenses,
      })));
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Cash Flow</h2>
          <p className="text-gray-600">Overview of your cash flow</p>
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
        <div className="bg-green-100 p-6 rounded-md shadow-lg hover:shadow-xl transition duration-300">
          <h3 className="font-semibold text-xl text-green-800">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-red-100 p-6 rounded-md shadow-lg hover:shadow-xl transition duration-300">
          <h3 className="font-semibold text-xl text-red-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-blue-100 p-6 rounded-md shadow-lg hover:shadow-xl transition duration-300">
          <h3 className="font-semibold text-xl text-blue-800">Net Cash Flow</h3>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalIncome - totalExpenses)}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-md shadow-lg">
        <h3 className="font-semibold text-xl mb-4 text-gray-800">Daily Cash Flow</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="income" stroke="#3b82f6" fill="#3b82f6" name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#ef4444" name="Expenses" />
            <Area
              type="monotone"
              dataKey="netCashFlow"
              stroke="#10b981"
              fill="#10b981"
              name="Net Cash Flow"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlow;
