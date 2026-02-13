import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// Component that protects routes requiring authentication
function ProtectedRoute({ children }) {
    const { token, loading } = useContext(AuthContext);

    // Show loading indicator while checking authentication
    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    // Redirect to login if no token exists
    return token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;