import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSavedItems, useDeleteItem, useSaveBook } from "@/api/queries";
import { searchBooks } from "@/api/services/bookService";
import "@/styles/GlassDesignSystem.css";
import "@/styles/features/Books.css";
import { useToast, ToastContainer } from '@/components/ui/Toast';

// ═══════════════════════════════════════════════════════════════
// Book Discovery Page
// ═══════════════════════════════════════════════════════════════

const BooksPage = () => {
    const { toasts, toast, removeToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('search');
    const location = useLocation();
    const [selectedBook, setSelectedBook] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [backgroundBooks, setBackgroundBooks] = useState([]);
    const [savedBooksData, setSavedBooksData] = useState({});

    const { data: allSavedItems = [], refetch: refetchSaved } = useSavedItems();
    const deleteItemMutation = useDeleteItem();
    const saveBookMutation = useSaveBook();
    const savedBooks = allSavedItems.filter(item => item.type === 'book');

    // ─── Handle navigation from Dashboard ─────────────────────
    useEffect(() => {
        if (location.state?.tab === 'saved') {
            setActiveTab('saved');
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // ─── Load background book cover mosaic ────────────────────
    useEffect(() => {
        const fetchBackgroundBooks = async () => {
            try {
                const genres = ['fiction', 'fantasy', 'mystery', 'science', 'history'];
                const randomGenre = genres[Math.floor(Math.random() * genres.length)];
                
                const data = await searchBooks(randomGenre);
                const booksWithCovers = data.docs?.filter(book => book.cover_i).slice(0, 30) || [];
                setBackgroundBooks(booksWithCovers);
            } catch (error) {
                console.error('Error loading background books:', error);
            }
        };

        fetchBackgroundBooks();
    }, []);

    // ─── Event Handlers ───────────────────────────────────────

    const handleSearch = async (queryOverride = null) => {
        const query = queryOverride || searchQuery;
        if (!query.trim()) return;
        
        setIsLoading(true);
        try {
            const data = await searchBooks(query);
            setBooks(data.docs || []);
            setActiveTab('search');
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookClick = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const handleSave = (book) => {
        saveBookMutation.mutate(book, {
            onSuccess: (result) => {
                if (result?.id) {
                    setSavedBooksData(prev => ({
                        ...prev,
                        [result.id]: book
                    }));
                }
                refetchSaved();
                toast.success("Book saved to your collection!");
            },
            onError: (error) => {
                if (error.response?.status === 409) {
                    toast.info("This book is already in your collection!");
                } else {
                    console.error("Error saving book:", error);
                    toast.error("Failed to save book");
                }
            }
        });
    };

    const handleDelete = (itemId) => {
        deleteItemMutation.mutate(itemId, {
            onSuccess: () => {
                refetchSaved();
                toast.success('Book removed from collection');
            },
            onError: (error) => {
                console.error('Error deleting:', error);
                toast.error('Failed to remove book');
            }
        });
    };

    // ─── Helper Functions ─────────────────────────────────────

    const isBookSaved = (book) => {
        if (!book) return false;
        return savedBooks.some(saved => 
            saved.external_id === book.key || 
            saved.title === book.title
        );
    };

    const getSavedItemId = (book) => {
        if (!book) return null;
        const saved = savedBooks.find(saved => 
            saved.external_id === book.key || 
            saved.title === book.title
        );
        return saved?.id || null;
    };

    // ─── Render ───────────────────────────────────────────────

    return (
        <div className="glass-page">
            {/* ─── Background Book Mosaic ────────────────────── */}
            <div className="books-mosaic-background">
                <div className="books-mosaic-grid">
                    {backgroundBooks.map((book, index) => (
                        <div 
                            key={`${book.cover_i}-${index}`}
                            className="books-mosaic-tile"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <img 
                                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                                alt="Book cover"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-container books-content-overlay">
                {/* ─── Header ───────────────────────────────── */}
                <div className="glass-page-header">
                    <h2>📚 Book Discovery</h2>
                    <p className="subtitle">Explore millions of books from Open Library</p>
                </div>

                {/* ─── Tab Switcher ─────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button 
                        className="glass-tab active"
                        onClick={() => setActiveTab(activeTab === 'saved' ? 'search' : 'saved')}
                        style={{ maxWidth: '400px' }}
                    >
                        {activeTab === 'saved' ? '🔍 Back to Search' : `📖 View Saved Books (${savedBooks.length})`}
                    </button>
                </div>

                {/* ─── Search Tab ────────────────────────────── */}
                {activeTab === 'search' && (
                    <>
                        <div className="glass-search-section">
                            <div className="glass-search-box">
                                <input 
                                    type="text"
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)} 
                                    placeholder="Search books by title, author, or ISBN..."
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
                                <p>Searching book collections...</p>
                            </div>
                        )}

                        {books.length > 0 && !isLoading && (
                            <div className="glass-grid">
                                {books.map((book, index) => (
                                    <div 
                                        key={`${book.key}-${index}`}
                                        className="glass-item-card books-clickable"
                                        onClick={() => handleBookClick(book)}
                                    >
                                        {book.cover_i && (
                                            <img 
                                                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                                                alt={book.title}
                                                className="books-card-image"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="books-card-content">
                                            <h3 className="books-card-title">
                                                {book.title}
                                            </h3>
                                            <p className="books-card-author">
                                                {book.author_name?.join(', ') || "Unknown Author"}
                                            </p>
                                            {book.first_publish_year && (
                                                <p className="books-card-year">
                                                    📅 {book.first_publish_year}
                                                </p>
                                            )}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSave(book);
                                                }}
                                                className="glass-btn"
                                                disabled={saveBookMutation.isLoading}
                                            >
                                                {saveBookMutation.isLoading ? '💾 Saving...' : '💾 Save'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ─── Empty States ───────────────────── */}
                        {books.length === 0 && !isLoading && searchQuery && (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">📚</span>
                                <h3>No Books Found</h3>
                                <p>Try searching for different titles or authors</p>
                                <div className="glass-suggestion-tags">
                                    <button onClick={() => { setSearchQuery('Harry Potter'); handleSearch('Harry Potter'); }}>Harry Potter</button>
                                    <button onClick={() => { setSearchQuery('Tolkien'); handleSearch('Tolkien'); }}>Tolkien</button>
                                    <button onClick={() => { setSearchQuery('Stephen King'); handleSearch('Stephen King'); }}>Stephen King</button>
                                </div>
                            </div>
                        )}

                        {!searchQuery && (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">📚</span>
                                <h3>Discover Books</h3>
                                <p>Search for books by title, author, or genre</p>
                                <div className="glass-suggestion-tags">
                                    <button onClick={() => { setSearchQuery('Science Fiction'); handleSearch('Science Fiction'); }}>Science Fiction</button>
                                    <button onClick={() => { setSearchQuery('Mystery'); handleSearch('Mystery'); }}>Mystery</button>
                                    <button onClick={() => { setSearchQuery('Fantasy'); handleSearch('Fantasy'); }}>Fantasy</button>
                                    <button onClick={() => { setSearchQuery('Biography'); handleSearch('Biography'); }}>Biography</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ─── Saved Tab ─────────────────────────────── */}
                {activeTab === 'saved' && (
                    <>
                        {savedBooks.length > 0 ? (
                            <div className="glass-grid">
                                {savedBooks.map(item => (
                                    <div 
                                        key={item.id} 
                                        className="glass-item-card books-clickable"
                                        onClick={() => {
                                            const bookData = savedBooksData[item.id] || {
                                                title: item.title,
                                                author_name: [item.metadata?.author || item.description?.replace('By ', '')],
                                                first_publish_year: item.metadata?.year,
                                                cover_i: item.metadata?.coverId,
                                                publisher: item.metadata?.publisher ? [item.metadata.publisher] : [],
                                                number_of_pages_median: item.metadata?.pages,
                                                isbn: item.metadata?.isbn ? [item.metadata.isbn] : [],
                                                subject: item.metadata?.subjects || []
                                            };
                                            setSelectedBook(bookData);
                                            setShowModal(true);
                                        }}
                                        style={{ position: 'relative' }}
                                    >
                                        {item.metadata?.coverUrl && (
                                            <img 
                                                src={item.metadata.coverUrl}
                                                alt={item.title}
                                                className="books-card-image"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="books-card-content">
                                            <h3 className="books-card-title">
                                                {item.title}
                                            </h3>
                                            <p className="books-card-author">
                                                {item.metadata?.author || "Unknown Author"}
                                            </p>
                                            {item.metadata?.year && (
                                                <p className="books-card-year">
                                                    📅 {item.metadata.year}
                                                </p>
                                            )}
                                            <p className="books-card-saved-date">
                                                Saved {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                                className="glass-btn-secondary books-remove-btn"
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
                                <span className="glass-empty-icon">📚</span>
                                <h3>No Saved Books</h3>
                                <p>Search for books and save your favorites here</p>
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

            {/* ─── Book Detail Modal ─────────────────────────── */}
            {showModal && selectedBook && (
                <div className="books-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="books-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="books-modal-close"
                            onClick={() => setShowModal(false)}
                        >
                            ✕
                        </button>
                        
                        <div className="books-modal-layout">
                            {/* ─── Left: Cover ───────────────── */}
                            <div className="books-modal-image-section">
                                {selectedBook.cover_i ? (
                                    <img 
                                        src={`https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg`}
                                        alt={selectedBook.title}
                                        className="books-modal-image"
                                    />
                                ) : (
                                    <div className="books-no-cover">
                                        <span>📚</span>
                                        <p>No Cover Available</p>
                                    </div>
                                )}
                            </div>

                            {/* ─── Right: Details ─────────────── */}
                            <div className="books-modal-details">
                                <h2 className="books-modal-title">
                                    {selectedBook.title}
                                </h2>
                                
                                {selectedBook.subtitle && (
                                    <p className="books-modal-subtitle">
                                        {selectedBook.subtitle}
                                    </p>
                                )}
                                
                                <div className="books-modal-info">
                                    <div className="books-info-item">
                                        <span className="books-info-label">✍️ Author:</span>
                                        <span className="books-info-value">
                                            {selectedBook.author_name?.join(', ') || "Unknown"}
                                        </span>
                                    </div>

                                    {selectedBook.first_publish_year && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">📅 First Published:</span>
                                            <span className="books-info-value">{selectedBook.first_publish_year}</span>
                                        </div>
                                    )}

                                    {selectedBook.publish_year && selectedBook.publish_year.length > 0 && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">📚 Editions:</span>
                                            <span className="books-info-value">
                                                {selectedBook.edition_count || selectedBook.publish_year.length} editions 
                                                ({Math.min(...selectedBook.publish_year)} - {Math.max(...selectedBook.publish_year)})
                                            </span>
                                        </div>
                                    )}

                                    {selectedBook.publisher && selectedBook.publisher.length > 0 && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">🏢 Publishers:</span>
                                            <span className="books-info-value">
                                                {selectedBook.publisher.slice(0, 3).join(', ')}
                                                {selectedBook.publisher.length > 3 && ` +${selectedBook.publisher.length - 3} more`}
                                            </span>
                                        </div>
                                    )}

                                    {selectedBook.number_of_pages_median && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">📄 Pages:</span>
                                            <span className="books-info-value">{selectedBook.number_of_pages_median}</span>
                                        </div>
                                    )}

                                    {selectedBook.language && selectedBook.language.length > 0 && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">🌍 Languages:</span>
                                            <span className="books-info-value">
                                                {selectedBook.language.slice(0, 5).join(', ').toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {selectedBook.isbn && selectedBook.isbn[0] && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">🔢 ISBN:</span>
                                            <span className="books-info-value">{selectedBook.isbn[0]}</span>
                                        </div>
                                    )}

                                    {selectedBook.ratings_average && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">⭐ Rating:</span>
                                            <span className="books-info-value">
                                                {selectedBook.ratings_average.toFixed(2)} / 5.0
                                                {selectedBook.ratings_count && ` (${selectedBook.ratings_count.toLocaleString()} ratings)`}
                                            </span>
                                        </div>
                                    )}

                                    {selectedBook.ebook_access && selectedBook.ebook_access !== 'no_ebook' && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">📱 eBook:</span>
                                            <span className="books-info-value">
                                                {selectedBook.ebook_access === 'borrowable' && '✅ Available to borrow'}
                                                {selectedBook.ebook_access === 'public' && '✅ Public domain'}
                                                {selectedBook.ebook_access === 'printdisabled' && '🔒 Print disabled access'}
                                            </span>
                                        </div>
                                    )}

                                    {selectedBook.has_fulltext && (
                                        <div className="books-info-item">
                                            <span className="books-info-label">📄 Full Text:</span>
                                            <span className="books-info-value">✅ Available online</span>
                                        </div>
                                    )}
                                </div>

                                {/* ─── Reading Stats ──────────── */}
                                {(selectedBook.want_to_read_count || selectedBook.currently_reading_count || selectedBook.already_read_count) && (
                                    <div className="books-modal-description">
                                        <h3>📊 Reading Statistics</h3>
                                        <div className="books-stats-grid">
                                            {selectedBook.want_to_read_count > 0 && (
                                                <div className="books-stat">
                                                    <div className="books-stat-value">{selectedBook.want_to_read_count.toLocaleString()}</div>
                                                    <div className="books-stat-label">Want to Read</div>
                                                </div>
                                            )}
                                            {selectedBook.currently_reading_count > 0 && (
                                                <div className="books-stat">
                                                    <div className="books-stat-value">{selectedBook.currently_reading_count.toLocaleString()}</div>
                                                    <div className="books-stat-label">Currently Reading</div>
                                                </div>
                                            )}
                                            {selectedBook.already_read_count > 0 && (
                                                <div className="books-stat">
                                                    <div className="books-stat-value">{selectedBook.already_read_count.toLocaleString()}</div>
                                                    <div className="books-stat-label">Already Read</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ─── First Sentence ─────────── */}
                                {selectedBook.first_sentence && selectedBook.first_sentence.length > 0 && (
                                    <div className="books-modal-description">
                                        <h3>📜 Opening Line</h3>
                                        <p className="books-opening-line">
                                            "{selectedBook.first_sentence[0]}"
                                        </p>
                                    </div>
                                )}

                                {/* ─── Subjects/Genres ─────────── */}
                                {selectedBook.subject && selectedBook.subject.length > 0 && (
                                    <div className="books-modal-subjects">
                                        <h3>🏷️ Subjects & Genres</h3>
                                        <div className="books-subject-tags">
                                            {selectedBook.subject.slice(0, 12).map((subject, index) => (
                                                <span key={index} className="books-subject-tag">
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ─── People Featured ─────────── */}
                                {selectedBook.person && selectedBook.person.length > 0 && (
                                    <div className="books-modal-subjects">
                                        <h3>👤 People Featured</h3>
                                        <div className="books-subject-tags">
                                            {selectedBook.person.slice(0, 8).map((person, index) => (
                                                <span key={index} className="books-subject-tag">
                                                    {person}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ─── Places Featured ─────────── */}
                                {selectedBook.place && selectedBook.place.length > 0 && (
                                    <div className="books-modal-subjects">
                                        <h3>🗺️ Places Featured</h3>
                                        <div className="books-subject-tags">
                                            {selectedBook.place.slice(0, 8).map((place, index) => (
                                                <span key={index} className="books-subject-tag">
                                                    {place}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ─── Action Button ───────────── */}
                                {isBookSaved(selectedBook) ? (
                                    <button 
                                        onClick={() => {
                                            const savedId = getSavedItemId(selectedBook);
                                            if (savedId) {
                                                handleDelete(savedId);
                                                setShowModal(false);
                                            }
                                        }}
                                        className="glass-btn-secondary books-remove-btn"
                                        disabled={deleteItemMutation.isLoading}
                                    >
                                        {deleteItemMutation.isLoading ? '🗑️ Removing...' : '🗑️ Remove from Collection'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleSave(selectedBook)}
                                        className="glass-btn"
                                        style={{ marginTop: '2rem' }}
                                        disabled={saveBookMutation.isLoading}
                                    >
                                        {saveBookMutation.isLoading ? '💾 Saving...' : '💾 Save to Collection'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default BooksPage;