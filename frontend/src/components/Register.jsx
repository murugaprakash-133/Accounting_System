import React, { useState } from 'react';
import { FaUserCircle, FaLock, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate form data
        if (!formData.email || !formData.name || !formData.password || !formData.confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Send POST request to backend
            const response = await axios.post("http://localhost:5000/api/auth/signup", formData);

            // Handle success
            if (response.status === 201) {
                alert("Registration successful!");
                navigate("/login");
            }
        } catch (err) {
            // Handle errors from the server
            setError(err.response?.data?.error || "An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-cover bg-center">
            <div className="w-96 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-lg p-8 text-white">
                <form onSubmit={handleSubmit}>
                    <h1 className="text-3xl text-center font-bold text-black mb-6">Register</h1>

                    {error && <p className="text-center text-red-500 mb-4">{error}</p>}

                    <div className="relative w-full h-12 mb-6">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleInputChange}
                            value={formData.email}
                            required
                            className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                        <FaEnvelope className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
                    </div>

                    <div className="relative w-full h-12 mb-6">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            onChange={handleInputChange}
                            value={formData.name}
                            required
                            className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                        <FaUserCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
                    </div>

                    <div className="relative w-full h-12 mb-6">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleInputChange}
                            value={formData.password}
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
                            onChange={handleInputChange}
                            value={formData.confirmPassword}
                            required
                            className="w-full h-full bg-transparent border border-gray-600 rounded-full text-black px-5 pr-12 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                        <FaLock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl" />
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
                        <p className="text-sm text-gray-800">
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
