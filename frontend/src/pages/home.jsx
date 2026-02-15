import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "@/styles/pages/Home.css";
import "@/styles/Animations.css";

function Home() {
    const { token, user } = useContext(AuthContext);

    // Feature cards data
    const features = [
        {
            id: 1,
            icon: "🍽️",
            title: "Food & Recipes",
            description: "Discover thousands of recipes from around the world. Save your favorites and add personal cooking notes.",
            path: "/food",
            color: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)",
            delay: "0.1s"
        },
        {
            id: 2,
            icon: "⛅",
            title: "Weather Tracker",
            description: "Real-time weather updates for any location. Plan your activities with confidence.",
            path: "/weather",
            color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            delay: "0.2s"
        },
        {
            id: 3,
            icon: "🎨",
            title: "Art Discovery",
            description: "Explore masterpieces from world-class museums. Build your personal digital gallery.",
            path: "/art",
            color: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
            delay: "0.3s"
        },
        {
            id: 4,
            icon: "📚",
            title: "Book Discovery",
            description: "Browse millions of books, create reading lists, and track your literary journey.",
            path: "/books",
            color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            delay: "0.4s"
        },
        {
            id: 5,
            icon: "🍹",
            title: "Cocktail Explorer",
            description: "Mix the perfect drink with thousands of cocktail recipes from around the globe.",
            path: "/drinks",
            color: "linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)",
            delay: "0.5s"
        },
        {
            id: 6,
            icon: "🚀",
            title: "Space Discovery",
            description: "Journey through the cosmos with NASA's daily astronomy pictures.",
            path: "/space",
            color: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
            delay: "0.6s"
        },
        {
            id: 7,
            icon: "📔",
            title: "Personal Journal",
            description: "Reflect on your day, track moods, and create lasting memories.",
            path: "/journal",
            color: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
            delay: "0.7s"
        },
        {
            id: 8,
            icon: "✨",
            title: "Activity Ideas",
            description: "Beat boredom with personalized activity suggestions for any occasion.",
            path: "/hobbies",
            color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            delay: "0.8s"
        }
    ];

    // Show only first 3 features for non-authenticated users? 
    // Or show all? Let's show all for now, but can adjust
    const displayedFeatures = token ? features : features;

    return (
        <div className="home">
            {/* Animated Background */}
            <div className="background-effects">
                <div className="floating-circle circle-1"></div>
                <div className="floating-circle circle-2"></div>
                <div className="floating-circle circle-3"></div>
                <div className="floating-circle circle-4"></div>
            </div>

            {/* Hero Section - Changes based on auth state */}
            <section className="hero-section glass-card">
                <div className="hero-content">
                    {token ? (
                        // Authenticated Hero
                        <>
                            <span className="hero-greeting">Welcome back,</span>
                            <h1 className="hero-title">
                                {user?.username || 'Explorer'}! 👋
                            </h1>
                            <p className="hero-subtitle">
                                Your dashboard awaits with personalized content and saved favorites.
                            </p>
                            <div className="hero-actions">
                                <Link to="/dashboard" className="btn-primary">
                                    Go to Dashboard
                                </Link>
                                <Link to="/food" className="btn-secondary">
                                    Explore Features
                                </Link>
                            </div>
                        </>
                    ) : (
                        // Guest Hero
                        <>
                            <span className="hero-badge">✨ All-in-One Platform</span>
                            <h1 className="hero-title">
                                Your Digital Life,<br />
                                <span className="gradient-text">Beautifully Organized</span>
                            </h1>
                            <p className="hero-subtitle">
                                Discover recipes, track weather, explore art, read books, mix drinks, 
                                journal thoughts, find activities, and explore space — all in one place.
                            </p>
                            <div className="hero-actions">
                                <Link to="/register" className="btn-primary">
                                    Get Started Free
                                </Link>
                                <Link to="/login" className="btn-secondary">
                                    Sign In
                                </Link>
                            </div>
                        </>
                    )}
                </div>
                <div className="hero-visual">
                    <div className="floating-icon">✨</div>
                    <div className="floating-icon">🍽️</div>
                    <div className="floating-icon">⛅</div>
                    <div className="floating-icon">🎨</div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <div className="section-header">
                    <h2>
                        {token ? 'Continue Your Journey' : 'Everything You Need'}
                    </h2>
                    <p className="section-subtitle">
                        {token 
                            ? 'Pick up where you left off or explore something new'
                            : 'Discover powerful tools to enhance your daily life'
                        }
                    </p>
                </div>

                <div className="features-grid">
                    {displayedFeatures.map((feature) => (
                        <Link 
                            to={feature.path} 
                            key={feature.id}
                            className="feature-card-link"
                            style={{ '--card-delay': feature.delay }}
                        >
                            <div 
                                className="feature-card glass-card"
                                style={{ '--card-gradient': feature.color }}
                            >
                                <div className="card-glow"></div>
                                <div className="card-icon-wrapper">
                                    <span className="card-icon">{feature.icon}</span>
                                </div>
                                <h3 className="card-title">{feature.title}</h3>
                                <p className="card-description">{feature.description}</p>
                                <div className="card-footer">
                                    <span className="card-link">
                                        Explore {feature.title.split(' ')[0]} →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Stats Section - Only for authenticated users */}
            {token && (
                <section className="stats-section glass-card">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">24</span>
                            <span className="stat-label">Saved Items</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">8</span>
                            <span className="stat-label">Active Features</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">3</span>
                            <span className="stat-label">Days Streak</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">12</span>
                            <span className="stat-label">Journal Entries</span>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section - Only for guests */}
            {!token && (
                <section className="cta-section glass-card">
                    <div className="cta-content">
                        <h2>Ready to organize your digital life?</h2>
                        <p>Join thousands of users who've already simplified their daily routines.</p>
                        <div className="cta-buttons">
                            <Link to="/register" className="btn-primary btn-large">
                                Create Free Account
                            </Link>
                            <Link to="/login" className="btn-secondary btn-large">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Home;