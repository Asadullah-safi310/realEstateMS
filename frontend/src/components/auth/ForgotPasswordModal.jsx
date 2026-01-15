import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, Phone, CheckCircle, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: Identify, 2: Confirm Email, 3: Enter OTP, 4: Reset Password
  const [identifier, setIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!isOpen) return null;

  const handleIdentify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { identifier });
      setMaskedEmail(response.data.maskedEmail);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/auth/forgot-password', { identifier, email });
      setStep(3);
      setTimer(60);
      toast.success('Verification code sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/auth/verify-reset-code', { identifier, otp });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/auth/reset-password', { identifier, otp, newPassword });
      toast.success('Password reset successfully');
      setStep(1);
      setIdentifier('');
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      onSwitchToLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleIdentify} className="space-y-4">
            <p className="text-sm text-gray-600">Enter your phone number or username to find your account.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter phone or username"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Continue'}
            </button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleSendCode} className="space-y-4">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>
            <p className="text-sm text-gray-600">
              Confirm the email you provided in your profile settings:
              <span className="block font-medium text-gray-800 mt-1">{maskedEmail}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your-email@example.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Code'}
            </button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-600">Enter the 6-digit code sent to your email.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify Code'}
            </button>
            <div className="text-center">
              <button
                type="button"
                disabled={timer > 0 || loading}
                onClick={handleSendCode}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
              >
                {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        );
      case 4:
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-600">Enter your new password.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
              <li>Minimum 8 characters</li>
              <li>At least 1 number</li>
              <li>At least 1 special character</li>
            </ul>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-4">
              {error}
            </div>
          )}
          {renderStep()}
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
