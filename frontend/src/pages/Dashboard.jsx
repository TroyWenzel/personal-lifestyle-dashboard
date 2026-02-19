import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useSavedItems, useDashboardStats, useDeleteItem } from "@/api/queries";
import { isUserBirthday, calculateAge, getBirthdayCountdown } from "@/api/services/userService";
import "@/styles/GlassDesignSystem.css";
import "@/styles/pages/Dashboard.css";

// ─── Shared actions ───────────────────────────────────────────────────────────

function CardActions({ onView, onDelete, isDeleting }) {
    return (
        <div className="dash-card-actions">
            <button className="glass-btn glass-btn-sm" onClick={onView}>View</button>
            <button
                className="glass-btn-secondary glass-btn-sm"
                onClick={onDelete}
                disabled={isDeleting}
                style={{ background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.3)" }}
            >
                {isDeleting ? "…" : "🗑️"}
            </button>
        </div>
    );
}

// ─── Type-specific cards ──────────────────────────────────────────────────────

function ArtCard({ item, onDelete, onView, isDeleting }) {
    const [imgFailed, setImgFailed] = useState(false);
    const m = item.metadata || {};
    // Build URL from image_id first, fall back to stored thumbnail
    const imgUrl = m.image_id
        ? `https://www.artic.edu/iiif/2/${m.image_id}/full/400,/0/default.jpg`
        : (m.thumbnail || null);

    return (
        <div className="dash-saved-card">
            <div className="dash-card-img-wrap dash-art-img-wrap">
                {imgUrl && !imgFailed
                    ? <img src={imgUrl} alt={item.title} className="dash-card-img dash-card-img-contain"
                        onError={() => setImgFailed(true)} />
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
                </div>
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

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

function BookCard({ item, onDelete, onView, isDeleting }) {
    const [imgFailed, setImgFailed] = useState(false);
    const m = item.metadata || {};
    const coverUrl = m.coverUrl || (m.coverId ? `https://covers.openlibrary.org/b/id/${m.coverId}-M.jpg` : null);
    return (
        <div className="dash-saved-card dash-saved-card-row">
            {coverUrl && !imgFailed
                ? <img src={coverUrl} alt={item.title} className="dash-book-cover"
                    onError={() => setImgFailed(true)} />
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
                    {m.year                       && <span className="dash-card-tag">📅 {m.year}</span>}
                    {m.pages && m.pages !== "N/A"  && <span className="dash-card-tag">📄 {m.pages}p</span>}
                </div>
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

function DrinkCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    return (
        <div className="dash-saved-card">
            {m.thumbnail && (
                <div className="dash-card-img-wrap dash-art-img-wrap">
                    <img src={m.thumbnail} alt={item.title} className="dash-card-img dash-card-img-contain" />
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

function SpaceCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    const imgUrl = m.url || m.hdurl;
    return (
        <div className="dash-saved-card">
            {imgUrl && m.media_type !== "video"
                ? <div className="dash-card-img-wrap">
                    <img src={imgUrl} alt={item.title} className="dash-card-img dash-card-img-cover" />
                    <div className="dash-card-img-overlay" />
                </div>
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

function WeatherCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    const iconUrl = m.icon
        ? (m.icon.startsWith("http") ? m.icon : `https://openweathermap.org/img/wn/${m.icon}@2x.png`)
        : null;
    return (
        <div className="dash-saved-card dash-saved-card-row">
            <div className="dash-weather-icon">
                {iconUrl
                    ? <img src={iconUrl} alt="weather" style={{ width: 56, height: 56 }} />
                    : <span style={{ fontSize: "2.5rem" }}>⛅</span>
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

function JournalCard({ item, onDelete, onView, isDeleting }) {
    const m = item.metadata || {};
    const moodEmoji = { happy:"😊", sad:"😢", neutral:"😐", excited:"🤩", anxious:"😰", calm:"😌", grateful:"🙏" };
    return (
        <div className="dash-saved-card dash-saved-card-row dash-saved-card-journal">
            <div className="dash-journal-mood">{moodEmoji[m.mood] || "📓"}</div>
            <div className="dash-card-body">
                <div className="dash-card-type-row">
                    <span className="dash-card-emoji">📓</span>
                    <span className="dash-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="dash-card-title">{item.title}</h3>
                {item.description && (
                    <p className="dash-card-excerpt">{item.description.replace(/…$|\.\.\.$/,"").substring(0, 90)}…</p>
                )}
                {m.mood && <div className="dash-card-tags"><span className="dash-card-tag">Mood: {m.mood}</span></div>}
                <CardActions onView={onView} onDelete={onDelete} isDeleting={isDeleting} />
            </div>
        </div>
    );
}

// ─── Type router ──────────────────────────────────────────────────────────────

const TYPE_ROUTES = {
    meal: "/food", location: "/weather", artwork: "/art",
    book: "/books", drink: "/drinks",
    space: "/space", spacePhoto: "/space",
    journal: "/journal",
};

function SavedItemCard({ item, onDelete, onView, isDeleting }) {
    const route  = TYPE_ROUTES[item.type] || "/dashboard";
    const shared = {
        item,
        onDelete: () => onDelete(item.id),
        onView:   () => onView(route, item),
        isDeleting,
    };
    switch (item.type) {
        case "meal":                      return <MealCard    {...shared} />;
        case "artwork":                   return <ArtCard     {...shared} />;
        case "book":                      return <BookCard    {...shared} />;
        case "drink":                     return <DrinkCard   {...shared} />;
        case "space": case "spacePhoto":  return <SpaceCard   {...shared} />;
        case "location":                  return <WeatherCard {...shared} />;
        case "journal":                   return <JournalCard {...shared} />;
        default: return (
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function BirthdayConfetti() {
    const items = [
        { emoji: "🎈", left: "5%",  delay: "0s",   dur: "3s"   },
        { emoji: "🎉", left: "15%", delay: "0.3s", dur: "3.5s" },
        { emoji: "🎈", left: "25%", delay: "0.6s", dur: "4s"   },
        { emoji: "⭐",     left: "35%", delay: "0.2s", dur: "3.2s" },
        { emoji: "🎊", left: "50%", delay: "0.5s", dur: "3.8s" },
        { emoji: "🎈", left: "60%", delay: "0.1s", dur: "3.3s" },
        { emoji: "🎉", left: "72%", delay: "0.7s", dur: "4.2s" },
        { emoji: "🎈", left: "83%", delay: "0.4s", dur: "3.6s" },
        { emoji: "🎊", left: "92%", delay: "0.8s", dur: "3.1s" },
    ];
    return (
        <div style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%",
                       pointerEvents:"none", zIndex:9999, overflow:"hidden" }}>
            {items.map((item, i) => (
                <div key={i} style={{
                    position: "absolute", left: item.left, top: "-60px",
                    fontSize: "2rem",
                    animation: `birthdayFall ${item.dur} ${item.delay} ease-in infinite`,
                }}>
                    {item.emoji}
                </div>
            ))}
        </div>
    );
}

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
        if (!user) return { birthday: null, isBirthdayToday: false, countdown: null, displayName: "User" };
        let userData = null;
        if (user.uid) {
            const s = localStorage.getItem(`user_${user.uid}`);
            userData = s ? JSON.parse(s) : null;
        }
        if (!userData) {
            const s = localStorage.getItem("user");
            userData = s ? JSON.parse(s) : null;
        }
        const birthday    = userData?.birthday || null;
        const displayName = userData?.username || userData?.displayName
            || user.username || user.displayName
            || user.email?.split("@")[0] || "User";
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

    // Navigate to feature page, passing tab:'saved' so it opens on the saved section
    const handleView = (route, item) => {
        navigate(route, { state: { savedItem: item, tab: "saved" } });
    };

    // Stat card click → go straight to saved tab of that feature
    const goToSaved = (path) => {
        navigate(path, { state: { tab: "saved" } });
    };

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

    // Stat cards — clicking goes to the saved section of each page
    const STAT_CARDS = [
        { icon:"🍽️", val: stats.meals,           label:"Saved Meals",      sub:"Food",     path:"/food"    },
        { icon:"⛅",  val: stats.locations,       label:"Saved Locations",  sub:"Weather",  path:"/weather" },
        { icon:"🎨", val: stats.artworks,         label:"Saved Artworks",   sub:"Art",      path:"/art"     },
        { icon:"📚", val: stats.books,            label:"Saved Books",      sub:"Books",    path:"/books"   },
        { icon:"🍸", val: stats.drinks,           label:"Saved Drinks",     sub:"Drinks",   path:"/drinks"  },
        { icon:"⚡", val:"GO!",                   label:"Pokémon Hub",      sub:"Play",     path:"/pokemon" },
        { icon:"🚀", val: stats.spacePhotos,      label:"Space Photos",     sub:"NASA",     path:"/space"   },
        { icon:"📓", val: stats.journalEntries,   label:"Journal Entries",  sub:"Journal",  path:"/journal" },
    ];

    return (
        <div className="glass-page" style={{ background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
            <div className="glass-container">

                {/* ── Birthday banner ── */}
                {birthdayData.isBirthdayToday && (
                    <>
                    <BirthdayConfetti />
                    <div style={{
                        background:"linear-gradient(135deg,rgba(255,107,107,0.2),rgba(255,142,83,0.2))",
                        border:"2px solid rgba(255,107,107,0.3)",
                        borderRadius:"var(--radius-lg)",
                        padding:"2rem", marginBottom:"2rem", textAlign:"center",
                    }}>
                        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🎂</div>
                        <h2 style={{ color:"var(--text-primary)", marginBottom:"0.5rem" }}>
                            Happy Birthday, {birthdayData.displayName}! 🎉
                        </h2>
                        <p style={{ color:"var(--text-secondary)" }}>We hope you have an amazing day!</p>
                        {birthdayData.birthday && calculateAge(birthdayData.birthday) && (
                            <p style={{ color:"var(--text-tertiary)", marginTop:"0.5rem" }}>
                                You're turning {calculateAge(birthdayData.birthday)} today!
                            </p>
                        )}
                    </div>
                    </>
                )}

                {/* ── Birthday countdown ── */}
                {!birthdayData.isBirthdayToday && birthdayData.countdown && birthdayData.countdown <= 30 && (
                    <div style={{
                        background:"rgba(255,255,255,0.05)",
                        border:"1px solid rgba(255,255,255,0.1)",
                        borderRadius:"var(--radius-md)",
                        padding:"1rem", marginBottom:"2rem", textAlign:"center",
                    }}>
                        <span style={{ fontSize:"1.5rem", marginRight:"0.5rem" }}>🎂</span>
                        <span style={{ color:"var(--text-primary)" }}>
                            Your birthday is in {birthdayData.countdown} day{birthdayData.countdown !== 1 ? "s" : ""}!
                            {birthdayData.countdown <= 7 && " 🎉 So soon!"}
                        </span>
                    </div>
                )}

                {/* ── Welcome header ── */}
                <div className="glass-page-header">
                    <h2>Welcome, {birthdayData.displayName}! 👋</h2>
                    <p className="subtitle">Here's everything you've saved across LifeHub</p>
                </div>

                {/* ══════════════════════════════════════════════
                    SECTION 1 — Recently Saved Items (TOP)
                ══════════════════════════════════════════════ */}
                <div style={{ marginBottom:"3rem" }}>
                    <h2 className="dash-section-title">📊 Your Collection</h2>
                    <p style={{ color:"var(--text-secondary)", marginBottom:"1.25rem", marginTop:"-0.75rem", fontSize:"0.9rem" }}>
                        Click any card to jump to your saved items in that section
                    </p>
                    <div className="dash-stat-grid">
                        {STAT_CARDS.map(s => (
                            <div key={s.path} className="dash-stat-card" onClick={() => goToSaved(s.path)}>
                                <span className="dash-stat-icon">{s.icon}</span>
                                <span className="dash-stat-count">{s.val}</span>
                                <span className="dash-stat-label">{s.label}</span>
                                <span className="dash-stat-hint">→ {s.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    SECTION 2 — Explore / Stats (merged nav)
                ══════════════════════════════════════════════ */}
                <div style={{ marginBottom:"3rem" }}>
                    <h2 className="dash-section-title">🕐 Recently Saved</h2>

                    {savedItems.length === 0 ? (
                        <div className="glass-empty-state">
                            <span className="glass-empty-icon">📦</span>
                            <h3>Nothing saved yet</h3>
                            <p>Explore any section below to start building your collection!</p>
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


            </div>
        </div>
    );
}

export default Dashboard;