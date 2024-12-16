// Dashboard.jsx
'use client';

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

const salesData = [
  { name: 'Jan', revenue: 4000, profit: 2400 },
  { name: 'Feb', revenue: 3000, profit: 1398 },
  { name: 'Mar', revenue: 9800, profit: 2000 },
  { name: 'Apr', revenue: 3908, profit: 2780 },
  { name: 'May', revenue: 4800, profit: 1890 },
  { name: 'Jun', revenue: 3800, profit: 2390 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-800 text-white rounded-lg shadow-md">
        <p className="font-semibold text-lg">{label}</p>
        <p>
          <span className="text-blue-400 font-medium">Income:</span>{' '}
          <span className="ml-2">₹{payload[0].value}</span>
        </p>
        <p>
          <span className="text-indigo-400 font-medium">Expenses:</span>{' '}
          <span className="ml-2">₹{payload[1].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-8 mt-20">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Financial Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-3xl font-semibold">Total Income</h3>
          <p className="text-sm text-gray-500">Year of date</p>
          <h3 className="text-3xl font-semibold text-green-600">₹24,000</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-3xl font-semibold">Total Expenses</h3>
          <p className="text-sm text-gray-500">Year of date</p>
          <h3 className="text-3xl font-semibold text-red-600">₹18,000</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-3xl font-semibold">Net Profit</h3>
          <p className="text-sm text-gray-500">Year of date</p>
          <h3 className="text-3xl font-semibold text-blue-600">₹6,000</h3>
        </div>
      </div>
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Income vs Expenses</h2>
        <p className="text-sm text-gray-500">Monthly Comparison</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={salesData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" name="Income" fill="#2563eb" />
            <Bar dataKey="profit" name="Profit" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
