import { useState } from 'react';
import { useSearchBooks, useSaveBook } from '@/api/queries';
import '@/styles/features/Food-Drinks-Art-Books.css';

const BooksPage = () => {
    const [query, setQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // 🚀 TanStack Query
    const { data: booksData, isLoading } = useSearchBooks(searchQuery);
    const saveBookMutation = useSaveBook();

    const books = booksData?.docs?.map(book => ({
        id: book.key,
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        year: book.first_publish_year,
        coverId: book.cover_i,
        subjects: book.subject?.slice(0, 3) || [],
        pages: book.number_of_pages_median || 'N/A',
        isbn: book.isbn?.[0] || ''
    })) || [];

    const handleSearch = () => {
        if (query.trim()) {
            setSearchQuery(query);
        }
    };

    const handleSaveBook = (book) => {
        const bookData = {
            ...book,
            coverUrl: book.coverId 
                ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`
                : null
        };

        saveBookMutation.mutate(bookData, {
            onSuccess: () => {
                alert('Book saved successfully!');
            },
            onError: (error) => {
                console.error('Error saving book:', error);
                alert('Failed to save book');
            },
        });
    };

    return (
        <div className="food-drinks-theme page-content">
            <div className="container">
                <div className="page-header">
                    <h2>📚 Book Discovery</h2>
                    <p className="subtitle">Explore millions of books from Open Library</p>
                </div>

                <div className="search-section">
                    <div className="search-box">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for books by title, author, or subject..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input"
                        />
                        <button 
                            onClick={handleSearch} 
                            disabled={isLoading || !query.trim()}
                            className="search-btn"
                        >
                            {isLoading ? 'Searching...' : '🔍 Search Books'}
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Searching library...</p>
                    </div>
                )}

                {/* Books Grid */}
                <div className="items-grid">
                    {books.map((book) => (
                        <div key={book.id} className="item-card book-card">
                            {book.coverId ? (
                                <img
                                    src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                                    alt={book.title}
                                    className="item-image book-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="book-cover-placeholder">
                                    <span>📖</span>
                                    <span>No Cover</span>
                                </div>
                            )}
                            <div className="item-info">
                                <h3 className="item-title">{book.title}</h3>
                                <div className="item-meta">
                                    <span className="meta-tag">✍️ {book.author}</span>
                                    {book.year && (
                                        <span className="meta-tag">📅 {book.year}</span>
                                    )}
                                </div>
                                {book.subjects.length > 0 && (
                                    <div className="book-subjects">
                                        {book.subjects.slice(0, 2).map((subject, idx) => (
                                            <span key={idx} className="subject-tag">
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => handleSaveBook(book)}
                                    disabled={saveBookMutation.isLoading}
                                    className="save-btn"
                                >
                                    {saveBookMutation.isLoading ? '💾 Saving...' : '💾 Save Book'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {books.length === 0 && !isLoading && searchQuery && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">📚</span>
                            <h3>No books found for "{searchQuery}"</h3>
                            <p>Try searching for:</p>
                            <div className="suggestion-tags">
                                <button onClick={() => { setQuery('harry potter'); setSearchQuery('harry potter'); }}>
                                    Harry Potter
                                </button>
                                <button onClick={() => { setQuery('tolkien'); setSearchQuery('tolkien'); }}>
                                    Tolkien
                                </button>
                                <button onClick={() => { setQuery('science fiction'); setSearchQuery('science fiction'); }}>
                                    Science Fiction
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {books.length === 0 && !isLoading && !searchQuery && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">📖</span>
                            <h3>Discover Your Next Great Read</h3>
                            <p>Search millions of books by title, author, or subject</p>
                            <div className="suggestion-tags">
                                <span className="suggestion-label">Popular searches:</span>
                                <button onClick={() => { setQuery('bestsellers'); setSearchQuery('bestsellers'); }}>
                                    Bestsellers
                                </button>
                                <button onClick={() => { setQuery('fantasy'); setSearchQuery('fantasy'); }}>
                                    Fantasy
                                </button>
                                <button onClick={() => { setQuery('mystery'); setSearchQuery('mystery'); }}>
                                    Mystery
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BooksPage;