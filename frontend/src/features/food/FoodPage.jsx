import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSavedItems, useSearchMeals, useSaveMeal, useDeleteItem } from "@/api/queries";
import { extractIngredients } from "@/api/services/foodService";
import "@/styles/GlassDesignSystem.css";
import { addItem as slAdd } from "@/api/services/shoppingListService";

const FoodPage = () => {
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [addedToList, setAddedToList] = useState(null);
    const [activeTab, setActiveTab] = useState('saved'); // Default to saved recipes
    const location = useLocation();
    
    const { data: mealsData, isLoading } = useSearchMeals(searchQuery);
    const { data: allSavedItems = [], refetch: refetchSaved } = useSavedItems();
    const saveMealMutation = useSaveMeal();
    const deleteItemMutation = useDeleteItem();
    
    const meals = mealsData?.meals || [];
    const savedMeals = allSavedItems.filter(item => item.type === 'meal');

    useEffect(() => {
        if (location.state?.savedItem) {
            const item = location.state.savedItem;
            setActiveTab('saved');
            openSavedMealDetails(item);
            window.history.replaceState({}, document.title);
        } else if (location.state?.tab === 'saved') {
            setActiveTab('saved');
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSearch = () => {
        if (query.trim()) {
            setSearchQuery(query);
            setSelectedMeal(null);
        }
    };

    const handleSave = (meal) => {
        saveMealMutation.mutate(meal, {
            onSuccess: () => {
                refetchSaved();
                alert("Recipe saved successfully!");
            },
            onError: (error) => {
                console.error("Error saving meal:", error);
                alert("Failed to save recipe");
            },
        });
    };

    const handleDelete = (itemId) => {
        if (window.confirm('Remove this recipe from your saved items?')) {
            deleteItemMutation.mutate(itemId, {
                onSuccess: () => {
                    refetchSaved();
                    alert('Recipe removed successfully!');
                },
                onError: (error) => {
                    console.error('Error deleting recipe:', error);
                    alert('Failed to remove recipe');
                },
            });
        }
    };

    const openMealDetails = (meal) => {
        setSelectedMeal(meal);
    };

    const openSavedMealDetails = (savedItem) => {
        const meal = {
            idMeal: savedItem.external_id,
            strMeal: savedItem.title,
            strMealThumb: savedItem.metadata?.thumbnail,
            strCategory: savedItem.metadata?.category,
            strArea: savedItem.metadata?.area,
            strInstructions: savedItem.metadata?.instructions,
            strYoutube: savedItem.metadata?.youtube,
            strTags: savedItem.metadata?.tags,
            savedItemId: savedItem.id,
            ...savedItem.metadata?.ingredients?.reduce((acc, ing, idx) => {
                acc[`strIngredient${idx + 1}`] = ing.ingredient;
                acc[`strMeasure${idx + 1}`] = ing.measure;
                return acc;
            }, {})
        };
        setSelectedMeal(meal);
    };

    const closeMealDetails = () => {
        setSelectedMeal(null);
    };

    const handleAddToList = (ingredient, measure) => {
        slAdd('food', ingredient, measure);
        setAddedToList(ingredient);
        setTimeout(() => setAddedToList(null), 1500);
    };

    return (
        <div className="glass-page">
            <div className="glass-container">
                <div className="glass-page-header">
                    <h2>🍽️ Food & Recipes</h2>
                    <p className="subtitle">Discover delicious recipes from around the world</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <button 
                        className={activeTab === 'search' ? 'glass-btn' : 'glass-btn-secondary'}
                        onClick={() => { 
                            setActiveTab('search'); 
                            setSelectedMeal(null);
                        }}
                        style={{ minWidth: '200px' }}
                    >
                        🔍 Search Recipes
                    </button>
                    <button 
                        className={activeTab === 'saved' ? 'glass-btn' : 'glass-btn-secondary'}
                        onClick={() => { 
                            setActiveTab('saved');
                            setSearchQuery('');
                            setSelectedMeal(null);
                        }}
                        style={{ minWidth: '200px' }}
                    >
                        📖 My Saved Recipes ({savedMeals.length})
                    </button>
                </div>

                {activeTab === 'search' && (
                    <>
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
                                <div 
                                    key={meal.idMeal} 
                                    className="glass-item-card"
                                    onClick={() => openMealDetails(meal)}
                                    style={{ cursor: 'pointer' }}
                                >
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
                    </>
                )}

                {activeTab === 'saved' && (
                    <>
                        {savedMeals.length === 0 ? (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">📖</span>
                                <h3>No Saved Recipes Yet</h3>
                                <p>Search and save your favorite recipes to see them here</p>
                                <button 
                                    className="glass-btn"
                                    onClick={() => setActiveTab('search')}
                                >
                                    🔍 Search Recipes
                                </button>
                            </div>
                        ) : (
                            <div className="glass-grid">
                                {savedMeals.map(item => (
                                    <div 
                                        key={item.id} 
                                        className="glass-item-card"
                                        style={{ position: 'relative' }}
                                    >
                                        <div onClick={() => openSavedMealDetails(item)} style={{ cursor: 'pointer' }}>
                                            {item.metadata?.thumbnail && (
                                                <img 
                                                    src={item.metadata.thumbnail} 
                                                    alt={item.title} 
                                                    className="glass-item-image" 
                                                />
                                            )}
                                            <div className="glass-item-info">
                                                <h3 className="glass-item-title">{item.title}</h3>
                                                <div className="glass-item-meta">
                                                    {item.metadata?.category && (
                                                        <span className="glass-meta-tag">🍽️ {item.metadata.category}</span>
                                                    )}
                                                    {item.metadata?.area && (
                                                        <span className="glass-meta-tag">🌍 {item.metadata.area}</span>
                                                    )}
                                                </div>
                                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                    Saved {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            className="glass-btn-secondary"
                                            disabled={deleteItemMutation.isLoading}
                                            style={{ 
                                                position: 'absolute', 
                                                top: '0.5rem', 
                                                right: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                                zIndex: 10
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {selectedMeal && (
                    <div 
                        style={{ 
                            position: 'fixed', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            background: 'rgba(0,0,0,0.85)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 1000,
                            padding: '2rem',
                            animation: 'fadeIn 0.3s ease-out',
                            overflowY: 'auto'
                        }} 
                        onClick={closeMealDetails}
                    >
                        <div 
                            className="glass-card" 
                            style={{ 
                                maxWidth: '900px', 
                                width: '100%', 
                                maxHeight: '90vh', 
                                overflow: 'auto',
                                animation: 'slideInUp 0.3s ease-out',
                                margin: '2rem auto'
                            }} 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={closeMealDetails} 
                                style={{ 
                                    float: 'right', 
                                    background: 'none', 
                                    border: 'none', 
                                    fontSize: '2rem', 
                                    cursor: 'pointer', 
                                    color: 'var(--text-primary)',
                                    padding: '0.5rem'
                                }}
                            >
                                ✕
                            </button>

                            <img 
                                src={selectedMeal.strMealThumb} 
                                alt={selectedMeal.strMeal}
                                style={{ 
                                    width: '100%', 
                                    height: '300px', 
                                    objectFit: 'cover', 
                                    borderRadius: 'var(--radius-lg)',
                                    marginBottom: '1.5rem'
                                }}
                            />

                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '2rem' }}>
                                {selectedMeal.strMeal}
                            </h2>

                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                <span className="glass-meta-tag" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                                    🍽️ {selectedMeal.strCategory}
                                </span>
                                <span className="glass-meta-tag" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                                    🌍 {selectedMeal.strArea}
                                </span>
                                {selectedMeal.strTags && (
                                    <span className="glass-meta-tag" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                                        🏷️ {selectedMeal.strTags}
                                    </span>
                                )}
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>
                                    🥘 Ingredients
                                </h3>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                                    gap: '0.75rem' 
                                }}>
                                    {extractIngredients(selectedMeal).map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                padding: '0.75rem 1rem', 
                                                background: 'rgba(255, 255, 255, 0.05)', 
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
                                            }}
                                        >
                                            <span style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                                                <strong>{item.measure}</strong> {item.ingredient}
                                            </span>
                                            <button
                                                onClick={() => handleAddToList(item.ingredient, item.measure)}
                                                title="Add to shopping list"
                                                style={{
                                                    background: addedToList === item.ingredient ? 'rgba(134,239,172,0.2)' : 'rgba(249,115,22,0.15)',
                                                    border: addedToList === item.ingredient ? '1px solid rgba(134,239,172,0.4)' : '1px solid rgba(249,115,22,0.3)',
                                                    borderRadius: '8px', color: addedToList === item.ingredient ? '#86efac' : '#f97316',
                                                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                                    padding: '0.3rem 0.6rem', whiteSpace: 'nowrap', flexShrink: 0
                                                }}
                                            >
                                                {addedToList === item.ingredient ? '✓ Added' : '+ List'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>
                                    📖 Cooking Instructions
                                </h3>
                                <div style={{ 
                                    background: 'rgba(255, 255, 255, 0.03)', 
                                    padding: '1.5rem', 
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <p style={{ 
                                        color: 'var(--text-secondary)', 
                                        lineHeight: '1.8', 
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '1.05rem'
                                    }}>
                                        {selectedMeal.strInstructions}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {selectedMeal.savedItemId ? (
                                    <button 
                                        className="glass-btn-secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(selectedMeal.savedItemId);
                                            closeMealDetails();
                                        }}
                                        disabled={deleteItemMutation.isLoading}
                                        style={{ 
                                            flex: '1', 
                                            minWidth: '200px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            borderColor: 'rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        🗑️ Remove from Saved
                                    </button>
                                ) : (
                                    <button 
                                        className="glass-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSave(selectedMeal);
                                        }}
                                        disabled={saveMealMutation.isLoading}
                                        style={{ flex: '1', minWidth: '200px' }}
                                    >
                                        {saveMealMutation.isLoading ? '💾 Saving...' : '💾 Save Recipe'}
                                    </button>
                                )}
                                
                                {selectedMeal.strYoutube && (
                                    <a 
                                        href={selectedMeal.strYoutube} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="glass-btn-secondary"
                                        style={{ 
                                            flex: '1', 
                                            minWidth: '200px',
                                            textDecoration: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        📺 Watch Video Tutorial
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodPage;