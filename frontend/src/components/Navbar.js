import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to={isAuthenticated ? "/dashboard" : "/login"} className="navbar-brand">
        Expense Manager
      </Link>

      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className={`navbar-link${isActive("/dashboard") ? " navbar-link-active" : ""}`}
            >
              Dashboard
            </Link>
            <Link
              to="/expenses"
              className={`navbar-link${isActive("/expenses") ? " navbar-link-active" : ""}`}
            >
              Expenses
            </Link>
            <Link
              to="/reports"
              className={`navbar-link${isActive("/reports") ? " navbar-link-active" : ""}`}
            >
              Reports
            </Link>
            <span className="navbar-user">👤 {user?.name}</span>
            <button type="button" className="navbar-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            {location.pathname !== "/login" && (
              <Link to="/login" className="navbar-link">Login</Link>
            )}
            {location.pathname !== "/register" && (
              <Link to="/register" className="navbar-link">Register</Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
