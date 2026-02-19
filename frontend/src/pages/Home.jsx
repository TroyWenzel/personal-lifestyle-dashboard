import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useDashboardStats } from "@/api/queries";
import { isUserBirthday, calculateAge, getBirthdayCountdown } from "@/api/services/userService";
import "@/styles/pages/Home.css";
import "@/styles/Animations.css";

// ─── Simple CSS Confetti ─────────────────────────────────────────────────────

function Confetti() {
    const pieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        color: ['#f97316','#8b5cf6','#ec4899','#10b981','#fbbf24','#3b82f6'][i % 6],
        delay: `${Math.random() * 3}s`,
        duration: `${2.5 + Math.random() * 2}s`,
        size: `${6 + Math.random() * 8}px`,
    }));
    return (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:9999, overflow:'hidden' }}>
            <style>{`
                @keyframes confettiFall {
                    0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
            {pieces.map(p => (
                <div key={p.id} style={{
                    position:'absolute', left: p.left, top:'-20px',
                    width: p.size, height: p.size,
                    background: p.color, borderRadius:'2px',
                    animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
                }} />
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// Home Page
// ═══════════════════════════════════════════════════════════════

function Home() {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const { data: stats = {
        meals: 0,
        journalEntries: 0,
        books: 0,
        drinks: 0,
        spacePhotos: 0,
        locations: 0,
        artworks: 0
    } } = useDashboardStats();
    
    // ─── Get user data for birthday ──────────────────────────
    const userData = user ? {
        birthday: user.birthday,
        username: user.username || user.displayName || user.email?.split('@')[0] || 'Explorer'
    } : null;
    
    const isBirthdayToday = userData?.birthday ? isUserBirthday(userData.birthday) : false;
    const age = userData?.birthday ? calculateAge(userData.birthday) : null;
    const countdown = userData?.birthday ? getBirthdayCountdown(userData.birthday) : null;
    
    const totalSavedItems = 
        (Number(stats?.meals) || 0) + 
        (Number(stats?.locations) || 0) + 
        (Number(stats?.artworks) || 0) + 
        (Number(stats?.books) || 0) + 
        (Number(stats?.drinks) || 0) + 
        (Number(stats?.spacePhotos) || 0);
    
    const activeFeatures = [
        Number(stats?.meals) > 0,
        Number(stats?.locations) > 0,
        Number(stats?.artworks) > 0,
        Number(stats?.books) > 0,
        Number(stats?.drinks) > 0,
        Number(stats?.spacePhotos) > 0,
        Number(stats?.journalEntries) > 0
    ].filter(Boolean).length;

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
            icon: "📓",
            title: "Personal Journal",
            description: "Reflect on your day, track moods, and create lasting memories.",
            path: "/journal",
            color: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
            delay: "0.7s"
        },
        {
            id: 8,
            icon: "⚡",
            title: "Pokémon Fun",
            description: "Beat boredom with pokémon battles and collections.",
            path: "/pokemon",
            color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            delay: "0.8s"
        }
    ];

    const goToRandomFeature = () => {
        const randomIndex = Math.floor(Math.random() * features.length);
        const randomFeature = features[randomIndex];
        navigate(randomFeature.path);
    };

    const displayedFeatures = token ? features : features;

    // ─── Render ───────────────────────────────────────────────

    return (
        <div className="home">
            <div className="background-effects">
                <div className="floating-circle circle-1"></div>
                <div className="floating-circle circle-2"></div>
                <div className="floating-circle circle-3"></div>
                <div className="floating-circle circle-4"></div>
                <div className="floating-circle circle-5"></div>
                <div className="floating-circle circle-6"></div>
            </div>

            {token && isBirthdayToday && <Confetti />}
            {token && isBirthdayToday && (
                <section className="birthday-banner" style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎂</div>
                    <h2 style={{ color: 'var(--text-primary)' }}>
                        Happy Birthday, {userData?.username}! 🎉
                    </h2>
                    {age && (
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            You're turning {age} today!
                        </p>
                    )}
                </section>
            )}

            {token && !isBirthdayToday && countdown && countdown <= 30 && (
                <section className="birthday-countdown" style={{ marginBottom: '2rem' }}>
                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🎂</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                        Your birthday is in {countdown} day{countdown !== 1 ? 's' : ''}!
                        {countdown <= 7 && ' 🎉 So soon!'}
                    </span>
                </section>
            )}

            <section className="hero-section glass-card">
                <div className="hero-content">
                    {token ? (
                        <>
                            <span className="hero-greeting">Welcome back,</span>
                            <h1 className="hero-title">
                                {userData?.username || 'Explorer'}! 👋
                            </h1>
                            <p className="hero-subtitle">
                                Your dashboard awaits with personalized content and saved favorites.
                            </p>
                            <div className="hero-actions">
                                <Link to="/dashboard" className="btn-primary">
                                    Go to Dashboard
                                </Link>
                                <button onClick={goToRandomFeature} className="btn-secondary">
                                    🎲 Explore Random Feature
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="hero-badge">⚡ All-in-One Platform</span>
                            <h1 className="hero-title">
                                Your Digital Life,<br />
                                <span className="gradient-text">Beautifully Organized</span>
                            </h1>
                            <p className="hero-subtitle">
                                Discover recipes, track weather, explore art, read books, mix drinks, 
                                journal thoughts, play pokémon, and explore space - all in one place.
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
                    <div className="floating-icon">⚡</div>
                    <div className="floating-icon">🍽️</div>
                    <div className="floating-icon">⛅</div>
                    <div className="floating-icon">🎨</div>
                    <div className="floating-icon">🍹</div>
                </div>
            </section>

            {token && (
                <section className="stats-section glass-card">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{totalSavedItems}</span>
                            <span className="stat-label">Saved Items</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{activeFeatures}</span>
                            <span className="stat-label">Active Features</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">🔜</span>
                            <span className="stat-label">Days Streak</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{Number(stats?.journalEntries) || 0}</span>
                            <span className="stat-label">Journal Entries</span>
                        </div>
                    </div>
                </section>
            )}

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