import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Reset Password
  const [error, setError] = useState(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password/send-otp`, { email });
      toast.success("OTP sent to your email!");
      setOtpRequested(true);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
      toast.error(err.response?.data?.error || "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password/verify-otp`, { email, otp });
      toast.success("OTP verified successfully!");
      setStep(2); // Move to Reset Password
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP.");
      toast.error(err.response?.data?.error || "Failed to verify OTP.");
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password/reset`, {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000); // Redirect to login page after 3 seconds
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
      toast.error(err.response?.data?.error || "Failed to reset password.");
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
        }}
      />
      <div style={{
        width: '400px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '32px',
        color: 'white'
      }}>
        {step === 1 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            otpRequested ? handleVerifyOtp() : handleRequestOtp();
          }}>
            <h1 style={{
              fontSize: '24px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'black',
              marginBottom: '24px'
            }}>Forgot Password</h1>
            {error && <p style={{ textAlign: 'center', color: 'red', marginBottom: '16px' }}>{error}</p>}
            <div style={{ position: 'relative', width: '100%', height: '48px', marginBottom: '24px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'transparent',
                  border: '1px solid #4a5568',
                  borderRadius: '24px',
                  color: 'black',
                  paddingLeft: '24px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <FaEnvelope style={{
                position: 'absolute',
                right: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                color: '#4a5568'
              }} />
            </div>
            {otpRequested && (
              <div style={{ position: 'relative', width: '100%', height: '48px', marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                    border: '1px solid #4a5568',
                    borderRadius: '24px',
                    color: 'black',
                    paddingLeft: '24px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#38b2ac',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s'
              }}
            >
              {otpRequested ? 'Verify OTP' : 'Request OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleResetPassword();
          }}>
            <h1 style={{
              fontSize: '24px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'black',
              marginBottom: '24px'
            }}>Reset Password</h1>
            {error && <p style={{ textAlign: 'center', color: 'red', marginBottom: '16px' }}>{error}</p>}
            <div style={{ position: 'relative', width: '100%', height: '48px', marginBottom: '24px' }}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'transparent',
                  border: '1px solid #4a5568',
                  borderRadius: '24px',
                  color: 'black',
                  padding: '0 20px 0 48px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <FaLock style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                color: '#4a5568'
              }} />
            </div>
            <div style={{ position: 'relative', width: '100%', height: '48px', marginBottom: '24px' }}>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'transparent',
                  border: '1px solid #4a5568',
                  borderRadius: '24px',
                  color: 'black',
                  padding: '0 20px 0 48px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <FaLock style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                color: '#4a5568'
              }} />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#38b2ac',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s'
              }}
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

