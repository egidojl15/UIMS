import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated

  useEffect(() => {
    const checkAuth = () => {
      // Retrieve the token and user data from local storage
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const userData = localStorage.getItem("userData") || localStorage.getItem("user");
      
      console.log("🔒 PrivateRoute check:", {
        hasToken: !!token,
        tokenKey: localStorage.getItem("authToken") ? "authToken" : localStorage.getItem("token") ? "token" : "none",
        userData: userData,
        allowedRoles: allowedRoles,
        currentPath: location.pathname,
      });

      if (!token) {
        console.log("❌ No token found, redirecting to login");
        setIsAuthenticated(false);
        return;
      }

      // Check if token is valid (not expired)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isTokenValid = payload.exp * 1000 > Date.now();
        
        if (!isTokenValid) {
          console.log("❌ Token expired, redirecting to login");
          // Clear expired token
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          return;
        }
      } catch (error) {
        console.log("❌ Invalid token format, redirecting to login");
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        return;
      }

      // Parse user data
      let user = null;
      if (userData) {
        try {
          user = JSON.parse(userData);
        } catch (error) {
          console.log("❌ Invalid user data format");
          setIsAuthenticated(false);
          return;
        }
      }

      // Check if the user has the required role
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.log("❌ Role mismatch:", {
          userRole: user.role,
          allowedRoles: allowedRoles,
          isAllowed: allowedRoles.includes(user.role),
        });
        setIsAuthenticated(false);
        return;
      }

      console.log("✅ PrivateRoute access granted");
      setIsAuthenticated(true);
    };

    checkAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'token' || e.key === 'userData' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [allowedRoles, location.pathname]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default PrivateRoute;
