import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import "../../styles/components/Navbar.css";

// ═══════════════════════════════════════════════════════════════
// Navigation Component
// ═══════════════════════════════════════════════════════════════

const Navbar = () => {
    const { token, logout, user } = useContext(AuthContext);
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: "/",         label: "Home",    public: true },
        { path: "/dashboard",label: "Dashboard", protected: true },
        { path: "/food",     label: "Food",    protected: true },
        { path: "/weather",  label: "Weather", protected: true },
        { path: "/art",      label: "Art",     protected: true },
        { path: "/books",    label: "Books",   protected: true },
        { path: "/drinks",   label: "Drinks",  protected: true },
        { path: "/space",    label: "Space",   protected: true },
        { path: "/journal",  label: "Journal", protected: true },
        { path: "/pokemon",  label: "⚡ Pokémon", protected: true },
        { path: "/profile",  label: "Profile", protected: true, icon: "👤" },
    ];

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu  = () => setMobileMenuOpen(false);

    return (
        <nav className="navbar glass-nav">
            {/* ─── Brand ───────────────────────────────────── */}
            <div className="navbar-brand">
                <Link to="/" className="brand-link" onClick={closeMobileMenu}>
                    <span className="brand-icon">✨</span>
                    <span className="brand-text">LifeHub</span>
                </Link>
            </div>
            
            {/* ─── Mobile Menu Button ──────────────────────── */}
            <button 
                className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                aria-label="Toggle menu"
                onClick={toggleMobileMenu}
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            {/* ─── Navigation Links ────────────────────────── */}
            <div className={`navbar-links-container ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="navbar-links">
                    {navItems.map((item) => {
                        if (item.public || (item.protected && token)) {
                            return (
                                <Link 
                                    key={item.path}
                                    to={item.path} 
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
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
                
                {/* ─── Mobile Auth Menu ─────────────────────── */}
                <div className="navbar-auth-mobile">
                    {token ? (
                        <>
                            <Link to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                                <span className="nav-icon">👤</span>
                                <span>Profile</span>
                            </Link>
                            <button onClick={() => { logout(); closeMobileMenu(); }} className="mobile-nav-link logout">
                                <span className="nav-icon">🚪</span>
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                                <span className="nav-icon">🔐</span>
                                <span>Login</span>
                            </Link>
                            <Link to="/register" className="mobile-nav-link" onClick={closeMobileMenu}>
                                <span className="nav-icon">✨</span>
                                <span>Register</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* ─── Desktop Auth Menu ───────────────────────── */}
            <div className="navbar-auth">
                {token ? (
                    <div className="user-menu">
                        <Link to="/profile" className="quick-profile-link" onClick={closeMobileMenu}>
                            <div className="user-greeting">
                                <span className="greeting-emoji">👋</span>
                                <span className="greeting-text">
                                    Hello, <span className="user-name">
                                        {user?.username || user?.email?.split('@')[0] || 'Explorer'}
                                    </span>
                                </span>
                            </div>
                        </Link>
                        <button 
                            onClick={() => { logout(); closeMobileMenu(); }} 
                            className="logout-btn"
                            aria-label="Logout"
                        >
                            <span className="logout-icon">🚪</span>
                            <span className="logout-text">Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="auth-link login-link" onClick={closeMobileMenu}>
                            <span className="auth-icon">🔐</span>
                            <span className="auth-text">Login</span>
                        </Link>
                        <Link to="/register" className="auth-link register-link" onClick={closeMobileMenu}>
                            <span className="auth-icon">✨</span>
                            <span className="auth-text">Register</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* ─── Mobile Menu Overlay ─────────────────────── */}
            {mobileMenuOpen && (
                <div 
                    className="mobile-menu-overlay" 
                    onClick={closeMobileMenu}
                ></div>
            )}
        </nav>
    );
};

export default Navbar;