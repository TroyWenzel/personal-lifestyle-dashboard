import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useSavedItems, useDashboardStats, useDeleteItem } from "@/api/queries";
import { isUserBirthday, calculateAge, getBirthdayCountdown } from "@/api/services/userService";
import "@/styles/GlassDesignSystem.css";
import "@/styles/pages/Dashboard.css";

// ─── Shared card action buttons ───────────────────────────────────────────────

function CardActions({ onView, onDelete, isDeleting }) {
    return (
        <div className="dash-card-actions">
            <button className="glass-btn glass-btn-sm" onClick={onView}>View</button>
            <button
                className="glass-btn-secondary glass-btn-sm"
                onClick={onDelete}
                disabled={isDeleting}
                style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }}
            >
                {isDeleting ? '…' : '🗑️'}
            </button>
        </div>
    );
}

// ─── Meal card ────────────────────────────────────────────────────────────────

function MealCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    return (
        <div className="dash-saved-card">
            {m.thumbnail && (
                <div className="dash-card-img-wrap">
                    <img src={m.thumbnail} alt={item.title} className="dash-card-img dash-card-img-cover" />
                    <div className="dash-card-img-overlay" />
                </div>
            )}
            <div className="dash-card-body">
                <div className="dash-card-type-row">
                    <span className="dash-card-emoji">🍽️</span>
                    <span className="dash-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="dash-card-title">{item.title}</h3>
                <div className="dash-card-tags">
                    {m.category && <span className="dash-card-tag">{m.category}</span>}
                    {m.area     && <span className="dash-card-tag">{m.area}</span>}
                </div>
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

// ─── Art card ─────────────────────────────────────────────────────────────────

function ArtCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    // Reconstruct image URL from image_id if direct thumbnail is absent
    const imgUrl = m.thumbnail
        || (m.image_id
            ? `https://www.artic.edu/iiif/2/${m.image_id}/full/400,/0/default.jpg`
            : null);
    return (
        <div className="dash-saved-card">
            <div className="dash-card-img-wrap dash-card-img-wrap-art">
                {imgUrl
                    ? <img src={imgUrl} alt={item.title} className="dash-card-img dash-card-img-contain"
                        onError={e => { e.target.parentElement.innerHTML = '<div class="dash-card-img-placeholder">🎨</div>'; }} />
                    : <div className="dash-card-img-placeholder">🎨</div>
                }
            </div>
            <div className="dash-card-body">
                <div className="dash-card-type-row">
                    <span className="dash-card-emoji">🎨</span>
                    <span className="dash-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="dash-card-title">{item.title}</h3>
                {m.artist && <p className="dash-card-subtitle">by {m.artist}</p>}
                <div className="dash-card-tags">
                    {m.date       && <span className="dash-card-tag">{m.date}</span>}
                    {m.department && <span className="dash-card-tag">{m.department}</span>}
                    {m.medium     && <span className="dash-card-tag" style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.medium}</span>}
                </div>
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

// ─── Book card (horizontal layout with cover spine) ───────────────────────────

function BookCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    const coverUrl = m.coverUrl
        || (m.coverId ? `https://covers.openlibrary.org/b/id/${m.coverId}-M.jpg` : null);
    return (
        <div className="dash-saved-card dash-saved-card-row">
            {coverUrl
                ? <img src={coverUrl} alt={item.title} className="dash-book-cover"
                    onError={e => { e.target.replaceWith(Object.assign(document.createElement('div'), { className: 'dash-book-cover-placeholder', textContent: '📚' })); }} />
                : <div className="dash-book-cover-placeholder">📚</div>
            }
            <div className="dash-card-body">
                <div className="dash-card-type-row">
                    <span className="dash-card-emoji">📚</span>
                    <span className="dash-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="dash-card-title">{item.title}</h3>
                {m.author && <p className="dash-card-subtitle">by {m.author}</p>}
                <div className="dash-card-tags">
                    {m.year                      && <span className="dash-card-tag">📅 {m.year}</span>}
                    {m.pages && m.pages !== 'N/A' && <span className="dash-card-tag">📄 {m.pages}p</span>}
                </div>
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

// ─── Drink card ───────────────────────────────────────────────────────────────

function DrinkCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    return (
        <div className="dash-saved-card">
            {m.thumbnail && (
                <div className="dash-card-img-wrap">
                    <img src={m.thumbnail} alt={item.title} className="dash-card-img dash-card-img-cover" />
                    <div className="dash-card-img-overlay" />
                </div>
            )}
            <div className="dash-card-body">
                <div className="dash-card-type-row">
                    <span className="dash-card-emoji">🍸</span>
                    <span className="dash-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="dash-card-title">{item.title}</h3>
                <div className="dash-card-tags">
                    {m.category  && <span className="dash-card-tag">{m.category}</span>}
                    {m.alcoholic && <span className="dash-card-tag">{m.alcoholic}</span>}
                    {m.glass     && <span className="dash-card-tag">🥃 {m.glass}</span>}
                </div>
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

// ─── Space card ───────────────────────────────────────────────────────────────

function SpaceCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    const imgUrl = m.url || m.hdurl;
    return (
        <div className="dash-saved-card">
            {imgUrl && m.media_type !== 'video'
                ? (
                    <div className="dash-card-img-wrap">
                        <img src={imgUrl} alt={item.title} className="dash-card-img dash-card-img-cover" />
                        <div className="dash-card-img-overlay" />
                    </div>
                )
                : <div className="dash-card-img-placeholder">🚀</div>
            }
            <div className="dash-card-body">
                <div className="dash-card-type-row">
                    <span className="dash-card-emoji">🚀</span>
                    <span className="dash-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="dash-card-title">{item.title}</h3>
                {m.date && <p className="dash-card-subtitle">NASA APOD · {m.date}</p>}
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

// ─── Weather card ─────────────────────────────────────────────────────────────

function WeatherCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    const iconUrl = m.icon
        ? (m.icon.startsWith('http') ? m.icon : `https://openweathermap.org/img/wn/${m.icon}@2x.png`)
        : null;
    return (
        <div className="dash-saved-card dash-saved-card-row">
            <div className="dash-weather-icon">
                {iconUrl
                    ? <img src={iconUrl} alt="weather" style={{ width: 64, height: 64 }} />
                    : <span style={{ fontSize: '3rem' }}>⛅</span>
                }
            </div>
            <div className="dash-card-body">
                <div className="dash-card-type-row">
                    <span className="dash-card-emoji">⛅</span>
                    <span className="dash-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="dash-card-title">{item.title}</h3>
                {m.description && <p className="dash-card-subtitle">{m.description}</p>}
                <div className="dash-card-tags">
                    {m.temperature != null && <span className="dash-card-tag">🌡️ {Math.round(m.temperature)}°</span>}
                    {m.humidity    != null && <span className="dash-card-tag">💧 {m.humidity}%</span>}
                </div>
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

// ─── Journal card ─────────────────────────────────────────────────────────────

function JournalCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    const moodEmoji = { happy: '😊', sad: '😢', neutral: '😐', excited: '🤩', anxious: '😰', calm: '😌' };
    return (
        <div className="dash-saved-card dash-saved-card-row dash-saved-card-journal">
            <div className="dash-journal-mood">{moodEmoji[m.mood] || '📓'}</div>
            <div className="dash-card-body">
                <div className="dash-card-type-row">
                    <span className="dash-card-emoji">📓</span>
                    <span className="dash-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="dash-card-title">{item.title}</h3>
                {item.description && (
                    <p className="dash-card-excerpt">{item.description.replace(/…$|\.\.\.$/,'').substring(0,100)}…</p>
                )}
                {m.mood && <div className="dash-card-tags"><span className="dash-card-tag">Mood: {m.mood}</span></div>}
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

// ─── Router — picks the right card per item type ──────────────────────────────

const TYPE_ROUTES = {
    meal: '/food', location: '/weather', artwork: '/art',
    book: '/books', drink: '/drinks',
    space: '/space', spacePhoto: '/space',
    journal: '/journal',
};

function SavedItemCard({ item, onDelete, onView, isDeleting }) {
    const route  = TYPE_ROUTES[item.type] || '/dashboard';
    const shared = {
        item,
        onDelete: () => onDelete(item.id),
        onView:   () => onView(route, item),
        isDeleting,
    };
    switch (item.type) {
        case 'meal':                    return <MealCard    {...shared} />;
        case 'artwork':                 return <ArtCard     {...shared} />;
        case 'book':                    return <BookCard    {...shared} />;
        case 'drink':                   return <DrinkCard   {...shared} />;
        case 'space': case 'spacePhoto':return <SpaceCard   {...shared} />;
        case 'location':                return <WeatherCard {...shared} />;
        case 'journal':                 return <JournalCard {...shared} />;
        default:                        return (
            <div className="dash-saved-card">
                <div className="dash-card-img-placeholder">📌</div>
                <div className="dash-card-body">
                    <h3 className="dash-card-title">{item.title}</h3>
                    <CardActions {...shared} />
                </div>
            </div>
        );
    }
}

// ─── Main Dashboard component ─────────────────────────────────────────────────

function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const { data: savedItems = [], isLoading: itemsLoading } = useSavedItems();
    const { data: stats = {
        meals: 0, journalEntries: 0, books: 0,
        drinks: 0, spacePhotos: 0, locations: 0, artworks: 0,
    }, isLoading: statsLoading } = useDashboardStats();
    const deleteItemMutation = useDeleteItem();

    const loading = itemsLoading || statsLoading;

    const birthdayData = useMemo(() => {
        if (!user) return { birthday: null, isBirthdayToday: false, countdown: null, displayName: 'User' };

        let userData = null;
        if (user.uid) {
            const s = localStorage.getItem(`user_${user.uid}`);
            userData = s ? JSON.parse(s) : null;
        }
        if (!userData) {
            const s = localStorage.getItem('user');
            userData = s ? JSON.parse(s) : null;
        }

        const birthday    = userData?.birthday || null;
        const displayName = userData?.username || userData?.displayName
            || user.username || user.displayName
            || user.email?.split('@')[0] || 'User';

        return {
            birthday,
            isBirthdayToday: isUserBirthday(birthday),
            countdown:       getBirthdayCountdown(birthday),
            displayName,
        };
    }, [user]);

    const handleLogout = () => { logout(); navigate("/login"); };
    const handleDelete = (id) => {
        deleteItemMutation.mutate(id, {
            onSuccess: () => alert("Item deleted successfully!"),
            onError:   () => alert("Failed to delete item. Please try again."),
        });
    };
    const handleView = (route, item) => navigate(route, { state: { savedItem: item } });

    if (loading) {
        return (
            <div className="glass-page">
                <div className="glass-loading">
                    <div className="glass-spinner" />
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const STAT_CARDS = [
        { icon: '🍽️', val: stats.meals,          label: 'Saved Meals',     path: '/food'    },
        { icon: '⛅',  val: stats.locations,      label: 'Saved Locations', path: '/weather' },
        { icon: '🎨', val: stats.artworks,        label: 'Saved Artworks',  path: '/art'     },
        { icon: '📚', val: stats.books,           label: 'Saved Books',     path: '/books'   },
        { icon: '🍸', val: stats.drinks,          label: 'Saved Drinks',    path: '/drinks'  },
        { icon: '⚡', val: 'GO!',                 label: 'Pokémon Hub',     path: '/pokemon' },
        { icon: '🚀', val: stats.spacePhotos,     label: 'Space Photos',    path: '/space'   },
        { icon: '📓', val: stats.journalEntries,  label: 'Journal Entries', path: '/journal' },
    ];

    const QUICK_ACTIONS = [
        ['🍽️ Find Recipes',  '/food'],
        ['⛅ Check Weather', '/weather'],
        ['🎨 Explore Art',   '/art'],
        ['📚 Search Books',  '/books'],
        ['🍸 Find Drinks',   '/drinks'],
        ['⚡ Pokémon Hub',   '/pokemon'],
        ['🚀 View Space',    '/space'],
        ['📓 Write Journal', '/journal'],
        ['👤 Edit Profile',  '/profile'],
    ];

    return (
        <div className="glass-page" style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)' }}>
            <div className="glass-container">

                {/* Birthday Banner */}
                {birthdayData.isBirthdayToday && (
                    <div style={{
                        background: 'linear-gradient(135deg,rgba(255,107,107,0.2),rgba(255,142,83,0.2))',
                        border: '2px solid rgba(255,107,107,0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '2rem', marginBottom: '2rem', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎂</div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Happy Birthday, {birthdayData.displayName}! 🎉
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>We hope you have an amazing day!</p>
                        {birthdayData.birthday && calculateAge(birthdayData.birthday) && (
                            <p style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                You're turning {calculateAge(birthdayData.birthday)} today!
                            </p>
                        )}
                    </div>
                )}

                {/* Birthday Countdown */}
                {!birthdayData.isBirthdayToday && birthdayData.countdown && birthdayData.countdown <= 30 && (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem', marginBottom: '2rem', textAlign: 'center',
                    }}>
                        <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🎂</span>
                        <span style={{ color: 'var(--text-primary)' }}>
                            Your birthday is in {birthdayData.countdown} day{birthdayData.countdown !== 1 ? 's' : ''}!
                            {birthdayData.countdown <= 7 && ' 🎉 So soon!'}
                        </span>
                    </div>
                )}

                {/* Welcome Header */}
                <div className="glass-page-header">
                    <h2>Welcome, {birthdayData.displayName}! 👋</h2>
                    <p className="subtitle">Here's an overview of your personal collection</p>
                </div>

                {/* Stats Grid */}
                <div className="glass-grid" style={{ marginBottom: '3rem' }}>
                    {STAT_CARDS.map(s => (
                        <div key={s.path} className="glass-card" onClick={() => navigate(s.path)} style={{ cursor: 'pointer' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{s.icon}</div>
                            <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{s.val}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {QUICK_ACTIONS.map(([label, path]) => (
                            <button key={path} className="glass-btn" onClick={() => navigate(path)}>{label}</button>
                        ))}
                    </div>
                </div>

                {/* Recently Saved Items */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ color: 'var(--text-primary)' }}>Recently Saved Items</h2>
                        <button className="glass-btn" onClick={() => navigate('/food')}>Explore More</button>
                    </div>

                    {savedItems.length === 0 ? (
                        <div className="glass-empty-state">
                            <span className="glass-empty-icon">📦</span>
                            <h3>No saved items yet</h3>
                            <p>Start exploring to save items!</p>
                            <button className="glass-btn" onClick={() => navigate('/food')}>Start Exploring</button>
                        </div>
                    ) : (
                        <div className="dash-saved-grid">
                            {savedItems.slice(0, 6).map(item => (
                                <SavedItemCard
                                    key={item.id}
                                    item={item}
                                    onDelete={handleDelete}
                                    onView={handleView}
                                    isDeleting={deleteItemMutation.isLoading}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Logout */}
                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button
                        className="glass-btn-secondary"
                        onClick={handleLogout}
                        style={{ background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.3)' }}
                    >
                        Logout
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;