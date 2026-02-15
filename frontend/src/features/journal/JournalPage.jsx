import { useState } from 'react';
import { useJournalEntries, useCreateJournalEntry, useDeleteJournalEntry } from '@/api/queries';
import '@/styles/features/Hobby-Space-Journal.css';

const JournalPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('neutral');
    const [showForm, setShowForm] = useState(true);

    // 🚀 TanStack Query
    const { data: entries = [], isLoading } = useJournalEntries();
    const createEntryMutation = useCreateJournalEntry();
    const deleteEntryMutation = useDeleteJournalEntry();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert('Please fill in both title and content');
            return;
        }

        const entryData = {
            title: title.trim(),
            content: content.trim(),
            mood,
            date: new Date().toISOString()
        };

        createEntryMutation.mutate(entryData, {
            onSuccess: () => {
                alert('Journal entry saved!');
                setTitle('');
                setContent('');
                setMood('neutral');
                setShowForm(false);
            },
            onError: (error) => {
                console.error('Error saving entry:', error);
                alert('Failed to save entry');
            },
        });
    };

    const handleDelete = (entryId) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        deleteEntryMutation.mutate(entryId, {
            onSuccess: () => {
                alert('Entry deleted successfully!');
            },
            onError: (error) => {
                console.error('Error deleting entry:', error);
                alert('Failed to delete entry');
            },
        });
    };

    const getMoodEmoji = (moodValue) => {
        const moods = {
            happy: '😊',
            sad: '😢',
            excited: '🤩',
            anxious: '😰',
            calm: '😌',
            angry: '😠',
            neutral: '😐'
        };
        return moods[moodValue] || '😐';
    };

    return (
        <div className="hobby-space-theme page-content">
            <div className="container">
                <div className="page-header">
                    <h2>📓 Personal Journal</h2>
                    <p className="subtitle">Record your thoughts, feelings, and daily experiences</p>
                </div>

                {/* Toggle Button */}
                <div className="journal-toggle">
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="toggle-btn"
                    >
                        {showForm ? '📖 View Entries' : '✍️ Write New Entry'}
                    </button>
                </div>

                {/* New Entry Form */}
                {showForm ? (
                    <div className="journal-form-container">
                        <form onSubmit={handleSubmit} className="journal-form">
                            <div className="form-group">
                                <label htmlFor="title">Entry Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="mood">How are you feeling?</label>
                                <select
                                    id="mood"
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="happy">😊 Happy</option>
                                    <option value="sad">😢 Sad</option>
                                    <option value="excited">🤩 Excited</option>
                                    <option value="anxious">😰 Anxious</option>
                                    <option value="calm">😌 Calm</option>
                                    <option value="angry">😠 Angry</option>
                                    <option value="neutral">😐 Neutral</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="content">Your Thoughts</label>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your thoughts here..."
                                    rows={10}
                                    className="form-textarea"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={createEntryMutation.isLoading}
                                className="submit-btn"
                            >
                                {createEntryMutation.isLoading ? '💾 Saving...' : '💾 Save Entry'}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Journal Entries List */
                    <div className="journal-entries">
                        {isLoading && (
                            <div className="loading-container">
                                <div className="spinner"></div>
                                <p>Loading your entries...</p>
                            </div>
                        )}

                        {!isLoading && entries.length === 0 && (
                            <div className="no-results">
                                <div className="empty-state">
                                    <span className="empty-icon">📓</span>
                                    <h3>No Journal Entries Yet</h3>
                                    <p>Start writing to capture your thoughts and memories</p>
                                    <button 
                                        onClick={() => setShowForm(true)}
                                        className="primary-btn"
                                    >
                                        ✍️ Write First Entry
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isLoading && entries.map((entry) => (
                            <div key={entry.id} className="journal-entry-card">
                                <div className="entry-header">
                                    <div className="entry-title-row">
                                        <span className="entry-mood">{getMoodEmoji(entry.metadata?.mood || entry.mood)}</span>
                                        <h3>{entry.title}</h3>
                                    </div>
                                    <span className="entry-date">
                                        {new Date(entry.createdAt || entry.metadata?.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="entry-content">
                                    {entry.user_notes || entry.content || entry.description}
                                </p>
                                <div className="entry-actions">
                                    <button 
                                        onClick={() => handleDelete(entry.id)}
                                        disabled={deleteEntryMutation.isLoading}
                                        className="delete-btn"
                                    >
                                        {deleteEntryMutation.isLoading ? 'Deleting...' : '🗑️ Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalPage;