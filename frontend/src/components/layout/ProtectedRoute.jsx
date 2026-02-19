import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// ═══════════════════════════════════════════════════════════════
// Protected Route Component
// ═══════════════════════════════════════════════════════════════

function ProtectedRoute({ children }) {
    const { token, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;