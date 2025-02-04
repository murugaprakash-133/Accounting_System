'use client';
import React, { useState } from "react";


const Board = () => {
  const [formData, setFormData] = useState({
    Project_ID: "",
    Original_Budget: "",
    Actual_Cost: "",
    Change_Order_Count: "",
    Change_Order_Type: "",
    Change_Order_Cost: "",
    Inflation_Rate: "",
    Labor_Rate_Index: "",
    Material_Cost_Variance: "",
    Equipment_Costs: "",
    Delay_Penalties: "",
    Overtime_Costs: "",
    Permitting_Costs: "",
    Design_Revisions: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Project Input and Summary</h1>
      <div className="flex w-full max-w-6xl">
        {/* Input Table */}
        <div className="w-1/2 bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Input Fields</h2>
          <table className="table-auto w-full">
            <tbody>
              {Object.keys(formData).map((key) => (
                <tr key={key} className="border-b">
                  <td className="p-2 text-gray-600 font-medium">{key}</td>
                  <td className="p-2">
                    <textarea
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Table */}
        <div className="w-1/2 bg-white shadow-lg rounded-lg p-4 ml-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <table className="table-auto w-full">
            <tbody>
              <tr className="border-b">
                <td className="p-2 text-gray-600 font-medium">Total Budget</td>
                <td className="p-2">{formData.Original_Budget || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-gray-600 font-medium">Current Status</td>
                <td className="p-2">{formData.Actual_Cost || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 text-gray-600 font-medium">
                  Change Order Cost
                </td>
                <td className="p-2">{formData.Change_Order_Cost || "N/A"}</td>
              </tr>
              <tr>
                <td className="p-2 text-gray-600 font-medium">Visual Charts</td>
                <td className="p-2">
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Pie Chart Placeholder</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Board;
