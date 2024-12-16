// Profit_Loss.jsx
'use client';

import React from 'react';
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

const salesData = [
  { name: 'Jan', revenue: 4000, profit: 2400, expenses: 1600 },
  { name: 'Feb', revenue: 3000, profit: 1398, expenses: 1602 },
  { name: 'Mar', revenue: 9800, profit: 2000, expenses: 7800 },
  { name: 'Apr', revenue: 3908, profit: 2780, expenses: 1128 },
  { name: 'May', revenue: 4800, profit: 1890, expenses: 2910 },
  { name: 'Jun', revenue: 3800, profit: 2390, expenses: 1410 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-800 text-white mt-20 rounded-md">
        <p className="font-semibold text-lg">{label}</p>
        <p>
          <span className="text-blue-400 font-medium">Income:</span>{' '}
          <span className="ml-2">₹{payload.find((d) => d.dataKey === 'revenue')?.value}</span>
        </p>
        <p>
          <span className="text-indigo-400 font-medium">Profit:</span>{' '}
          <span className="ml-2">₹{payload.find((d) => d.dataKey === 'profit')?.value}</span>
        </p>
        <p>
          <span className="text-green-400 font-medium">Expenses:</span>{' '}
          <span className="ml-2">₹{payload.find((d) => d.dataKey === 'expenses')?.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Profit_Loss = () => {
  return (
    <div className="p-6 bg-gray-50 mt-20 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6">Profit & Loss</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Total Income</h2>
          <p className="text-gray-700">Year to Date</p>
          <h3 className="text-2xl font-bold text-green-600">₹16060.00</h3>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Total Expenses</h2>
          <p className="text-gray-700">Year to Date</p>
          <h3 className="text-2xl font-bold text-red-600">₹26106.00</h3>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Net Profit/Loss</h2>
          <p className="text-gray-700">Year to Date</p>
          <h3 className="text-2xl font-bold text-blue-600">₹-10046.00</h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-lg shadow">
        <h3 className="text-3xl font-semibold  text-gray-800">
          Income & Expenses & Profit
        </h3>
        <p className="text-gray-700 mb-5">Monthly Comparison</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Income" />
              <Line type="monotone" dataKey="profit" stroke="#8b5cf6" name="Profit" />
              <Line type="monotone" dataKey="expenses" stroke="#10b981" name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Profit_Loss;
