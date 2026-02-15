import { useState } from "react";
import { useSearchMeals, useSaveMeal } from "@/api/queries";
import "@/styles/GlassDesignSystem.css";

const FoodPage = () => {
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    
    const { data: mealsData, isLoading } = useSearchMeals(searchQuery);
    const saveMealMutation = useSaveMeal();
    
    const meals = mealsData?.meals || [];

    const handleSearch = () => {
        if (query.trim()) {
            setSearchQuery(query);
        }
    };

    const handleSave = (meal) => {
        saveMealMutation.mutate(meal, {
            onSuccess: () => {
                alert("Meal saved successfully!");
            },
            onError: (error) => {
                console.error("Error saving meal:", error);
                alert("Failed to save meal");
            },
        });
    };

    return (
        <div className="glass-page">
            <div className="glass-container">
                <div className="glass-page-header">
                    <h2>🍽️ Search Meals</h2>
                    <p className="subtitle">Discover delicious recipes from around the world</p>
                </div>
                
                <div className="glass-search-section">
                    <div className="glass-search-box">
                        <input 
                            type="text"
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            placeholder="Search for meals (e.g., chicken, pasta, beef)..."
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

                {isLoading && (
                    <div className="glass-loading">
                        <div className="glass-spinner"></div>
                        <p>Searching for delicious meals...</p>
                    </div>
                )}

                <div className="glass-grid">
                    {meals.map(meal => (
                        <div key={meal.idMeal} className="glass-item-card">
                            <img 
                                src={meal.strMealThumb} 
                                alt={meal.strMeal} 
                                className="glass-item-image" 
                            />
                            <div className="glass-item-info">
                                <h3 className="glass-item-title">{meal.strMeal}</h3>
                                <div className="glass-item-meta">
                                    <span className="glass-meta-tag">🍽️ {meal.strCategory}</span>
                                    <span className="glass-meta-tag">🌍 {meal.strArea}</span>
                                </div>
                                <button 
                                    onClick={() => handleSave(meal)}
                                    disabled={saveMealMutation.isLoading}
                                    className="glass-btn glass-btn-sm"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                >
                                    {saveMealMutation.isLoading ? '💾 Saving...' : '💾 Save Meal'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {meals.length === 0 && !isLoading && searchQuery && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">🔍</span>
                        <h3>No meals found for "{searchQuery}"</h3>
                        <p>Try searching for different keywords</p>
                        <div className="glass-suggestion-tags">
                            <button onClick={() => { setQuery('chicken'); setSearchQuery('chicken'); }}>Chicken</button>
                            <button onClick={() => { setQuery('pasta'); setSearchQuery('pasta'); }}>Pasta</button>
                            <button onClick={() => { setQuery('beef'); setSearchQuery('beef'); }}>Beef</button>
                            <button onClick={() => { setQuery('vegetarian'); setSearchQuery('vegetarian'); }}>Vegetarian</button>
                        </div>
                    </div>
                )}
                
                {meals.length === 0 && !isLoading && !searchQuery && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">🍽️</span>
                        <h3>Start Your Culinary Journey</h3>
                        <p>Search for delicious meals from around the world</p>
                        <div className="glass-suggestion-tags">
                            <button onClick={() => { setQuery('chicken'); setSearchQuery('chicken'); }}>Chicken</button>
                            <button onClick={() => { setQuery('pasta'); setSearchQuery('pasta'); }}>Pasta</button>
                            <button onClick={() => { setQuery('dessert'); setSearchQuery('dessert'); }}>Dessert</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodPage;