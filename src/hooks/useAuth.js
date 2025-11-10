import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    const userData = localStorage.getItem("userData") || localStorage.getItem("user");
    
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }

    // Check if token is valid (not expired)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isTokenValid = payload.exp * 1000 > Date.now();
      
      if (!isTokenValid) {
        // Clear expired token
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }

    // Parse user data
    let parsedUser = null;
    if (userData) {
      try {
        parsedUser = JSON.parse(userData);
      } catch (error) {
        console.log("Invalid user data format");
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    }

    setIsAuthenticated(true);
    setUser(parsedUser);
    return true;
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    sessionStorage.clear();

    // Clear browser history to prevent back navigation
    window.history.replaceState(null, '', '/login');
    window.history.pushState(null, '', '/login');

    setIsAuthenticated(false);
    setUser(null);

    // Navigate to login page
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'token' || e.key === 'userData' || e.key === 'user') {
        checkAuth();
      }
    };

    // Listen for popstate events to prevent back navigation after logout
    const handlePopState = (event) => {
      if (!isAuthenticated) {
        event.preventDefault();
        event.stopPropagation();
        // Force navigation to login if user tries to go back
        window.history.pushState(null, '', '/login');
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, navigate]);

  return {
    isAuthenticated,
    user,
    checkAuth,
    logout
  };
};
