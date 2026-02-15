import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProfilePage from "@/pages/ProfilePage";

// Features
import FoodPage from "@/features/food/FoodPage";
import WeatherPage from "@/features/weather/WeatherPage";
import ArtPage from "@/features/art/ArtPage";
import BooksPage from "@/features/books/BooksPage";
import DrinksPage from "@/features/drinks/DrinksPage";
import SpacePage from "@/features/space/SpacePage";
import JournalPage from "@/features/journal/JournalPage";
import HobbyIdeasPage from "@/features/hobbies/HobbyIdeasPage";

// Styles
import '@/styles/App.css';

function App() {
    return (
        <AuthProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/food" element={
                    <ProtectedRoute><FoodPage /></ProtectedRoute>
                } />
                <Route path="/weather" element={
                    <ProtectedRoute><WeatherPage /></ProtectedRoute>
                } />
                <Route path="/art" element={
                    <ProtectedRoute><ArtPage /></ProtectedRoute>
                } />
                <Route path="/books" element={
                    <ProtectedRoute><BooksPage /></ProtectedRoute>
                } />
                <Route path="/drinks" element={
                    <ProtectedRoute><DrinksPage /></ProtectedRoute>
                } />
                <Route path="/space" element={
                    <ProtectedRoute><SpacePage /></ProtectedRoute>
                } />
                <Route path="/journal" element={
                    <ProtectedRoute><JournalPage /></ProtectedRoute>
                } />
                <Route path="/hobbies" element={
                    <ProtectedRoute><HobbyIdeasPage /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;