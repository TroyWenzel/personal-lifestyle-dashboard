import { useState } from 'react';
import { searchBooks, saveBook } from '../api/bookService';

const BooksPage = () => {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            const data = await searchBooks(query);
            const formattedBooks = data.docs?.map(book => ({
                id: book.key,
                title: book.title,
                author: book.author_name?.[0] || 'Unknown Author',
                year: book.first_publish_year,
                coverId: book.cover_i,
                subjects: book.subject?.slice(0, 3) || [],
                pages: book.number_of_pages_median || 'N/A',
                isbn: book.isbn?.[0] || ''
            })) || [];
            
            setBooks(formattedBooks);
            setSearchPerformed(true);
        } catch (error) {
            console.error('Error searching books:', error);
            alert('Failed to search books');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBook = async (book) => {
        try {
            await saveBook({
                ...book,
                coverUrl: book.coverId 
                    ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`
                    : null
            });
            alert('Book saved successfully!');
        } catch (error) {
            console.error('Error saving book:', error);
            alert('Failed to save book');
        }
    };

    return (
        <div className="books-container">
            <div className="books-header">
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
                        disabled={loading || !query.trim()}
                        className="search-btn"
                    >
                        {loading ? 'Searching...' : '🔍 Search Books'}
                    </button>
                </div>
                <p className="search-hint">
                    Try: "Harry Potter", "Stephen King", "Science Fiction"
                </p>
            </div>

            {searchPerformed && (
                <div className="results-header">
                    <h3>Search Results for "{query}"</h3>
                    <span className="results-count">{books.length} books found</span>
                </div>
            )}

            <div className="books-grid">
                {books.map(book => (
                    <div key={book.id} className="book-card">
                        <div className="book-cover">
                            {book.coverId ? (
                                <img 
                                    src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`}
                                    alt={book.title}
                                    className="book-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = 
                                            '<div class="no-cover">📖</div>';
                                    }}
                                />
                            ) : (
                                <div className="no-cover">📖</div>
                            )}
                        </div>
                        
                        <div className="book-info">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">by {book.author}</p>
                            
                            <div className="book-meta">
                                {book.year && (
                                    <span className="meta-item">📅 {book.year}</span>
                                )}
                                {book.pages && book.pages !== 'N/A' && (
                                    <span className="meta-item">📄 {book.pages} pages</span>
                                )}
                            </div>
                            
                            {book.subjects.length > 0 && (
                                <div className="book-tags">
                                    {book.subjects.map((subject, index) => (
                                        <span key={index} className="tag">
                                            {subject.length > 20 ? subject.substring(0, 20) + '...' : subject}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            <button 
                                onClick={() => handleSaveBook(book)}
                                className="save-book-btn"
                            >
                                📚 Add to Library
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {searchPerformed && books.length === 0 && !loading && (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>No books found</h3>
                    <p>Try a different search term or check your spelling</p>
                </div>
            )}

            {!searchPerformed && !loading && (
                <div className="featured-section">
                    <h3>Popular Categories</h3>
                    <div className="category-tags">
                        <button onClick={() => setQuery('fiction')} className="category-tag">
                            Fiction
                        </button>
                        <button onClick={() => setQuery('science fiction')} className="category-tag">
                            Sci-Fi
                        </button>
                        <button onClick={() => setQuery('mystery')} className="category-tag">
                            Mystery
                        </button>
                        <button onClick={() => setQuery('biography')} className="category-tag">
                            Biography
                        </button>
                        <button onClick={() => setQuery('history')} className="category-tag">
                            History
                        </button>
                        <button onClick={() => setQuery('fantasy')} className="category-tag">
                            Fantasy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksPage;