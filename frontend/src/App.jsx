import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";

// Pages — these are full-page views
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProfilePage from "@/pages/ProfilePage";

// Feature pages — each one is a distinct section of the app (all require login)
import FoodPage from "@/features/food/FoodPage";
import WeatherPage from "@/features/weather/WeatherPage";
import ArtPage from "@/features/art/ArtPage";
import BooksPage from "@/features/books/BooksPage";
import DrinksPage from "@/features/drinks/DrinksPage";
import SpacePage from "@/features/space/SpacePage";
import JournalPage from "@/features/journal/JournalPage";
import PokemonPage from "@/features/pokemon/PokemonPage";

function App() {
    return (
        // AuthProvider wraps the whole app so any component can access login state
        <AuthProvider>
            <Navbar />
            <Routes>
                {/* Public routes — accessible without being logged in */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes — ProtectedRoute redirects to /login if not authenticated */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/food"      element={<ProtectedRoute><FoodPage /></ProtectedRoute>} />
                <Route path="/weather"   element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
                <Route path="/art"       element={<ProtectedRoute><ArtPage /></ProtectedRoute>} />
                <Route path="/books"     element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
                <Route path="/drinks"    element={<ProtectedRoute><DrinksPage /></ProtectedRoute>} />
                <Route path="/space"     element={<ProtectedRoute><SpacePage /></ProtectedRoute>} />
                <Route path="/journal"   element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
                <Route path="/pokemon"   element={<ProtectedRoute><PokemonPage /></ProtectedRoute>} />

                {/* Catch-all — any unknown URL goes back to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;