import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndPreventBack = () => {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      // If no token and trying to access protected routes, redirect to login
      if (!token && location.pathname.startsWith("/dashboard")) {
        console.log(
          "🚨 No token found, redirecting to login from:",
          location.pathname
        );
        navigate("/login", { replace: true });
        return;
      }

      // If token exists, check if it's valid
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const isTokenValid = payload.exp * 1000 > Date.now();

          if (!isTokenValid && location.pathname.startsWith("/dashboard")) {
            console.log(
              "🚨 Token expired, redirecting to login from:",
              location.pathname
            );
            // Clear expired token
            localStorage.removeItem("authToken");
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
          }
        } catch (error) {
          console.log(
            "🚨 Invalid token, redirecting to login from:",
            location.pathname
          );
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }
      }
    };

    // Check authentication on mount and when location changes
    checkAuthAndPreventBack();

    // Listen for popstate events to prevent back navigation after logout
    const handlePopState = (event) => {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");

      if (!token && location.pathname.startsWith("/dashboard")) {
        event.preventDefault();
        event.stopPropagation();
        console.log(
          "🚨 Back navigation prevented - no token, redirecting to login"
        );
        window.history.pushState(null, "", "/login");
        navigate("/login", { replace: true });
      }
    };

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e) => {
      if (
        (e.key === "authToken" ||
          e.key === "token" ||
          e.key === "userData" ||
          e.key === "user") &&
        location.pathname.startsWith("/dashboard")
      ) {
        console.log("🚨 Storage changed, checking authentication");
        checkAuthAndPreventBack();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [location.pathname, navigate]);

  return children;
};

export default AuthGuard;
