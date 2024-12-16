// Sidebar.jsx
import { Link, Outlet } from "react-router-dom";

const Sidebar = () => {
  const Menus = [
    { title: "Dashboard", src: "Chart_fill", path: "/" },
    { title: "Income & Expense Tracker", src: "Chat", path: "/income-expense" },
    { title: "Profit & Loss", src: "User", path: "/profit-loss", gap: true },
    { title: "Cash Flow", src: "Calendar", path: "/cash-flow" },
    { title: "Monthly Reports", src: "Search", path: "/monthly-reports" },
    { title: "Detailed Reports", src: "Chart", path: "/detailed-reports" },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-br from-gray-800 to-gray-600 p-5 pt-4 fixed top-0 left-0 h-screen">
        {/* Logo Section */}
        <div className="flex items-center gap-x-4">
          <img
            src="./src/assets/logo.png"
            alt="logo"
            className="cursor-pointer duration-500 rotate-[360deg]"
          />
          <h1 className="text-white origin-left font-medium text-xl">
            MyTracker
          </h1>
        </div>
        {/* Menu Items */}
        <ul className="pt-6">
          {Menus.map((Menu, index) => (
            <li key={index} className="mb-3">
              <Link
                to={Menu.path}
                className="flex items-center gap-x-4 text-gray-200 hover:text-white hover:bg-gray-700 rounded-md p-2 transition duration-300"
              >
                <img src={`./src/assets/${Menu.src}.png`} alt="icon" className="w-6" />
                <span>{Menu.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-6 h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
