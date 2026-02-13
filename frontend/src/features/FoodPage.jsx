import { useState } from "react";
import { searchMeals } from "../api/mealService";
import { saveMeal } from "../api/contentService";

const FoodPage = () => {
    const [query, setQuery] = useState("");
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchMeals(query);
            setMeals(data.meals || []);
        } catch (error) {
            console.error("Search error:", error);
            alert("Failed to search meals");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (meal) => {
        try {
            await saveMeal(meal);
            alert("Meal saved successfully!");
        } catch (error) {
            console.error("Error saving meal:", error);
            alert("Failed to save meal");
        }
    };

    return (
        <div className="food-drinks-theme page-content">
            <div className="container">
                <div className="page-header">
                    <h2>Search Meals</h2>
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
                            disabled={loading}
                            className="search-btn"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </div>

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
                                    className="save-btn"
                                >
                                    Save Meal
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {meals.length === 0 && !loading && query && (
                    <div className="no-results">
                        <p>No meals found for "{query}"</p>
                        <p className="text-sm">Try searching for different keywords</p>
                    </div>
                )}
                
                {meals.length === 0 && !loading && !query && (
                    <div className="no-results">
                        <p>Search for delicious meals to see results...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodPage;