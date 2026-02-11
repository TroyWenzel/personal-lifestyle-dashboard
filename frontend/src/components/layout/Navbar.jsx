import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const { token, logout } = useContext(AuthContext);
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">LifeHub</Link>
            </div>
            
            <div className="navbar-links">
                <Link 
                    to="/" 
                    className={location.pathname === "/" ? "active" : ""}
                >
                    Home
                </Link>
                
                {token ? (
                    <>
                        <Link 
                            to="/dashboard" 
                            className={location.pathname === "/dashboard" ? "active" : ""}
                        >
                            Dashboard
                        </Link>
                        <Link 
                            to="/food" 
                            className={location.pathname === "/food" ? "active" : ""}
                        >
                            Food
                        </Link>
                        <Link 
                            to="/weather" 
                            className={location.pathname === "/weather" ? "active" : ""}
                        >
                            Weather
                        </Link>
                        <Link 
                            to="/art" 
                            className={location.pathname === "/art" ? "active" : ""}
                        >
                            Art
                        </Link>
                        <button onClick={logout} className="logout-button">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link 
                            to="/login" 
                            className={location.pathname === "/login" ? "active" : ""}
                        >
                            Login
                        </Link>
                        <Link 
                            to="/register" 
                            className={location.pathname === "/register" ? "active" : ""}
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;