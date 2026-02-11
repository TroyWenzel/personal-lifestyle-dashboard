import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getSavedItems, deleteItem } from "../../api/contentService";
import "./Dashboard.css";

function Dashboard() {
    const {logout} = useContext(AuthContext);
    const navigate = useNavigate();
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const items = await getSavedItems();
                setSavedItems(items);
            } catch (error) {
                console.error("Error fetching saved items:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleDelete = async (itemId) => {
        try {
            await deleteItem(itemId);
            setSavedItems(savedItems.filter(item => item.id !== itemId));
            alert("Item deleted!");
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item");
        }
    };

    const handleGoToFood = () => {
        navigate("/food");
    };

    if (loading) {
        return (
            <div className="dashboard-container">Loading...</div>
        );
    }

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p className="welcome-text">
                Welcome! You have {savedItems.length} saved item(s).
            </p>
            
            <div className="button-container">
                <button className="btn btn-primary" onClick={handleGoToFood}>
                    Search for Food
                </button>
                <button className="btn btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <h2>Your Saved Items</h2>
            
            {savedItems.length === 0 ? (
                <p className="no-items">No saved items yet. Go search for some meals!</p>
            ) : (
                <div className="items-container">
                    {savedItems.map(item => (
                        <div key={item.id} className="saved-item-card">
                            <h3 className="item-title">{item.title}</h3>
                            
                            <div className="item-details">
                                <p><strong>Category:</strong> {item.category}</p>
                                
                                {item.metadata?.area && (
                                    <p><strong>Cuisine:</strong> {item.metadata.area}</p>
                                )}
                                
                                {item.user_notes && (
                                    <p className="item-notes">
                                        <strong>Notes:</strong> {item.user_notes}
                                    </p>
                                )}
                            </div>
                            
                            {item.metadata?.thumbnail && (
                                <img 
                                    src={item.metadata.thumbnail} 
                                    alt={item.title}
                                    className="item-thumbnail"
                                />
                            )}
                            
                            <button 
                                className="btn btn-delete"
                                onClick={() => handleDelete(item.id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;