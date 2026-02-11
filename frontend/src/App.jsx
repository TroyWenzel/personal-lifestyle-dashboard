import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Food from "./features/food/FoodPage";
import Weather from "./features/weather/WeatherPage";  
import Art from "./features/art/ArtPage";             
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import Navbar from "./components/layout/Navbar";

function App() {
    return (
        <AuthProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/food" element={
                    <ProtectedRoute>
                        <Food />
                    </ProtectedRoute>
                } />
                
                <Route path="/weather" element={
                    <ProtectedRoute>
                        <Weather />
                    </ProtectedRoute>
                } />
                
                <Route path="/art" element={
                    <ProtectedRoute>
                        <Art />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;