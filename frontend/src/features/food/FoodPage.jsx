
import { useState } from "react";
import { searchMeals } from "../../api/mealService";
import { saveMeal } from "../../api/contentService";
import "./FoodPage.css"; 

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
        <div className="food-container">
            <h2>Search Meals</h2>
            <div className="search-container">
                <input 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    placeholder="Search for meals..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            <div className="meals-grid">
                {meals.map(meal => (
                    <div key={meal.idMeal} className="meal-card">
                        <h3>{meal.strMeal}</h3>
                        <img src={meal.strMealThumb} alt={meal.strMeal} className="meal-image" />
                        <div className="meal-info">
                            <p><strong>Category:</strong> {meal.strCategory}</p>
                            <p><strong>Cuisine:</strong> {meal.strArea}</p>
                        </div>
                        <button 
                            onClick={() => handleSave(meal)}
                            className="save-button"
                        >
                            Save Meal
                        </button>
                    </div>
                ))}
            </div>
            
            {meals.length === 0 && !loading && query && (
                <p className="no-results">No meals found for "{query}"</p>
            )}
        </div>
    );
};

export default FoodPage;