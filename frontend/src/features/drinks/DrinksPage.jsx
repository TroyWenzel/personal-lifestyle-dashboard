import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSavedItems, useDeleteItem, useSaveDrink } from "@/api/queries";
import { searchCocktails } from "@/api/services/drinkService";
import "@/styles/GlassDesignSystem.css";
import "@/styles/features/Drinks.css";
import { addItem as slAdd } from "@/api/services/shoppingListService";

const DrinksPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [drinks, setDrinks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('search');
    const location = useLocation();
    const [selectedDrink, setSelectedDrink] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [addedToList, setAddedToList] = useState(null);
    const [savedDrinksData, setSavedDrinksData] = useState({}); // Store full drink data

    const { data: allSavedItems = [] } = useSavedItems();
    const deleteItemMutation = useDeleteItem();
    const saveDrinkMutation = useSaveDrink();
    const savedDrinks = allSavedItems.filter(item => item.type === 'drink');

    // Switch to saved tab when navigated here from Dashboard
    useEffect(() => {
        if (location.state?.tab === 'saved') {
            setActiveTab('saved');
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSearch = async (queryOverride = null) => {
        const query = queryOverride || searchQuery;
        if (!query.trim()) return;
        
        setIsLoading(true);
        try {
            const data = await searchCocktails(query);
            setDrinks(data.drinks || []);
            setActiveTab('search');
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search drinks');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrinkClick = (drink) => {
        setSelectedDrink(drink);
        setShowModal(true);
    };

    const getIngredients = (drink) => {
        const ingredients = [];
        for (let i = 1; i <= 15; i++) {
            const ingredient = drink[`strIngredient${i}`];
            const measure = drink[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient,
                    measure: measure || ''
                });
            }
        }
        return ingredients;
    };

    const handleSave = (drink) => {
        saveDrinkMutation.mutate(drink, {
            onSuccess: (result) => {
                // Store the full drink data for later viewing
                if (result?.id) {
                    setSavedDrinksData(prev => ({
                        ...prev,
                        [result.id]: drink
                    }));
                }
                alert("Drink saved successfully!");
            },
            onError: (error) => {
                console.error("Error saving drink:", error);
                alert("Failed to save drink");
            }
        });
    };

    const handleDelete = (itemId) => {
        deleteItemMutation.mutate(itemId, {
            onSuccess: () => alert('Drink removed!'),
            onError: (error) => {
                console.error('Error deleting:', error);
                alert('Failed to remove drink');
            }
        });
    };

    const handleAddToList = (name, measure) => {
        slAdd('drinks', name, measure);
        setAddedToList(name);
        setTimeout(() => setAddedToList(null), 1500);
    };

    return (
        <div className="glass-page">
            {/* Bar Background - using local image */}
            <div className="drinks-bar-background">
                <img 
                    src="/assets/Bar_Background.jpg"
                    alt="Bar background"
                    className="drinks-bar-image"
                />
            </div>

            <div className="glass-container drinks-content-overlay">
                <div className="glass-page-header">
                    <h2>🍸 Cocktail Bar</h2>
                    <p className="subtitle">Discover amazing cocktail recipes from around the world</p>
                </div>

                {/* Single button for Saved Collection */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button 
                        className="glass-tab active"
                        onClick={() => setActiveTab(activeTab === 'saved' ? 'search' : 'saved')}
                        style={{ maxWidth: '400px' }}
                    >
                        {activeTab === 'saved' ? '🔍 Back to Search' : `🍹 View Saved Drinks (${savedDrinks.length})`}
                    </button>
                </div>

                {activeTab === 'search' && (
                    <>
                        <div className="glass-search-section">
                            <div className="glass-search-box">
                                <input 
                                    type="text"
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)} 
                                    placeholder="Search cocktails (e.g., Margarita, Mojito, Martini)..."
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
                                <p>Searching cocktail recipes...</p>
                            </div>
                        )}

                        {drinks && drinks.length > 0 && !isLoading && (
                            <div className="glass-grid">
                                {drinks.map((drink) => (
                                    <div 
                                        key={drink.idDrink}
                                        className="glass-item-card drinks-clickable"
                                        onClick={() => handleDrinkClick(drink)}
                                    >
                                        <img 
                                            src={drink.strDrinkThumb}
                                            alt={drink.strDrink}
                                            style={{
                                                width: '100%',
                                                height: '250px',
                                                objectFit: 'contain',
                                                borderRadius: '12px 12px 0 0',
                                                background: 'rgba(0, 0, 0, 0.05)'
                                            }}
                                            loading="lazy"
                                        />
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                marginBottom: '0.5rem',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {drink.strDrink}
                                            </h3>
                                            <p style={{ 
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}>
                                                🍸 {drink.strCategory}
                                            </p>
                                            <p style={{ 
                                                fontSize: '0.85rem',
                                                color: 'var(--text-tertiary)',
                                                marginBottom: '1rem'
                                            }}>
                                                {drink.strAlcoholic} • {drink.strGlass}
                                            </p>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSave(drink);
                                                }}
                                                className="glass-btn"
                                            >
                                                💾 Save
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(!drinks || drinks.length === 0) && !isLoading && searchQuery && (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">🍸</span>
                                <h3>No Cocktails Found</h3>
                                <p>Try searching for different drink names</p>
                                <div className="glass-suggestion-tags">
                                    <button onClick={() => { setSearchQuery('Margarita'); handleSearch('Margarita'); }}>Margarita</button>
                                    <button onClick={() => { setSearchQuery('Mojito'); handleSearch('Mojito'); }}>Mojito</button>
                                    <button onClick={() => { setSearchQuery('Martini'); handleSearch('Martini'); }}>Martini</button>
                                </div>
                            </div>
                        )}

                        {!searchQuery && (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">🍸</span>
                                <h3>Discover Cocktails</h3>
                                <p>Search for your favorite drinks and cocktails</p>
                                <div className="glass-suggestion-tags">
                                    <button onClick={() => { setSearchQuery('Vodka'); handleSearch('Vodka'); }}>Vodka</button>
                                    <button onClick={() => { setSearchQuery('Rum'); handleSearch('Rum'); }}>Rum</button>
                                    <button onClick={() => { setSearchQuery('Tequila'); handleSearch('Tequila'); }}>Tequila</button>
                                    <button onClick={() => { setSearchQuery('Whiskey'); handleSearch('Whiskey'); }}>Whiskey</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'saved' && (
                    <>
                        {savedDrinks.length > 0 ? (
                            <div className="glass-grid">
                                {savedDrinks.map(item => (
                                    <div 
                                        key={item.id} 
                                        className="glass-item-card drinks-clickable"
                                        onClick={() => {
                                            // Reconstruct drink data from saved metadata
                                            const drinkData = savedDrinksData[item.id] || {
                                                idDrink: item.external_id,
                                                strDrink: item.title,
                                                strDrinkThumb: item.metadata?.thumbnail,
                                                strCategory: item.metadata?.category,
                                                strAlcoholic: item.metadata?.alcoholic,
                                                strGlass: item.metadata?.glass,
                                                strInstructions: item.metadata?.instructions,
                                                ...Object.fromEntries(
                                                    item.metadata?.ingredients?.map((ing, i) => [
                                                        [`strIngredient${i + 1}`, ing.name],
                                                        [`strMeasure${i + 1}`, ing.measure]
                                                    ]).flat() || []
                                                )
                                            };
                                            setSelectedDrink(drinkData);
                                            setShowModal(true);
                                        }}
                                    >
                                        {item.metadata?.thumbnail && (
                                            <img 
                                                src={item.metadata.thumbnail}
                                                alt={item.title}
                                                style={{
                                                    width: '100%',
                                                    height: '250px',
                                                    objectFit: 'contain',
                                                    borderRadius: '12px 12px 0 0',
                                                    background: 'rgba(0, 0, 0, 0.05)'
                                                }}
                                                loading="lazy"
                                            />
                                        )}
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                marginBottom: '0.5rem',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {item.title}
                                            </h3>
                                            <p style={{ 
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.5rem'
                                            }}>
                                                🍸 {item.metadata?.category}
                                            </p>
                                            <p style={{ 
                                                fontSize: '0.8rem',
                                                color: 'var(--text-tertiary)',
                                                marginBottom: '1rem'
                                            }}>
                                                Saved {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent card click
                                                    handleDelete(item.id);
                                                }}
                                                className="glass-btn-secondary"
                                                disabled={deleteItemMutation.isLoading}
                                            >
                                                🗑️ Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">🍸</span>
                                <h3>No Saved Drinks</h3>
                                <p>Search for cocktails and save your favorites here</p>
                                <button 
                                    onClick={() => setActiveTab('search')}
                                    className="glass-btn"
                                >
                                    Start Exploring
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Drink Recipe Modal with Full Image Background */}
            {showModal && selectedDrink && (
                <div className="drinks-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="drinks-modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Full drink image background */}
                        <div 
                            className="drinks-modal-bg-full"
                            style={{
                                backgroundImage: `url(${selectedDrink.strDrinkThumb})`,
                            }}
                        ></div>
                        
                        <button 
                            className="drinks-modal-close"
                            onClick={() => setShowModal(false)}
                        >
                            ✕
                        </button>
                        
                        <div className="drinks-modal-layout-new">
                            {/* Left side - Featured drink image */}
                            <div className="drinks-featured-section">
                                <div className="drinks-featured-frame">
                                    <img 
                                        src={selectedDrink.strDrinkThumb}
                                        alt={selectedDrink.strDrink}
                                        className="drinks-featured-image"
                                    />
                                    <div className="drinks-featured-glow"></div>
                                </div>
                                <h2 className="drinks-featured-title">{selectedDrink.strDrink}</h2>
                                <div className="drinks-featured-badges">
                                    <span className="drinks-badge-new">{selectedDrink.strCategory}</span>
                                    <span className="drinks-badge-new">{selectedDrink.strAlcoholic}</span>
                                    <span className="drinks-badge-new">🥃 {selectedDrink.strGlass}</span>
                                </div>
                            </div>

                            {/* Right side - Recipe details */}
                            <div className="drinks-recipe-section">
                                <div className="drinks-ingredients-box">
                                    <h3>🍹 Ingredients</h3>
                                    <ul className="drinks-ingredients-list-new">
                                        {getIngredients(selectedDrink).map((ing, index) => (
                                            <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className="ingredient-measure-new">{ing.measure}</span>
                                                <span className="ingredient-name-new" style={{ flex: 1 }}>{ing.name}</span>
                                                <button
                                                    onClick={() => handleAddToList(ing.name, ing.measure)}
                                                    title="Add to shopping list"
                                                    style={{
                                                        background: addedToList === ing.name ? 'rgba(134,239,172,0.2)' : 'rgba(167,139,250,0.15)',
                                                        border: addedToList === ing.name ? '1px solid rgba(134,239,172,0.4)' : '1px solid rgba(167,139,250,0.35)',
                                                        borderRadius: '8px', color: addedToList === ing.name ? '#86efac' : '#a78bfa',
                                                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                                        padding: '0.3rem 0.6rem', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '0.5rem'
                                                    }}
                                                >
                                                    {addedToList === ing.name ? '✓ Added' : '+ List'}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="drinks-instructions-box">
                                    <h3>📝 Instructions</h3>
                                    <p className="drinks-instructions-new">
                                        {selectedDrink.strInstructions}
                                    </p>
                                </div>

                                <button 
                                    onClick={() => handleSave(selectedDrink)}
                                    className="glass-btn drinks-save-btn"
                                >
                                    💾 Save to Collection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrinksPage;