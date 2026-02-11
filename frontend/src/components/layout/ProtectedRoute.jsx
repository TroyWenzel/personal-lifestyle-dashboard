import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // CORRECT

function ProtectedRoute({ children }) {
    const { token, loading } = useContext(AuthContext);
    
    console.log("ProtectedRoute - Token:", token);
    console.log("ProtectedRoute - Loading:", loading);

    if (loading) {
        return <div>Loading...</div>;
    }

    return token ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;