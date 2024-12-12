"CashFlow.jsx"

'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const cashFlowData = [
  { name: 'Jan', cashIn: 4000, cashOut: 2400, netCashFlow: 1600 },
  { name: 'Feb', cashIn: 3000, cashOut: 1398, netCashFlow: 1602 },
  { name: 'Mar', cashIn: 9800, cashOut: 2000, netCashFlow: 7800 },
  { name: 'Apr', cashIn: 3908, cashOut: 2780, netCashFlow: 1128 },
  { name: 'May', cashIn: 4800, cashOut: 1890, netCashFlow: 2910 },
  { name: 'Jun', cashIn: 3800, cashOut: 2390, netCashFlow: 1410 },
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white shadow rounded-md">
        <p className="font-semibold text-lg">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: ${entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main Component
const CashFlow = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      <h2 className="text-3xl font-semibold mb-6">Cash Flow Summary</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Total Cash In</h2>
          <p className="text-gray-700">Year to Date</p>
          <h3 className="text-2xl font-bold text-blue-600">$29008.00</h3>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Total Cash Out</h2>
          <p className="text-gray-700">Year to Date</p>
          <h3 className="text-2xl font-bold text-green-600">$13258.00</h3>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Net Cash Flow</h2>
          <p className="text-gray-700">Year to Date</p>
          <h3 className="text-2xl font-bold text-orange-600">$15750.00</h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold">Cash Flow Trends</h2>
        <p className="text-gray-700 mb-6">Monthly breakdown</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cashFlowData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cashIn"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                name="cashIn"
              />
              <Area
                type="monotone"
                dataKey="cashOut"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
                name="cashOut"
              />
              <Area
                type="monotone"
                dataKey="netCashFlow"
                stroke="#ffc658"
                fill="#ffc658"
                fillOpacity={0.3}
                name="netCashFlow"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
