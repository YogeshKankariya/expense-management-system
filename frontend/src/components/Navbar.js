import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // User initials for avatar badge
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        {/* Brand / Logo */}
        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className="navbar-brand"
          onClick={closeMobileMenu}
        >
          <div className="brand-logo-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="4" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <circle cx="16" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="brand-title">
            Expense<span className="brand-accent">Hub</span>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          className={`navbar-toggle ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        {/* Navigation Links & Actions */}
        <div className={`navbar-collapse ${mobileMenuOpen ? "is-open" : ""}`}>
          {isAuthenticated ? (
            <>
              <div className="navbar-nav">
                <Link
                  to="/dashboard"
                  className={`navbar-link ${isActive("/dashboard") ? "navbar-link-active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <svg
                    className="nav-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/expenses"
                  className={`navbar-link ${isActive("/expenses") ? "navbar-link-active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <svg
                    className="nav-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span>Expenses</span>
                </Link>

                <Link
                  to="/reports"
                  className={`navbar-link ${isActive("/reports") ? "navbar-link-active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  <svg
                    className="nav-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                  <span>Reports</span>
                </Link>
              </div>

              {/* User Section & Logout */}
              <div className="navbar-user-section">
                <div className="navbar-user-profile">
                  <div className="navbar-avatar" title={user?.name}>
                    {userInitial}
                  </div>
                  <div className="navbar-user-details">
                    <span className="navbar-user-name">{user?.name}</span>
                    <span className="navbar-user-email">{user?.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="navbar-logout-btn"
                  onClick={handleLogout}
                  title="Log out of your account"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth-links">
              {location.pathname !== "/login" && (
                <Link
                  to="/login"
                  className="btn btn-outline btn-sm"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
              )}
              {location.pathname !== "/register" && (
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
