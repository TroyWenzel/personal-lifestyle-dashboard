import { useState } from "react";
import { searchMeals } from "../../api/mealService";
import { saveMeal } from "../../api/contentService";

const FoodPage = () => {
    const [query, setQuery] = useState("");
    const [meals, setMeals] = useState([]);

    const handleSearch = async () => {
        const data = await searchMeals(query);
        setMeals(data.meals || []);
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
        <div>
            <h2>Search Meals</h2>
            <input 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="Search for meals..."
            />
            <button onClick={handleSearch}>Search</button>

            {meals.map(meal => (
                <div key={meal.idMeal} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
                    <h3>{meal.strMeal}</h3>
                    <img src={meal.strMealThumb} width="150" alt={meal.strMeal} />
                    <br />
                    <button onClick={() => handleSave(meal)}>Save Meal</button>
                </div>
            ))}
        </div>
    );
};

export default FoodPage;