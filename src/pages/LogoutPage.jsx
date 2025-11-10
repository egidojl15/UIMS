import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle } from 'lucide-react';
import { loginsAPI } from '../services/api'; // ✅ Import API helper
import { useAuth } from '../hooks/useAuth';

const LogoutPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [logoutComplete, setLogoutComplete] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // ✅ Get user_id from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const user_id = userData?.user_id;

        if (user_id) {
          await loginsAPI.logout(user_id); // ✅ Call backend to record logout
        }

        setIsLoggingOut(false);
        setLogoutComplete(true);

        // Use the logout function from useAuth hook
        // This will handle clearing data and preventing back navigation
        setTimeout(() => {
          logout();
        }, 2000);

      } catch (error) {
        console.error('Logout error:', error);
        // Still force logout for security using the hook
        logout();
      }
    };

    performLogout();
  }, [navigate]);

  if (logoutComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] to-[#58A1D3] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0F4C81] mb-2">Logout Successful</h2>
            <p className="text-gray-600">You have been successfully logged out.</p>
          </div>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] to-[#58A1D3] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <LogOut className="w-16 h-16 text-[#0F4C81] mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-[#0F4C81] mb-2">Logging Out</h2>
          <p className="text-gray-600">Please wait while we log you out safely...</p>
        </div>

        {/* Loading spinner */}
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F4C81]"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
