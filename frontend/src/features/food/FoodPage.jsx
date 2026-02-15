import { useState } from "react";
import { useSearchMeals, useSaveMeal } from "@/api/queries";
import "@/styles/features/Food-Drinks-Art-Books.css";

const FoodPage = () => {
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // Separate state for actual search
    
    // 🚀 TanStack Query - replaces useState + useEffect!
    const { data: mealsData, isLoading } = useSearchMeals(searchQuery);
    const saveMealMutation = useSaveMeal();
    
    const meals = mealsData?.meals || [];

    const handleSearch = () => {
        if (query.trim()) {
            setSearchQuery(query); // Triggers the query
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
        <div className="food-drinks-theme page-content">
            <div className="container">
                <div className="page-header">
                    <h2>🍽️ Search Meals</h2>
                    <p className="subtitle">Discover delicious recipes from around the world</p>
                </div>
                
                <div className="search-section">
                    <div className="search-box">
                        <input 
                            type="text"
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            placeholder="Search for meals (e.g., chicken, pasta, beef)..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input"
                        />
                        <button 
                            onClick={handleSearch} 
                            disabled={isLoading}
                            className="search-btn"
                        >
                            {isLoading ? 'Searching...' : '🔍 Search'}
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Searching for delicious meals...</p>
                    </div>
                )}

                {/* Results Grid */}
                <div className="items-grid">
                    {meals.map(meal => (
                        <div key={meal.idMeal} className="item-card">
                            <img 
                                src={meal.strMealThumb} 
                                alt={meal.strMeal} 
                                className="item-image" 
                            />
                            <div className="item-info">
                                <h3 className="item-title">{meal.strMeal}</h3>
                                <div className="item-meta">
                                    <span className="meta-tag">🍽️ {meal.strCategory}</span>
                                    <span className="meta-tag">🌍 {meal.strArea}</span>
                                </div>
                                <button 
                                    onClick={() => handleSave(meal)}
                                    disabled={saveMealMutation.isLoading}
                                    className="save-btn"
                                >
                                    {saveMealMutation.isLoading ? '💾 Saving...' : '💾 Save Meal'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* No Results - After Search */}
                {meals.length === 0 && !isLoading && searchQuery && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">🔍</span>
                            <h3>No meals found for "{searchQuery}"</h3>
                            <p>Try searching for different keywords like:</p>
                            <div className="suggestion-tags">
                                <button onClick={() => { setQuery('chicken'); setSearchQuery('chicken'); }}>
                                    Chicken
                                </button>
                                <button onClick={() => { setQuery('pasta'); setSearchQuery('pasta'); }}>
                                    Pasta
                                </button>
                                <button onClick={() => { setQuery('beef'); setSearchQuery('beef'); }}>
                                    Beef
                                </button>
                                <button onClick={() => { setQuery('vegetarian'); setSearchQuery('vegetarian'); }}>
                                    Vegetarian
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Empty State - Before Search */}
                {meals.length === 0 && !isLoading && !searchQuery && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">🍽️</span>
                            <h3>Start Your Culinary Journey</h3>
                            <p>Search for delicious meals from around the world</p>
                            <div className="suggestion-tags">
                                <span className="suggestion-label">Popular searches:</span>
                                <button onClick={() => { setQuery('chicken'); setSearchQuery('chicken'); }}>
                                    Chicken
                                </button>
                                <button onClick={() => { setQuery('pasta'); setSearchQuery('pasta'); }}>
                                    Pasta
                                </button>
                                <button onClick={() => { setQuery('dessert'); setSearchQuery('dessert'); }}>
                                    Dessert
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodPage;