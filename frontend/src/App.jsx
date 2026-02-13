import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Food from "./features/FoodPage";
import Weather from "./features/WeatherPage";  
import Art from "./features/ArtPage";
import BooksPage from "./features/BooksPage";
import DrinksPage from "./features/DrinksPage";
import SpacePage from "./features/SpacePage";
import JournalPage from "./features/JournalPage";
import HobbyIdeasPage from "./features/HobbyIdeasPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/home";
import Navbar from "./components/layout/Navbar";
import './styles/index.css';
import './styles/components/navbar.css';
import './styles/pages/dashboard.css';
import './styles/pages/auth.css';
import ProfilePage from './pages/ProfilePage';

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

                <Route path="/books" element={
                    <ProtectedRoute>
                        <BooksPage />
                    </ProtectedRoute>
                } />

                <Route path="/drinks" element={
                    <ProtectedRoute>
                        <DrinksPage />
                    </ProtectedRoute>
                } />

                <Route path="/space" element={
                    <ProtectedRoute>
                        <SpacePage />
                    </ProtectedRoute>
                } />

                <Route path="/journal" element={
                    <ProtectedRoute>
                        <JournalPage />
                    </ProtectedRoute>
                } />

                <Route path="/hobbies" element={
                    <ProtectedRoute>
                        <HobbyIdeasPage />
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;