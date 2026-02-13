import { useState } from 'react';
import { searchCocktails, saveDrink } from '../api/drinkService';

const DrinksPage = () => {
    const [query, setQuery] = useState('');
    const [drinks, setDrinks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [selectedDrink, setSelectedDrink] = useState(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const data = await searchCocktails(query);
            setDrinks(data.drinks || []);
            setSearchPerformed(true);
        } catch (error) {
            console.error('Error searching drinks:', error);
            alert('Failed to search cocktails');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDrink = async (drink) => {
        try {
            await saveDrink(drink);
            alert('Drink saved successfully!');
        } catch (error) {
            console.error('Error saving drink:', error);
            alert('Failed to save drink');
        }
    };

    const openDrinkDetails = (drink) => {
        setSelectedDrink(drink);
    };

    const closeDrinkDetails = () => {
        setSelectedDrink(null);
    };

    const getIngredients = (drink) => {
        const ingredients = [];
        for (let i = 1; i <= 15; i++) {
            const ingredient = drink[`strIngredient${i}`];
            const measure = drink[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    ingredient,
                    measure: measure || ''
                });
            }
        }
        return ingredients;
    };
    
    return (
        <div className="food-drinks-theme drinks-variant page-content">
            <div className="container">
                <div className="page-header">
                    <h2>🍹 Cocktail Explorer</h2>
                    <p className="subtitle">Discover amazing cocktail recipes from around the world</p>
                </div>

                <div className="search-section">
                    <div className="search-box">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search cocktails by name or ingredient..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input"
                        />
                        <button 
                            onClick={handleSearch} 
                            disabled={loading || !query.trim()}
                            className="search-btn"
                        >
                            {loading ? 'Mixing...' : '🍸 Search Drinks'}
                        </button>
                    </div>
                    <div className="quick-searches">
                        <button onClick={() => setQuery('mojito')} className="quick-btn">
                            Mojito
                        </button>
                        <button onClick={() => setQuery('margarita')} className="quick-btn">
                            Margarita
                        </button>
                        <button onClick={() => setQuery('martini')} className="quick-btn">
                            Martini
                        </button>
                        <button onClick={() => setQuery('cosmopolitan')} className="quick-btn">
                            Cosmopolitan
                        </button>
                    </div>
                </div>

                {searchPerformed && (
                    <div className="results-header">
                        <h3>Cocktails found: {drinks.length}</h3>
                        <p className="search-query">Search: "{query}"</p>
                    </div>
                )}

                <div className="items-grid">
                    {drinks.map(drink => (
                        <div key={drink.idDrink} className="item-card">
                            <div className="drink-image-container">
                                <img 
                                    src={drink.strDrinkThumb} 
                                    alt={drink.strDrink}
                                    className="drink-image"
                                />
                                <div className="drink-overlay">
                                    <button 
                                        onClick={() => openDrinkDetails(drink)}
                                        className="view-details-btn"
                                    >
                                        View Recipe
                                    </button>
                                </div>
                            </div>
                            
                            <div className="item-info">
                                <h3 className="item-title">{drink.strDrink}</h3>
                                <p className="item-subtitle">
                                    {drink.strCategory} • {drink.strAlcoholic}
                                </p>
                                
                                <div className="item-actions">
                                    <button 
                                        onClick={() => openDrinkDetails(drink)}
                                        className="view-details-btn"
                                    >
                                        📝 View Recipe
                                    </button>
                                    <button 
                                        onClick={() => handleSaveDrink(drink)}
                                        className="save-btn"
                                    >
                                        🍸 Save Drink
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {searchPerformed && drinks.length === 0 && !loading && (
                    <div className="no-results">
                        <div className="no-results-icon">🍸</div>
                        <h3>No cocktails found</h3>
                        <p>Try searching for a different cocktail or ingredient</p>
                    </div>
                )}

                {!searchPerformed && !loading && (
                    <div className="featured-section">
                        <h3>Popular Categories</h3>
                        <div className="category-grid">
                            <div className="category-card" onClick={() => setQuery('ordinary drink')}>
                                <span className="category-icon">🍹</span>
                                <span className="category-name">Ordinary Drinks</span>
                            </div>
                            <div className="category-card" onClick={() => setQuery('cocktail')}>
                                <span className="category-icon">🥂</span>
                                <span className="category-name">Cocktails</span>
                            </div>
                            <div className="category-card" onClick={() => setQuery('shot')}>
                                <span className="category-icon">🥃</span>
                                <span className="category-name">Shots</span>
                            </div>
                            <div className="category-card" onClick={() => setQuery('non alcoholic')}>
                                <span className="category-icon">🧃</span>
                                <span className="category-name">Non-Alcoholic</span>
                            </div>
                        </div>
                    </div>
                )}

                {selectedDrink && (
                    <div className="modal-overlay" onClick={closeDrinkDetails}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeDrinkDetails}>
                                ✕
                            </button>
                            
                            <div className="modal-header">
                                <img 
                                    src={selectedDrink.strDrinkThumb} 
                                    alt={selectedDrink.strDrink}
                                    className="modal-image"
                                />
                                <div className="modal-header-info">
                                    <h2>{selectedDrink.strDrink}</h2>
                                    <div className="modal-tags">
                                        <span className="tag">{selectedDrink.strCategory}</span>
                                        <span className="tag">{selectedDrink.strAlcoholic}</span>
                                        <span className="tag">{selectedDrink.strGlass}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-body">
                                <div className="ingredients-section">
                                    <h3>Ingredients</h3>
                                    <ul className="ingredients-list">
                                        {getIngredients(selectedDrink).map((item, index) => (
                                            <li key={index} className="ingredient-item">
                                                <span className="ingredient-name">{item.ingredient}</span>
                                                <span className="ingredient-measure">{item.measure}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="instructions-section">
                                    <h3>Instructions</h3>
                                    <p className="instructions-text">{selectedDrink.strInstructions}</p>
                                </div>
                                
                                {selectedDrink.strVideo && (
                                    <div className="video-section">
                                        <h3>Video Tutorial</h3>
                                        <a 
                                            href={selectedDrink.strVideo} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="video-link"
                                        >
                                            Watch on YouTube
                                        </a>
                                    </div>
                                )}
                            </div>
                            
                            <div className="modal-footer">
                                <button 
                                    onClick={() => handleSaveDrink(selectedDrink)}
                                    className="modal-save-btn"
                                >
                                    🍸 Save This Drink
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrinksPage;