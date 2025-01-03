const Sidebar = () => {
  const { isLoggedIn, userDetails } = useAuth();
  const [activeMenu, setActiveMenu] = useState("/");

  const Menus = [
    { title: "Dashboard", icon: "📊", path: "/" },
    { title: "Income & Expense Tracker", icon: "💸", path: "/income-expense" },
    {
      title: "Profit & Loss",
      icon: "📈",
      path: "/profit-loss",
      restricted: true,
    },
    { title: "Cash Flow", icon: "💰", path: "/cash-flow", restricted: true },
    { title: "Monthly Reports", icon: "📅", path: "/monthly-reports" },
    {
      title: "Detailed Reports",
      icon: "📄",
      path: "/detailed-reports",
      restricted: true,
    },
    {
      title: "Manage Recipients",
      icon: "✉️",
      path: "/manage-recipients",
      restricted: true,
    }, // New menu item
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 z-50 h-full bg-gradient-to-br from-gray-800 to-gray-600 p-5 pt-4 w-16 md:w-64 transition-all duration-300 ease-in-out">
        {/* Logo Section */}
        <div className="flex items-center justify-center md:justify-start mb-6">
          <img
            src={logo}
            alt="logo"
            className="cursor-pointer object-contain w-10 h-10 md:w-12 md:h-12 transition-transform duration-500 transform hover:rotate-[360deg]"
          />
          <span className="text-2xl font-bold gap-x-4 px-3 py-2 text-gray-200 rounded-md hover:text-white transition duration-300 ease-in-out w-full hidden md:inline-block">
            Accountify
          </span>
        </div>

        {/* Menu Items */}
        <ul className="space-y-6 mt-10 flex flex-col items-center md:items-start">
          {Menus.map((menu, index) => {
            if (menu.restricted && userDetails?.role !== "Admin") {
              return null;
            }

            return (
              <li key={index} className="w-full">
                <Link
                  to={menu.path}
                  onClick={() => setActiveMenu(menu.path)}
                  className={`flex items-center gap-x-4 px-3 py-2 text-gray-200 rounded-md hover:text-white transition duration-300 ease-in-out w-full justify-center md:justify-start ${
                    activeMenu === menu.path
                      ? "bg-gray-700"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <span className="text-2xl">{menu.icon}</span>
                  <span className="hidden md:inline-block">{menu.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main Content */}
      <div className="ml-16 md:ml-64 p-0 w-full h-full bg-gray-100 transition-all duration-300 ease-in-out">
        <div className="w-full">{/* Place for content rendering */}</div>
      </div>
    </div>
  );
};

export default Sidebar;
