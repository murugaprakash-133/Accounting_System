import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import IncomeExpense from "./components/IncomeExpense";
import Dashboard from "./components/Dashboard";
import Profit_Loss from "./components/Profit_Loss";
import CashFlowPart from "./components/CashFlow";
import MonthlyReport from "./components/MonthlyReports";
import DetailedReportslide from "./components/DetailedReports";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import ModifyOB from "./components/ModifyOB";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-grow">
          <Sidebar />
          <div className="flex-grow p-4">
            <Routes>
              <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/income-expense" element={isLoggedIn ? <IncomeExpense /> : <Navigate to="/" />} />
              <Route path="/profit-loss" element={isLoggedIn ? <Profit_Loss /> : <Navigate to="/" />} />
              <Route path="/cash-flow" element={isLoggedIn ? <CashFlowPart /> : <Navigate to="/" />} />
              <Route path="/monthly-reports" element={isLoggedIn ? <MonthlyReport /> : <Navigate to="/" />} />
              <Route path="/detailed-reports" element={isLoggedIn ? <DetailedReportslide /> : <Navigate to="/" />} />
              <Route path="/modify-ob" element={isLoggedIn ? <ModifyOB /> : <Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
