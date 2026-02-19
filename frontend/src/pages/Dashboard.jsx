import { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useSavedItems, useDashboardStats, useDeleteItem } from "@/api/queries";
import { getCurrentWeather } from "@/api/services/weatherService";
import "@/styles/GlassDesignSystem.css";
import "@/styles/pages/Dashboard.css";
import { loadList, addItem as slAdd, removeItem as slRemove, toggleItem as slToggle, clearChecked as slClear } from "@/api/services/shoppingListService";
import { useToast, ToastContainer } from '@/components/ui/Toast';

// ─── Weather Widget Component ────────────────────────────────────────────────

function WeatherWidget() {
    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('');
    const [unit, setUnit] = useState(() => {
        return localStorage.getItem('tempUnit') || 'C';
    });

    // ─── Save unit preference ─────────────────────────────────
    useEffect(() => {
        localStorage.setItem('tempUnit', unit);
    }, [unit]);

    const toggleUnit = (e) => {
        e.stopPropagation();
        setUnit(prev => prev === 'C' ? 'F' : 'C');
    };

    const toFahrenheit = (celsius) => {
        return Math.round((celsius * 9/5) + 32);
    };

    const displayTemp = (celsius) => {
        if (unit === 'F') {
            return `${toFahrenheit(celsius)}°F`;
        }
        return `${Math.round(celsius)}°C`;
    };

    // ─── Fetch weather data ──────────────────────────────────
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            await fetchDirectWeather(latitude, longitude, 'Current Location');
                        },
                        (error) => {
                            console.log('GPS error:', error);
                            loadDefaultCity();
                        }
                    );
                } else {
                    loadDefaultCity();
                }
            } catch (error) {
                console.error('Weather widget error:', error);
                useMockData();
            }
        };

        const fetchDirectWeather = async (lat, lon, locName) => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&windspeed_unit=kmh`
                );
                
                if (!response.ok) throw new Error('Weather fetch failed');
                
                const data = await response.json();
                
                setWeather({
                    current: {
                        temperature: data.current_weather.temperature,
                        weather_descriptions: [getWeatherDescription(data.current_weather.weathercode)],
                        humidity: 65,
                        wind_speed: data.current_weather.windspeed,
                    }
                });
                setLocation(locName);
                setLoading(false);
            } catch (error) {
                console.error('Direct weather fetch failed:', error);
                loadDefaultCity();
            }
        };

        const loadDefaultCity = async () => {
            try {
                const defaultCity = localStorage.getItem('defaultWeatherCity') || 'Chicago';
                const geoResponse = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(defaultCity)}&count=1`
                );
                const geoData = await geoResponse.json();
                
                if (geoData.results && geoData.results.length > 0) {
                    const { latitude, longitude } = geoData.results[0];
                    await fetchDirectWeather(latitude, longitude, defaultCity);
                } else {
                    useMockData();
                }
            } catch (error) {
                console.error('Default city failed:', error);
                useMockData();
            }
        };

        const useMockData = () => {
            setWeather({
                current: {
                    temperature: 22,
                    weather_descriptions: ['Partly cloudy'],
                    humidity: 60,
                    wind_speed: 12,
                }
            });
            setLocation('Sample City');
            setLoading(false);
        };

        const getWeatherDescription = (code) => {
            const weatherCodes = {
                0: 'Clear sky',
                1: 'Mainly clear',
                2: 'Partly cloudy',
                3: 'Overcast',
                45: 'Fog',
                48: 'Rime fog',
                51: 'Light drizzle',
                53: 'Moderate drizzle',
                55: 'Dense drizzle',
                61: 'Slight rain',
                63: 'Moderate rain',
                65: 'Heavy rain',
                71: 'Slight snow',
                73: 'Moderate snow',
                75: 'Heavy snow',
                77: 'Snow grains',
                80: 'Slight rain showers',
                81: 'Moderate rain showers',
                82: 'Violent rain showers',
                85: 'Slight snow showers',
                86: 'Heavy snow showers',
                95: 'Thunderstorm',
                96: 'Thunderstorm with slight hail',
                99: 'Thunderstorm with heavy hail',
            };
            return weatherCodes[code] || 'Unknown';
        };

        fetchWeather();
    }, []);

    if (loading) {
        return (
            <div className="weather-widget loading">
                <div className="weather-widget-loader"></div>
            </div>
        );
    }

    if (!weather?.current) return null;

    const getWeatherEmoji = (desc) => {
        const d = desc?.toLowerCase() || '';
        if (d.includes('sun') || d.includes('clear')) return '☀️';
        if (d.includes('cloud')) return '☁️';
        if (d.includes('rain') || d.includes('drizzle')) return '🌧️';
        if (d.includes('snow')) return '❄️';
        if (d.includes('storm') || d.includes('thunder')) return '⛈️';
        if (d.includes('fog')) return '🌫️';
        return '⛅';
    };

    const condition = weather.current.weather_descriptions?.[0] || 'Clear';
    const celsiusTemp = weather.current.temperature;

    return (
        <div 
            className="weather-widget" 
            onClick={() => navigate('/weather')}
            style={{ cursor: 'pointer' }}
        >
            <div className="weather-widget-icon">
                {getWeatherEmoji(condition)}
            </div>
            <div className="weather-widget-info">
                <div className="weather-widget-location">{location}</div>
                <div className="weather-widget-temp-container">
                    <span className="weather-widget-temp">
                        {displayTemp(celsiusTemp)}
                    </span>
                    <button 
                        className={`weather-unit-toggle ${unit === 'F' ? 'active' : ''}`}
                        onClick={toggleUnit}
                        title="Toggle °C/°F"
                    >
                        °{unit}
                    </button>
                </div>
                <div className="weather-widget-condition">{condition}</div>
            </div>
            <div className="weather-widget-details">
                <span>💧 {weather.current.humidity || 60}%</span>
                <span>💨 {Math.round(weather.current.wind_speed)} km/h</span>
            </div>
        </div>
    );
}

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

