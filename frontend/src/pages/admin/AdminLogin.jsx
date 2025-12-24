import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader2, AlertCircle } from 'lucide-react';
import authStore from '../../stores/AuthStore';

const AdminLogin = observer(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (authStore.isAuthenticated && authStore.isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [authStore.isAuthenticated, authStore.isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const success = await authStore.login(email, password);
    
    if (success) {
      if (authStore.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // If logged in but not admin, logout and show error
        await authStore.logout();
        setError('Access Denied: You do not have administrator privileges.');
      }
    } else {
      setError(authStore.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 text-center">
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-blue-100 mt-1">Secure Access Only</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-100 flex items-start gap-2">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authStore.isLoading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              {authStore.isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Public Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AdminLogin;
