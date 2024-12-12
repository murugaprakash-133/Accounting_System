// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import IncomeExpense from "./components/IncomeExpense";
import Dashboard from "./components/Dashboard";
import Profit_Loss from "./components/Profit_Loss";
import CashFlowPart from "./components/CashFlow";
import MonthlyReport from "./components/MonthlyReports";
import DetailedReportslide from "./components/DetailedReports";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen ">
        <Header />
        <div className="flex flex-grow">
          <Sidebar />
          <div className="flex-grow p-4">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="income-expense" element={<IncomeExpense />} />
              <Route path="profit-loss" element={<Profit_Loss />} />
              <Route path="cash-flow" element={<CashFlowPart />} />
              <Route path="monthly-reports" element={<MonthlyReport />} />
              <Route path="detailed-reports" element={<DetailedReportslide />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