// ─── Shopping List ────────────────────────────────────────────────────────────

function ShoppingList() {
    const [list, setList] = useState({ food: [], drinks: [] });
    const [newItem, setNewItem] = useState('');
    const [section, setSection] = useState('food');
    const [added, setAdded] = useState(null);
    const [loading, setLoading] = useState(true);

    // ─── Load from DB on mount ───────────────────────────────
    useEffect(() => {
        loadList().then(data => { setList(data); setLoading(false); });
    }, []);

    const handleAdd = async () => {
        if (!newItem.trim()) return;
        const name = newItem.trim();
        setNewItem('');
        try {
            const res = await slAdd(section, name);
            if (!res.duplicate) {
                setList(prev => ({ ...prev, [section]: [...prev[section], res.item] }));
            }
            setAdded(name);
            setTimeout(() => setAdded(null), 1500);
        } catch {}
    };

    const handleToggle = async (section, id) => {
        try {
            const updated = await slToggle(id);
            setList(prev => ({ ...prev, [section]: prev[section].map(i => i.id === id ? updated : i) }));
        } catch {}
    };

    const handleRemove = async (section, id) => {
        try {
            await slRemove(id);
            setList(prev => ({ ...prev, [section]: prev[section].filter(i => i.id !== id) }));
        } catch {}
    };

    const handleClear = async (section) => {
        try {
            await slClear(section);
            setList(prev => ({ ...prev, [section]: prev[section].filter(i => !i.checked) }));
        } catch {}
    };

    const total = list.food.length + list.drinks.length;

    if (loading) return (
        <div className="shopping-list">
            <h3 className="shopping-list-title">🛒 Shopping List</h3>
            <p className="shopping-list-empty">Loading...</p>
        </div>
    );

    return (
        <div className="shopping-list">
            <h3 className="shopping-list-title">
                🛒 Shopping List
                {total > 0 && <span className="shopping-list-count">({total})</span>}
            </h3>

            <div className="shopping-list-add">
                <select value={section} onChange={e => setSection(e.target.value)} className="shopping-list-select">
                    <option value="food">🍽️</option>
                    <option value="drinks">🍸</option>
                </select>
                <input
                    value={newItem} onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="Add item..."
                    className="shopping-list-input"
                />
                <button onClick={handleAdd} className="glass-btn shopping-list-btn">+</button>
            </div>

            {added && <p className="shopping-list-added">✓ "{added}" added</p>}

            <SectionList label="🍽️ Grocery" color="#f97316" items={list.food}
                onToggle={id => handleToggle('food', id)}
                onRemove={id => handleRemove('food', id)}
                onClear={() => handleClear('food')}
            />

            <div className="shopping-list-divider" />

            <SectionList label="🍸 Liquor Store" color="#a78bfa" items={list.drinks}
                onToggle={id => handleToggle('drinks', id)}
                onRemove={id => handleRemove('drinks', id)}
                onClear={() => handleClear('drinks')}
            />
        </div>
    );
}

