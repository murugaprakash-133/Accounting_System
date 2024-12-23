import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions', {
        params: { month: currentMonth, year: currentYear },
        withCredentials: true,
      });

      const { transactions, totalIncome, totalExpenses } = response.data;

      const chartData = [
        {
          name: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'short' }),
          income: totalIncome,
          expenses: totalExpenses,
        },
      ];

      setMonthlyData(chartData);
      setTotalIncome(totalIncome);
      setTotalExpenses(totalExpenses);
      setNetProfit(totalIncome - totalExpenses);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black text-white p-4 rounded-md shadow-md">
          <p className="font-semibold">{label}</p>
          <p><span className="text-blue-400">Income:</span> {formatCurrency(payload[0]?.value)}</p>
          <p><span className="text-red-400">Expenses:</span> {formatCurrency(payload[1]?.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-8 mt-20">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Financial Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-200 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <h3 className="text-3xl font-semibold text-green-600">Total Income</h3>
          <p className="text-sm text-gray-500">This Month</p>
          <h3 className="text-3xl font-semibold text-green-600">{formatCurrency(totalIncome)}</h3>
        </div>
        <div className="bg-red-200 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <h3 className="text-3xl font-semibold text-red-600">Total Expenses</h3>
          <p className="text-sm text-gray-500">This Month</p>
          <h3 className="text-3xl font-semibold text-red-600">{formatCurrency(totalExpenses)}</h3>
        </div>
        <div className="bg-blue-200 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
          <h3 className="text-3xl font-semibold text-blue-600">Net Profit</h3>
          <p className="text-sm text-gray-500">This Month</p>
          <h3 className="text-3xl font-semibold text-blue-600">{formatCurrency(netProfit)}</h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" fill="#2563eb" />
            <Bar dataKey="expenses" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
