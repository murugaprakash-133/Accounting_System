'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  // Get current month and year
  const currentMonth = new Date().getMonth() + 1; // Months are 1-based
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch data for the current month and year
      const response = await axios.get('http://localhost:5000/api/transactions', {
        params: {
          month: currentMonth,
          year: currentYear,
        },
        withCredentials: true, // Ensure credentials are sent for authentication
      });

      // Extract data from the API response
      const { transactions, totalIncome, totalExpenses } = response.data;

      // Update monthlyData dynamically
      const chartData = [
        {
          name: new Date(currentYear, currentMonth - 1).toLocaleString('default', {
            month: 'short',
          }),
          income: totalIncome,
          expenses: totalExpenses,
        },
      ];

      // Update state with fetched data
      setMonthlyData(chartData);
      setTotalIncome(totalIncome);
      setTotalExpenses(totalExpenses);
      setNetProfit(totalIncome - totalExpenses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-slate-800 text-white rounded-lg shadow-md">
          <p className="font-semibold text-lg">{label}</p>
          <p>
            <span className="text-blue-400 font-medium">Income:</span>{' '}
            <span className="ml-2">${payload[0]?.value}</span>
          </p>
          <p>
            <span className="text-indigo-400 font-medium">Expenses:</span>{' '}
            <span className="ml-2">${payload[1]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-8 mt-20">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Financial Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-3xl font-semibold">Total Income</h3>
          <p className="text-sm text-gray-500">Current Month</p>
          <h3 className="text-3xl font-semibold text-green-600">${totalIncome.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-3xl font-semibold">Total Expenses</h3>
          <p className="text-sm text-gray-500">Current Month</p>
          <h3 className="text-3xl font-semibold text-red-600">${totalExpenses.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-3xl font-semibold">Net Profit</h3>
          <p className="text-sm text-gray-500">Current Month</p>
          <h3 className="text-3xl font-semibold text-blue-600">${netProfit.toFixed(2)}</h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Income vs Expenses</h2>
        <p className="text-sm text-gray-500">Monthly Comparison</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#2563eb" />
            <Bar dataKey="expenses" name="Expenses" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
