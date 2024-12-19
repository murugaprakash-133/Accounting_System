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
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  // Get current month and year
  const currentMonth = new Date().getMonth() + 1; // Months are 1-based
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchProfitLossData();
  }, []);

  const fetchProfitLossData = async () => {
    try {
      // Fetch data for the current month and year
      const response = await axios.get('http://localhost:5000/api/transactions', {
        params: {
          month: currentMonth,
          year: currentYear,
        },
        withCredentials: true,
      });

      const { totalIncome, totalExpenses } = response.data;

      // Calculate net profit
      const netProfit = totalIncome - totalExpenses;

      // Generate smooth zigzag-like data for the line chart
      const variationFactor = 100; // Controls the level of fluctuation
      const chartData = Array.from({ length: 10 }, (_, i) => ({
        name: `Point ${i + 1}`,
        income:
          totalIncome +
          Math.sin((i + 1) * Math.PI / 4) * variationFactor, // Smooth sine wave variation
        expenses:
          totalExpenses +
          Math.cos((i + 1) * Math.PI / 4) * variationFactor, // Smooth cosine wave variation
        profit:
          netProfit +
          Math.sin((i + 1) * Math.PI / 6) * (variationFactor / 2), // Smaller variation for profit
      }));

      setTotalIncome(totalIncome);
      setTotalExpenses(totalExpenses);
      setNetProfit(netProfit);
      setMonthlyData(chartData);
    } catch (error) {
      console.error('Error fetching profit/loss data:', error);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-slate-800 text-white mt-20 rounded-md">
          <p className="font-semibold text-lg">{label}</p>
          <p>
            <span className="text-blue-400 font-medium">Income:</span>{' '}
            <span className="ml-2">${payload.find((d) => d.dataKey === 'income')?.value.toFixed(2)}</span>
          </p>
          <p>
            <span className="text-indigo-400 font-medium">Profit:</span>{' '}
            <span className="ml-2">${payload.find((d) => d.dataKey === 'profit')?.value.toFixed(2)}</span>
          </p>
          <p>
            <span className="text-green-400 font-medium">Expenses:</span>{' '}
            <span className="ml-2">${payload.find((d) => d.dataKey === 'expenses')?.value.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 mt-20 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6">Profit & Loss</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Total Income</h2>
          <p className="text-gray-700">Current Month</p>
          <h3 className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</h3>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Total Expenses</h2>
          <p className="text-gray-700">Current Month</p>
          <h3 className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</h3>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Net Profit</h2>
          <p className="text-gray-700">Current Month</p>
          <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ${netProfit.toFixed(2)}
          </h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-lg shadow">
        <h3 className="text-3xl font-semibold text-gray-800">Income & Expenses & Profit</h3>
        <p className="text-gray-700 mb-5">Current Month Smooth Flow</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#3b82f6"
                name="Income"
                strokeWidth={2}
                dot
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#10b981"
                name="Expenses"
                strokeWidth={2}
                dot
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#8b5cf6"
                name="Profit"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Profit_Loss;
