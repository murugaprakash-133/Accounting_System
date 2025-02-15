// import React, { useState } from "react";
// import { FaLock, FaEnvelope } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import { toast } from "react-toastify";

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// const Login = () => {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [error, setError] = useState(null);
//   const { refreshAuthStatus } = useAuth();
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     if (!formData.email || !formData.password) {
//       setError("Both fields are required.");
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/api/auth/login`,
//         formData,
//         { withCredentials: true }
//       );

//       if (response.status === 200) {
//         await refreshAuthStatus();
//         toast.success("Login successful!"); // Show success message

//         // Navigate immediately (without setTimeout)
//         navigate("/dashboard");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.error || "An error occurred. Please try again."
//       );
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-cover bg-center">
//       <div className="w-96 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-lg p-8 text-white">
//         <form onSubmit={handleSubmit}>
//           <h1 className="text-3xl text-center font-bold text-black mb-6">
//             Login
//           </h1>

//           {error && <p className="text-center text-red-500 mb-4">{error}</p>}

//           <div className="relative w-full h-12 mb-6">
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleInputChange}
//               required
//               autoComplete="current-email"
//               className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
//             />
//             <FaEnvelope className="text-zinc-800 absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
//           </div>

//           <div className="relative w-full h-12 mb-6">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleInputChange}
//               required
//               autoComplete="current-password"
//               className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
//             />
//             <FaLock className="text-zinc-800 absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
//           </div>

//           <div className="text-center">
//             <button
//               type="submit"
//               className="w-1/2 h-12 bg-sky-400 text-white font-bold rounded-full shadow-md hover:bg-sky-700 transition focus:outline-none focus:ring-2 focus:ring-black"
//             >
//               Login
//             </button>
//           </div>

//           {/* <div className="mt-4 text-center">
//             <Link
//               to="/forgot-password"
//               className="font-normal text-sm text-gray-800 hover:underline"
//             >
//               Forgot Password?
//             </Link>
//             <p className="text-sm mt-1 text-gray-800">
//               Don't have an account?{" "}
//               <Link
//                 to="/register"
//                 className="font-semibold text-gray-800 hover:underline"
//               >
//                 Register
//               </Link>
//             </p>
//           </div> */}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

"use client";

import { useState } from "react";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { refreshAuthStatus } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Both fields are required.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        await refreshAuthStatus();
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl text-center font-bold text-gray-800 mb-6">
            Login
          </h1>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>

          {/* <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Don't have an account?
              </Link>
            </div>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default Login;
