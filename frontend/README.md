# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# LifeHub

A modular lifestyle dashboard where users can explore, save, and organize content from a variety of APIs — all in one place with a consistent glassmorphism design.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How to Add a New Feature Page](#how-to-add-a-new-feature-page)
  - [Step 1 — Frontend Service](#step-1--frontend-service)
  - [Step 2 — Feature Page Component](#step-2--feature-page-component)
  - [Step 3 — Save Function in contentService](#step-3--save-function-in-contentservice)
  - [Step 4 — Backend Route (optional)](#step-4--backend-route-optional)
  - [Step 5 — Register Everything](#step-5--register-everything)
- [Design System Reference](#design-system-reference)
- [Existing Features](#existing-features)

---

## Project Overview

LifeHub is built to be extended. Every feature page follows the same pattern:

1. Fetch data from a public API
2. Display it in a searchable, browsable grid
3. Let the user save items to their personal collection (stored in the backend)
4. Show saved items in a "Saved" tab on that page and on the Dashboard

If you follow the patterns below, your new page will fit right in with no extra wiring needed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Routing | React Router v6 |
| Server state | TanStack Query (React Query) |
| Styling | Glassmorphism Design System (`GlassDesignSystem.css`) |
| Backend | Python / Flask |
| Auth | Flask-JWT-Extended |
| Database | SQLAlchemy + SQLite (dev) / PostgreSQL (prod) |
| Deployment | Render |

---

## Project Structure

```
src/
├── api/
│   ├── client.js                  # Axios instance with auth interceptors
│   ├── queries.js                 # All TanStack Query hooks
│   ├── services/
│   │   ├── contentService.js      # Save/fetch/delete items (all types)
│   │   ├── drinkService.js        # CocktailDB API calls
│   │   ├── foodService.js         # MealDB API calls
│   │   ├── artService.js          # Art Institute API calls
│   │   ├── spaceService.js        # NASA APOD API calls
│   │   ├── weatherService.js      # Weather API calls
│   │   ├── bookService.js         # OpenLibrary API calls
│   │   ├── shoppingListService.js # localStorage shopping list
│   │   └── userService.js         # User profile utilities
├── features/
│   ├── FoodPage.jsx
│   ├── DrinksPage.jsx
│   ├── ArtPage.jsx
│   ├── SpacePage.jsx
│   ├── WeatherPage.jsx
│   ├── BooksPage.jsx
│   ├── JournalPage.jsx
│   └── HobbyIdeasPage.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── ProfilePage.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── components/
│   └── layout/
│       ├── Navbar.jsx
│       └── ProtectedRoute.jsx
└── styles/
    ├── GlassDesignSystem.css      # All reusable glass classes
    ├── features/
    │   ├── Drinks.css
    │   ├── Space.css
    │   └── WeatherPage.css
    └── pages/
        └── Dashboard.css

backend/app/
├── routes/
│   ├── auth_routes.py
│   ├── content_routes.py
│   └── YOUR_FEATURE_routes.py     # You add this
├── services/
│   └── YOUR_FEATURE_api.py        # You add this
├── models/
│   ├── user.py
│   └── saved_item.py
└── __init__.py                    # Register your blueprint here
```

---

## Getting Started

```bash
# Frontend
npm install
npm run dev

# Backend
pip install -r requirements.txt
flask db upgrade
flask run
```

Set your environment variables in `backend/.env`:
```
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
DATABASE_URL=sqlite:///app.db
YOUR_API_KEY=from_whatever_api_you_use
```

---

## How to Add a New Feature Page

Below is a complete walkthrough with fill-in-the-blank templates. Replace every `YOUR_FEATURE` placeholder with your actual feature name (e.g. `Movies`, `Recipes`, `Music`).

---

### Step 1 — Frontend Service

Create `src/api/services/yourFeatureService.js`

This file handles calling the external API directly from the frontend. Most public APIs (CocktailDB, MealDB, NASA, etc.) can be called directly from the browser with no backend proxy needed.

```js
// src/api/services/yourFeatureService.js

const API_BASE = 'https://api.YOUR_EXTERNAL_API.com';
// If your API needs a key: const API_KEY = import.meta.env.VITE_YOUR_API_KEY;

/**
 * Search for items
 * @param {string} query - Search term entered by the user
 * @returns {Promise<Array>} - Array of result objects
 */
export const searchYourFeature = async (query) => {
    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        // If API key needed: add &apikey=${API_KEY}
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        return data.results || data.items || data; // adjust to match the API's response shape
    } catch (error) {
        console.error('Error in searchYourFeature:', error);
        throw error;
    }
};

/**
 * Get a single item by ID (optional — only if your API supports it)
 * @param {string} id
 */
export const getYourFeatureById = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/item/${id}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error in getYourFeatureById:', error);
        throw error;
    }
};
```

---

### Step 2 — Feature Page Component

Create `src/features/YourFeaturePage.jsx`

This is the full page template. The two tabs (Search + Saved) and the modal detail view are all included. Fill in the `YOUR_FEATURE` / `YOUR_ITEM` placeholders and the metadata fields specific to your API.

```jsx
// src/features/YourFeaturePage.jsx

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSavedItems, useDeleteItem } from '@/api/queries';
import { searchYourFeature } from '@/api/services/yourFeatureService';
import { saveYourFeature } from '@/api/services/contentService';
import '@/styles/GlassDesignSystem.css';
// Optional: import '@/styles/features/YourFeature.css';

const YourFeaturePage = () => {
    const [searchQuery, setSearchQuery]   = useState('');
    const [results, setResults]           = useState([]);
    const [isLoading, setIsLoading]       = useState(false);
    const [activeTab, setActiveTab]       = useState('search');
    const [selectedItem, setSelectedItem] = useState(null);
    const location = useLocation();

    const { data: allSavedItems = [] } = useSavedItems();
    const deleteItemMutation = useDeleteItem();

    // Filter saved items to only this feature's type
    // Make sure this matches the `type` string you use in saveYourFeature()
    const savedItems = allSavedItems.filter(item => item.type === 'YOUR_TYPE');

    // Navigate here from Dashboard with tab:'saved' to open saved tab directly
    useEffect(() => {
        if (location.state?.tab === 'saved') {
            setActiveTab('saved');
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        try {
            const data = await searchYourFeature(searchQuery);
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (item) => {
        try {
            await saveYourFeature(item);
            alert(`${item.YOUR_TITLE_FIELD} saved!`);
        } catch (error) {
            // 409 means already saved — handle gracefully
            if (error.response?.status === 409) {
                alert('Already saved!');
            } else {
                alert('Failed to save. Please try again.');
            }
        }
    };

    const handleDelete = (itemId) => {
        deleteItemMutation.mutate(itemId, {
            onSuccess: () => alert('Removed from saved items.'),
            onError:   () => alert('Failed to remove item.'),
        });
    };

    return (
        <div className="glass-page">
            <div className="glass-container">

                {/* ── Header ── */}
                <div className="glass-page-header">
                    <h2>YOUR_EMOJI Your Feature Title</h2>
                    <p className="subtitle">Your one-line description of what this page does</p>
                </div>

                {/* ── Tab switcher ── */}
                <div className="glass-tabs" style={{ marginBottom: '2rem' }}>
                    <button
                        className={`glass-tab ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        🔍 Search
                    </button>
                    <button
                        className={`glass-tab ${activeTab === 'saved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('saved')}
                    >
                        💾 Saved ({savedItems.length})
                    </button>
                </div>

                {/* ══ SEARCH TAB ══ */}
                {activeTab === 'search' && (
                    <>
                        <div className="glass-search-section">
                            <div className="glass-search-box">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search for..."
                                    className="glass-input"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                    className="glass-btn"
                                >
                                    {isLoading ? 'Searching...' : '🔍 Search'}
                                </button>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="glass-loading">
                                <div className="glass-spinner"></div>
                                <p>Searching...</p>
                            </div>
                        )}

                        {!isLoading && results.length > 0 && (
                            <div className="glass-grid">
                                {results.map(item => (
                                    <div
                                        key={item.YOUR_ID_FIELD}
                                        className="glass-item-card"
                                        onClick={() => setSelectedItem(item)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {/* Optional thumbnail */}
                                        {item.YOUR_IMAGE_FIELD && (
                                            <img
                                                src={item.YOUR_IMAGE_FIELD}
                                                alt={item.YOUR_TITLE_FIELD}
                                                className="glass-item-image"
                                            />
                                        )}
                                        <div className="glass-item-info">
                                            <h3 className="glass-item-title">{item.YOUR_TITLE_FIELD}</h3>
                                            <div className="glass-item-meta">
                                                {/* Add whatever metadata tags make sense */}
                                                <span className="glass-meta-tag">YOUR_EMOJI {item.YOUR_META_FIELD}</span>
                                            </div>
                                            <button
                                                className="glass-btn"
                                                onClick={e => { e.stopPropagation(); handleSave(item); }}
                                            >
                                                💾 Save
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLoading && results.length === 0 && searchQuery && (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">🔍</span>
                                <h3>No results found</h3>
                                <p>Try a different search term</p>
                            </div>
                        )}

                        {!searchQuery && (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">YOUR_EMOJI</span>
                                <h3>Start Searching</h3>
                                <p>Enter a search term above to get started</p>
                            </div>
                        )}
                    </>
                )}

                {/* ══ SAVED TAB ══ */}
                {activeTab === 'saved' && (
                    savedItems.length === 0 ? (
                        <div className="glass-empty-state">
                            <span className="glass-empty-icon">YOUR_EMOJI</span>
                            <h3>Nothing saved yet</h3>
                            <p>Search and save your favorites to see them here</p>
                            <button className="glass-btn" onClick={() => setActiveTab('search')}>
                                Start Searching
                            </button>
                        </div>
                    ) : (
                        <div className="glass-grid">
                            {savedItems.map(item => (
                                <div
                                    key={item.id}
                                    className="glass-item-card"
                                    onClick={() => {
                                        // Reconstruct the item shape from saved metadata
                                        setSelectedItem({
                                            YOUR_ID_FIELD:    item.external_id,
                                            YOUR_TITLE_FIELD: item.title,
                                            YOUR_IMAGE_FIELD: item.metadata?.thumbnail,
                                            // Map any other fields you stored in metadata:
                                            YOUR_META_FIELD:  item.metadata?.YOUR_META_KEY,
                                            savedItemId: item.id,
                                        });
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {item.metadata?.thumbnail && (
                                        <img
                                            src={item.metadata.thumbnail}
                                            alt={item.title}
                                            className="glass-item-image"
                                        />
                                    )}
                                    <div className="glass-item-info">
                                        <h3 className="glass-item-title">{item.title}</h3>
                                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                                            Saved {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                        <button
                                            className="glass-btn-secondary"
                                            onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                                            disabled={deleteItemMutation.isLoading}
                                            style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }}
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* ══ DETAIL MODAL ══ */}
            {selectedItem && (
                <div
                    onClick={() => setSelectedItem(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '2rem', overflowY: 'auto'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="glass-card"
                        style={{ maxWidth: '800px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
                                width: '36px', height: '36px', color: 'white',
                                fontSize: '1.1rem', cursor: 'pointer'
                            }}
                        >✕</button>

                        {/* Image */}
                        {selectedItem.YOUR_IMAGE_FIELD && (
                            <img
                                src={selectedItem.YOUR_IMAGE_FIELD}
                                alt={selectedItem.YOUR_TITLE_FIELD}
                                style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}
                            />
                        )}

                        {/* Title */}
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            {selectedItem.YOUR_TITLE_FIELD}
                        </h2>

                        {/* Meta tags */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            <span className="glass-meta-tag">YOUR_EMOJI {selectedItem.YOUR_META_FIELD}</span>
                            {/* Add more meta tags as needed */}
                        </div>

                        {/* Main content / description */}
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '2rem' }}>
                            {selectedItem.YOUR_DESCRIPTION_FIELD}
                        </p>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {selectedItem.savedItemId ? (
                                <button
                                    className="glass-btn-secondary"
                                    onClick={() => { handleDelete(selectedItem.savedItemId); setSelectedItem(null); }}
                                    style={{ flex: 1, background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.3)' }}
                                >
                                    🗑️ Remove from Saved
                                </button>
                            ) : (
                                <button
                                    className="glass-btn"
                                    onClick={() => handleSave(selectedItem)}
                                    style={{ flex: 1 }}
                                >
                                    💾 Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourFeaturePage;
```

---

### Step 3 — Save Function in contentService

Add your save function to `src/api/services/contentService.js`.

The `metadata` object is a freeform JSON field — store whatever you need to fully reconstruct the item later when loading from the database.

```js
// Add to src/api/services/contentService.js

export const saveYourFeature = async (item) => {
    return saveItem({
        category: 'YOUR_CATEGORY',   // e.g. 'movies', 'music', 'fitness'
        type:     'YOUR_TYPE',        // e.g. 'movie', 'track', 'workout'
                                      // ⚠️ This must match the filter in your page:
                                      //    allSavedItems.filter(i => i.type === 'YOUR_TYPE')
        external_id: item.YOUR_ID_FIELD?.toString(),
        title:       item.YOUR_TITLE_FIELD,
        description: `YOUR_CATEGORY - ${item.YOUR_META_FIELD || ''}`,
        metadata: {
            thumbnail:        item.YOUR_IMAGE_FIELD,
            YOUR_META_KEY:    item.YOUR_META_FIELD,
            // Store everything you'll need to reconstruct the item
            // when the user loads their saved items later:
            YOUR_OTHER_KEY:   item.YOUR_OTHER_FIELD,
        }
    });
};
```

---

### Step 4 — Backend Route (optional)

Only needed if your API requires a secret key that must not be exposed in the frontend, or if you need to proxy/transform responses.

**`backend/app/services/your_feature_api.py`**
```python
import requests
import os

YOUR_API_KEY = os.environ.get('YOUR_API_KEY')
BASE_URL = 'https://api.YOUR_EXTERNAL_API.com'

def search_items(query: str) -> dict:
    """Search for items by query string."""
    response = requests.get(
        f'{BASE_URL}/search',
        params={'q': query, 'apikey': YOUR_API_KEY},
        timeout=10
    )
    response.raise_for_status()
    return response.json()

def get_item_by_id(item_id: str) -> dict:
    """Get a single item by its external ID."""
    response = requests.get(
        f'{BASE_URL}/item/{item_id}',
        params={'apikey': YOUR_API_KEY},
        timeout=10
    )
    response.raise_for_status()
    return response.json()
```

**`backend/app/routes/your_feature_routes.py`**
```python
from flask import Blueprint, request, jsonify
from app.services.your_feature_api import search_items, get_item_by_id

your_feature_bp = Blueprint('your_feature', __name__, url_prefix='/api/your-feature')

@your_feature_bp.route('/search')
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify({'error': 'Query parameter q is required'}), 400
    try:
        data = search_items(query)
        return jsonify(data), 200
    except Exception as e:
        print(f'Search error: {e}')
        return jsonify({'error': 'Search failed'}), 500

@your_feature_bp.route('/<item_id>')
def detail(item_id):
    try:
        data = get_item_by_id(item_id)
        return jsonify(data), 200
    except Exception as e:
        print(f'Detail error: {e}')
        return jsonify({'error': 'Failed to fetch item'}), 500
```

---

### Step 5 — Register Everything

**1. Register the blueprint** in `backend/app/__init__.py`:
```python
from app.routes.your_feature_routes import your_feature_bp
app.register_blueprint(your_feature_bp)
```

**2. Add the route** in `src/App.jsx`:
```jsx
import YourFeaturePage from './features/YourFeaturePage';

// Inside <Routes>:
<Route path="/your-feature" element={
    <ProtectedRoute>
        <YourFeaturePage />
    </ProtectedRoute>
} />
```

**3. Add the nav link** in `src/components/layout/Navbar.jsx`:
```jsx
// In the navItems array:
{ path: '/your-feature', label: 'Your Label', protected: true },
```

**4. Add a stat card** in `src/pages/Dashboard.jsx`:
```jsx
// In the STAT_CARDS array:
{ icon: 'YOUR_EMOJI', val: stats.YOUR_TYPE, label: 'Saved Items', sub: 'Your Label', path: '/your-feature' },
```
Then add `YOUR_TYPE: 0` to the default stats object in the same file.

**5. Add a Dashboard stat** in `backend/app/routes/content_routes.py` — the `type_mapping` dict:
```python
'YOUR_TYPE': 'YOUR_TYPE',   # maps DB content_type → frontend stats key
```

---

## Design System Reference

All reusable classes are in `src/styles/GlassDesignSystem.css`.

| Class | Use |
|---|---|
| `glass-page` | Full page wrapper with gradient background |
| `glass-container` | Max-width centered content wrapper |
| `glass-page-header` | Centered title + subtitle block |
| `glass-tabs` | Tab row container |
| `glass-tab` | Individual tab button (add `active` class for selected) |
| `glass-search-section` | Search bar wrapper |
| `glass-search-box` | Flex row for input + button |
| `glass-input` | Styled text input |
| `glass-btn` | Primary gradient button |
| `glass-btn-secondary` | Ghost/secondary button |
| `glass-btn-sm` | Smaller button variant |
| `glass-grid` | Auto-fill card grid |
| `glass-item-card` | Individual result card |
| `glass-item-image` | Card thumbnail image (200px, cover) |
| `glass-item-info` | Card content padding wrapper |
| `glass-item-title` | Card title text |
| `glass-item-meta` | Flex row for meta tags |
| `glass-meta-tag` | Individual pill tag |
| `glass-loading` | Centered loading state |
| `glass-spinner` | Animated spin circle |
| `glass-empty-state` | Centered empty state block |
| `glass-empty-icon` | Large emoji in empty state |
| `glass-card` | Generic glass card (for modals etc.) |

### CSS Variables
```css
var(--text-primary)      /* white, full opacity */
var(--text-secondary)    /* white, 70% opacity */
var(--text-tertiary)     /* white, 50% opacity */
var(--glass-bg)          /* card background */
var(--glass-bg-hover)    /* card hover background */
var(--glass-border)      /* card border */
var(--accent-primary)    /* #8b5cf6 purple */
var(--accent-secondary)  /* #ec4899 pink */
var(--accent-gradient)   /* purple → pink gradient */
var(--radius-sm/md/lg/xl)
```

---

## Existing Features

| Feature | Route | API Used | Content Type |
|---|---|---|---|
| Food & Recipes | `/food` | TheMealDB | `meal` |
| Cocktails | `/drinks` | TheCocktailDB | `drink` |
| Art | `/art` | Art Institute of Chicago | `artwork` |
| Books | `/books` | OpenLibrary | `book` |
| Space | `/space` | NASA APOD | `space` |
| Weather | `/weather` | WeatherStack / OpenWeatherMap | `location` |
| Journal | `/journal` | Internal | `journal` |
| Hobbies | `/hobbies` | Bored API | `activity` |
| Dashboard | `/dashboard` | Internal | — |
| Profile | `/profile` | Internal | — |