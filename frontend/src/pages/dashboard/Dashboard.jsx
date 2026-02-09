import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
    const { logout, token } = useContext(AuthContext);
    const navigate = useNavigate();

    console.log("Dashboard token:", token);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard! 🎉</p>
            <p>You are successfully authenticated.</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Dashboard;