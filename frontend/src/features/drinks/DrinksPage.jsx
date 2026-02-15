import { useState } from 'react';
import { useSearchDrinks, useSaveDrink } from '@/api/queries';
import "@/styles/GlassDesignSystem.css";

const DrinksPage = () => {
    const [query, setQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDrink, setSelectedDrink] = useState(null);

    // 🚀 TanStack Query
    const { data: drinksData, isLoading } = useSearchDrinks(searchQuery);
    const saveDrinkMutation = useSaveDrink();
    
    const drinks = drinksData?.drinks || [];

    const handleSearch = () => {
        if (query.trim()) {
            setSearchQuery(query);
        }
    };

    const handleSaveDrink = (drink) => {
        saveDrinkMutation.mutate(drink, {
            onSuccess: () => {
                alert('Drink saved successfully!');
            },
            onError: (error) => {
                console.error('Error saving drink:', error);
                alert('Failed to save drink');
            },
        });
    };

    const getIngredients = (drink) => {
        const ingredients = [];
        for (let i = 1; i <= 15; i++) {
            const ingredient = drink[`strIngredient${i}`];
            const measure = drink[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    ingredient: ingredient.trim(),
                    measure: measure ? measure.trim() : ''
                });
            }
        }
        return ingredients;
    };

    return (
        <div className="glass-page">
            <div className="glass-container">
                <div className="glass-page-header">
                    <h2>🍸 Cocktail Explorer</h2>
                    <p className="subtitle">Discover and save your favorite cocktail recipes</p>
                </div>
                
                <div className="glass-search-section">
                    <div className="glass-search-box">
                        <input 
                            type="text"
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            placeholder="Search for cocktails (e.g., margarita, mojito)..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

                {/* Loading State */}
                {isLoading && (
                    <div className="loading-glass-container">
                        <div className="spinner"></div>
                        <p>Searching for cocktails...</p>
                    </div>
                )}

                {/* Drinks Grid */}
                <div className="glass-grid">
                    {drinks.map(drink => (
                        <div key={drink.idDrink} className="glass-item-card">
                            <img 
                                src={drink.strDrinkThumb} 
                                alt={drink.strDrink} 
                                className="glass-item-image" 
                            />
                            <div className="glass-item-info">
                                <h3 className="glass-item-title">{drink.strDrink}</h3>
                                <div className="glass-item-meta">
                                    <span className="glass-meta-tag">🍸 {drink.strCategory}</span>
                                    <span className="glass-meta-tag">🥃 {drink.strAlcoholic}</span>
                                </div>
                                <div className="button-group">
                                    <button 
                                        onClick={() => setSelectedDrink(drink)}
                                        className="view-btn"
                                    >
                                        👁️ View Recipe
                                    </button>
                                    <button 
                                        onClick={() => handleSaveDrink(drink)}
                                        disabled={saveDrinkMutation.isLoading}
                                        className="glass-btn glass-btn-sm"
                                    >
                                        {saveDrinkMutation.isLoading ? '💾 Saving...' : '💾 Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {drinks.length === 0 && !isLoading && searchQuery && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">🍸</span>
                            <h3>No cocktails found for "{searchQuery}"</h3>
                            <p>Try these popular cocktails:</p>
                            <div className="suggestion-tags">
                                <button onClick={() => { setQuery('margarita'); setSearchQuery('margarita'); }}>Margarita</button>
                                <button onClick={() => { setQuery('mojito'); setSearchQuery('mojito'); }}>Mojito</button>
                                <button onClick={() => { setQuery('martini'); setSearchQuery('martini'); }}>Martini</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Empty State */}
                {drinks.length === 0 && !isLoading && !searchQuery && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">🍹</span>
                            <h3>Explore Cocktail Recipes</h3>
                            <p>Search for your favorite drinks</p>
                            <div className="suggestion-tags">
                                <span className="suggestion-label">Popular:</span>
                                <button onClick={() => { setQuery('margarita'); setSearchQuery('margarita'); }}>Margarita</button>
                                <button onClick={() => { setQuery('mojito'); setSearchQuery('mojito'); }}>Mojito</button>
                                <button onClick={() => { setQuery('cosmopolitan'); setSearchQuery('cosmopolitan'); }}>Cosmopolitan</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Drink Details Modal */}
                {selectedDrink && (
                    <div className="modal-overlay" onClick={() => setSelectedDrink(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setSelectedDrink(null)}>✕</button>
                            <div className="modal-header">
                                <img src={selectedDrink.strDrinkThumb} alt={selectedDrink.strDrink} />
                                <h2>{selectedDrink.strDrink}</h2>
                                <div className="modal-meta">
                                    <span>{selectedDrink.strCategory}</span>
                                    <span>{selectedDrink.strAlcoholic}</span>
                                    <span>{selectedDrink.strGlass}</span>
                                </div>
                            </div>
                            <div className="modal-body">
                                <div className="ingredients-section">
                                    <h3>📝 Ingredients</h3>
                                    <ul>
                                        {getIngredients(selectedDrink).map((item, idx) => (
                                            <li key={idx}>
                                                {item.measure} {item.ingredient}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="instructions-section">
                                    <h3>🍹 Instructions</h3>
                                    <p>{selectedDrink.strInstructions}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrinksPage;