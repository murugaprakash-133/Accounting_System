// DetailedReports.jsx
import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const DetailedReports = () => {
  const [selectedReport, setSelectedReport] = useState('Income by Category');

  const dataMap = {
    'Income by Category': {
      labels: ['Product Sales', 'Services', 'Subscriptions', 'Other'],
      datasets: [
        {
          data: [400, 300, 300, 200],
          backgroundColor: ['#007bff', '#28a745', '#ffc107', '#fd7e14'],
        },
      ],
    },
    'Expenses by Category': {
      labels: ['Salaries', 'Marketing', 'Rent', 'Utilities'],
      datasets: [
        {
          data: [400, 300, 200, 100],
          backgroundColor: ['#007bff', '#28a745', '#ffc107', '#fd7e14'],
        },
      ],
    },
    'Profit by Product': {
      labels: ['Product A', 'Product B', 'Product C', 'Product D'],
      datasets: [
        {
          data: [400, 300, 200, 100],
          backgroundColor: ['#007bff', '#28a745', '#ffc107', '#fd7e14'],
        },
      ],
    },
  };

  const handleChange = (event) => {
    setSelectedReport(event.target.value);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Detailed Reports</h2>

      <select
        value={selectedReport}
        onChange={handleChange}
        className="block mx-auto mb-6 w-full max-w-sm px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option>Income by Category</option>
        <option>Expenses by Category</option>
        <option>Profit by Product</option>
      </select>

      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <Pie
            data={dataMap[selectedReport]}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#4a5568',
                  },
                },
              },
              animation: {
                animateScale: true,
                animateRotate: true,
              },
            }}
          />
        </div>
      </div>

      <table className="w-full mt-8 text-sm border-collapse rounded-lg">
        <thead className="bg-gray-200 text-gray-600">
          <tr>
            <th className="border-b px-8 py-4 text-left">Category</th>
            <th className="border-b px-4 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {dataMap[selectedReport].labels.map((label, index) => (
            <tr key={label} className="even:bg-gray-50">
              <td className="px-8 py-4 border-b text-gray-700">{label}</td>
              <td className="px-8 py-4 border-b text-right text-gray-700">
              ₹{dataMap[selectedReport].datasets[0].data[index]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DetailedReports;
