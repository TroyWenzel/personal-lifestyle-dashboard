import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import "../../styles/components/Navbar.css";

const Navbar = () => {
    const { token, logout, user } = useContext(AuthContext);
    const location = useLocation();

    // All navigation items organized by category
    const navItems = [
        { path: "/", label: "Home", public: true },
        { path: "/dashboard", label: "Dashboard", protected: true },
        { path: "/food", label: "Food", protected: true },
        { path: "/weather", label: "Weather", protected: true },
        { path: "/art", label: "Art", protected: true },
        { path: "/books", label: "Books", protected: true },
        { path: "/drinks", label: "Drinks", protected: true },
        { path: "/space", label: "Space", protected: true },
        { path: "/journal", label: "Journal", protected: true },
        { path: "/hobbies", label: "Activities", protected: true },
        // ✅ Added Profile page link
        { path: "/profile", label: "Profile", protected: true, icon: "👤" },
    ];

    return (
        <nav className="navbar glass-nav">
            <div className="navbar-brand">
                <Link to="/" className="brand-link">
                    <span className="brand-icon">✨</span>
                    <span className="brand-text">LifeHub</span>
                </Link>
            </div>
            
            {/* Mobile menu button */}
            <button className="mobile-menu-btn" aria-label="Toggle menu">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            <div className="navbar-links-container">
                <div className="navbar-links">
                    {navItems.map((item, index) => {
                        if (item.public || (item.protected && token)) {
                            return (
                                <Link 
                                    key={item.path}
                                    to={item.path} 
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    style={{ '--index': index }}
                                >
                                    <span className="nav-label">
                                        {item.icon && <span className="nav-icon">{item.icon}</span>}
                                        {item.label}
                                    </span>
                                    <span className="nav-underline"></span>
                                </Link>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>

            <div className="navbar-auth">
                {token ? (
                    <div className="user-menu">
                        {/* ✅ Quick profile link in user menu */}
                        <Link to="/profile" className="quick-profile-link">
                            <div className="user-greeting">
                                <span className="greeting-emoji">👋</span>
                                <span className="greeting-text">
                                    Hello, <span className="user-name">{user?.username || user?.email?.split('@')[0] || 'Explorer'}</span>
                                </span>
                            </div>
                        </Link>
                        <button 
                            onClick={logout} 
                            className="logout-btn"
                            aria-label="Logout"
                        >
                            <span className="logout-icon">🚪</span>
                            <span className="logout-text">Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="auth-link login-link">
                            <span className="auth-icon">🔐</span>
                            <span className="auth-text">Login</span>
                        </Link>
                        <Link to="/register" className="auth-link register-link">
                            <span className="auth-icon">✨</span>
                            <span className="auth-text">Register</span>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;