function SectionList({ label, color, items, onToggle, onRemove, onClear }) {
    return (
        <div>
            <div className="shopping-list-section-header">
                <span style={{ color, fontSize: '0.78rem', fontWeight: 700 }}>{label}</span>
                {items.some(i => i.checked) && (
                    <button onClick={onClear} className="shopping-list-clear">
                        Clear done
                    </button>
                )}
            </div>
            {items.length === 0
                ? <p className="shopping-list-empty">Empty</p>
                : items.map(item => (
                    <div key={item.id} className="shopping-list-item">
                        <input type="checkbox" checked={item.checked} onChange={() => onToggle(item.id)}
                            style={{ cursor: 'pointer', accentColor: color, flexShrink: 0 }} />
                        <span className={`shopping-list-item-name ${item.checked ? 'checked' : ''}`}>
                            {item.measure && <span className="shopping-list-measure">{item.measure}</span>}
                            {item.name}
                        </span>
                        <button onClick={() => onRemove(item.id)} className="shopping-list-remove">✕</button>
                    </div>
                ))
            }
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const { toasts, toast, removeToast } = useToast();

    const { data: savedItems = [], isLoading: itemsLoading } = useSavedItems();
    const { data: stats = {
        meals: 0, journalEntries: 0, books: 0,
        drinks: 0, spacePhotos: 0, locations: 0, artworks: 0,
    }, isLoading: statsLoading } = useDashboardStats();
    const deleteItemMutation = useDeleteItem();
    const loading = itemsLoading || statsLoading;
    const handleLogout = () => { logout(); navigate("/login"); };

    const handleDelete = (id) => {
        deleteItemMutation.mutate(id, {
            onSuccess: () => toast.success("Item deleted"),
            onError:   () => toast.error("Failed to delete item"),
        });
    };

    const handleView = (route, item) => {
        navigate(route, { state: { savedItem: item, tab: "saved" } });
    };

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

    const STAT_CARDS = [
        { icon:"🍽️", val: Number(stats?.meals) || 0,           label:"Saved Meals",      sub:"Food",     path:"/food"    },
        { icon:"⛅",  val: Number(stats?.locations) || 0,       label:"Saved Locations",  sub:"Weather",  path:"/weather" },
        { icon:"🎨", val: Number(stats?.artworks) || 0,         label:"Saved Artworks",   sub:"Art",      path:"/art"     },
        { icon:"📚", val: Number(stats?.books) || 0,            label:"Saved Books",      sub:"Books",    path:"/books"   },
        { icon:"🍸", val: Number(stats?.drinks) || 0,           label:"Saved Drinks",     sub:"Drinks",   path:"/drinks"  },
        { icon:"⚡", val:"GO!",                   label:"Pokémon Hub",      sub:"Play",     path:"/pokemon" },
        { icon:"🚀", val: Number(stats?.spacePhotos) || 0,      label:"Space Photos",     sub:"NASA",     path:"/space"   },
        { icon:"📓", val: Number(stats?.journalEntries) || 0,   label:"Journal Entries",  sub:"Journal",  path:"/journal" },
    ];

    return (
        <div className="glass-page" style={{ background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
            <div className="glass-container">
                <div className="dashboard-header-row">
                    <div className="glass-page-header">
                        <h2>Welcome, {user?.username || user?.displayName || 'Explorer'}! 👋</h2>
                        <p className="subtitle">Here's everything you've saved across LifeHub</p>
                    </div>
                    <WeatherWidget />
                </div>

                <div className="collection-section">
                    <h2 className="dash-section-title">📊 Your Collection</h2>
                    <p className="collection-subtitle">
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

                <div className="dashboard-content-row">
                    <div className="recent-section">
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
                    <ShoppingList />
                </div>
            </div>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

export default Dashboard;