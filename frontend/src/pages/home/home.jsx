import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Welcome to LifeHub</h1>
                <p className="tagline">Your Personal Lifestyle Dashboard</p>
                <p className="description">
                    Manage recipes, track weather, explore art, and organize your daily life—all in one place.
                </p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">🍽️</div>
                    <h3>Food & Recipes</h3>
                    <p>Search thousands of recipes, save your favorites, and add personal cooking notes.</p>
                    <Link to="/food" className="feature-link">Explore Recipes →</Link>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">⛅</div>
                    <h3>Weather Tracking</h3>
                    <p>Check weather for your favorite locations and plan activities with personalized notes.</p>
                    <Link to="/weather" className="feature-link">Check Weather →</Link>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🎨</div>
                    <h3>Art Discovery</h3>
                    <p>Browse museum collections, save inspiring artworks, and build your personal gallery.</p>
                    <Link to="/weather" className="feature-link">Browse Art →</Link>
                </div>
            </div>

            <div className="cta-section">
                <h2>Start Organizing Your Life</h2>
                <p>Create an account to save your favorites across all categories</p>
                <div className="cta-buttons">
                    <Link to="/login" className="btn btn-primary">Login</Link>
                    <Link to="/register" className="btn btn-secondary">Register</Link>
                </div>
            </div>
        </div>
    );
}

export default Home;