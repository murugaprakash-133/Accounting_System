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

const API_BASE_URL = "http://localhost:5000";

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
    <div className="min-h-screen bg-gray-100 py-10 px-8 mt-20">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Cash Flow</h1>

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
          <h3 className="text-3xl font-semibold text-blue-600">Net Cash Flow</h3>
          <p className="text-sm text-gray-500">This Month</p>
          <h3 className="text-3xl font-semibold text-blue-600">
            {formatCurrency(totalIncome - totalExpenses)}
          </h3>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Daily Cash Flow</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="income" stroke="#2563eb" fill="#2563eb" name="Income" />
            <Area type="monotone" dataKey="expenses" stroke="#8b5cf6" fill="#8b5cf6" name="Expenses" />
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
