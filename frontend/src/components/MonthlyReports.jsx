'use client';

import React from 'react';

const cashFlowData = {
  month: 'Jan 2023',
  totalIncome: 10000,
  totalExpenses: 6500,
  netProfit: 3500,
  breakdown: [
    { category: 'Sales', amount: 10000 },
    { category: 'Salaries', amount: -5000 },
    { category: 'Rent', amount: -1000 },
    { category: 'Utilities', amount: -500 },
  ],
};

const MonthlyReport = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold">Monthly Report</h2>
        <p className="text-gray-700">Overview of cash flow for {cashFlowData.month}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Total Income</h2>
          <p className="text-gray-700">{cashFlowData.month}</p>
          <h3 className="text-2xl font-bold text-green-600">${cashFlowData.totalIncome.toFixed(2)}</h3>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Total Expenses</h2>
          <p className="text-gray-700">{cashFlowData.month}</p>
          <h3 className="text-2xl font-bold text-red-600">${cashFlowData.totalExpenses.toFixed(2)}</h3>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Net Profit</h2>
          <p className="text-gray-700">{cashFlowData.month}</p>
          <h3 className="text-2xl font-bold text-blue-600">${cashFlowData.netProfit.toFixed(2)}</h3>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Detailed Breakdown</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-4 px-6 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                Category
              </th>
              <th className="text-right py-4 px-6 border-b-2 border-gray-300 text-gray-700 font-medium uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {cashFlowData.breakdown.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-200`}
              >
                <td className="py-4 px-6 border-b border-gray-300 text-gray-800">
                  {item.category}
                </td>
                <td
                  className={`py-4 px-6 border-b border-gray-300 text-right font-semibold ${
                    item.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  ${item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReport;
