import React, { useState } from 'react';
import { FaUserCircle, FaLock, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Register = () => {
    // const [formData, setFormData] = useState({
    //     username: "",
    //     email: "",
    //     password: "",
    //     confirmPassword: ""
    // });

    // const handleInputChange = (e) => {
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // };

    return (
        <div className="flex justify-center items-center min-h-screen bg-cover bg-center">
            <div className="w-96 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-lg p-8 text-white">
                <form>
                    <h1 className="text-3xl text-center font-bold text-black mb-6">Register</h1>

                    <div className="relative w-full h-12 mb-6">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            // onChange={handleInputChange}
                            // value={formData.username}
                            required
                            className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                        <FaUserCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
                    </div>

                    <div className="relative w-full h-12 mb-6">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            // onChange={handleInputChange}
                            // value={formData.email}
                            required
                            className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                        <FaEnvelope className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
                    </div>

                    <div className="relative w-full h-12 mb-6">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            // onChange={handleInputChange}
                            // value={formData.password}
                            required
                            className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                        <FaLock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
                    </div>

                    <div className="relative w-full h-12 mb-6">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            // onChange={handleInputChange}
                            // value={formData.confirmPassword}
                            required
                            className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                        <FaLock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
                    </div>

                    <div className="flex items-center mb-6">
                        <input type="checkbox" className="mr-2 text-slate-700" />
                        <label className='text-slate-700'>Remember me</label>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            className="w-1/2 h-12 bg-sky-400 text-white font-bold rounded-full shadow-md hover:bg-sky-700 transition focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            Register
                        </button>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-sm  text-gray-800">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-gray-800 hover:underline">
                                Login
                             </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
