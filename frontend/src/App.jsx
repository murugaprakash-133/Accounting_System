import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import IncomeExpense from "./components/IncomeExpense";
import Dashboard from "./components/Dashboard";
import Profit_Loss from "./components/Profit_Loss";
// import CashFlowPart from "./components/CashFlow";
import MonthlyReport from "./components/MonthlyReports";
import DetailedReportslide from "./components/DetailedReports";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import ManageRecipients from "./components/ManageRecipients";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  const { isLoggedIn, isInitialized } = useAuth();

  if (!isInitialized) {
    return <p>Loading...</p>;
  }

  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-grow">
          {isLoggedIn && <Sidebar />}
          <div className="flex-grow p-4">
            <Routes>
              <Route
                path="/"
                element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/income-expense" element={isLoggedIn ? <IncomeExpense /> : <Navigate to="/" />} />
              <Route path="/profit-loss" element={isLoggedIn ? <Profit_Loss /> : <Navigate to="/" />} />
              {/* <Route path="/cash-flow" element={isLoggedIn ? <CashFlowPart /> : <Navigate to="/" />} /> */}
              <Route path="/monthly-reports" element={isLoggedIn ? <MonthlyReport /> : <Navigate to="/" />} />
              <Route path="/detailed-reports" element={isLoggedIn ? <DetailedReportslide /> : <Navigate to="/" />} />
              <Route path="/manage-recipients" element={isLoggedIn ? <ManageRecipients /> : <Navigate to="/" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}