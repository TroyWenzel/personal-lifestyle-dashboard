import { useState, useEffect } from 'react';
import { useSavedItems, useCreateJournalEntry, useUpdateJournalEntry, useDeleteItem } from '@/api/queries';
import { useLocation } from 'react-router-dom';
import '@/styles/GlassDesignSystem.css';
import '@/styles/features/Journal.css';

const JournalPage = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('neutral');
    const [showForm, setShowForm] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);
    const location = useLocation();

    const { data: savedItems = [], isLoading } = useSavedItems();
    const createEntryMutation = useCreateJournalEntry();
    const updateEntryMutation = useUpdateJournalEntry();
    const deleteEntryMutation = useDeleteItem();

    // Filter only journal entries
    const journalEntries = savedItems.filter(item => item.type === 'journal');

    useEffect(() => {
        if (location.state?.savedItem) {
            setSelectedEntry(location.state.savedItem);
            setShowForm(false);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const moods = [
        { value: 'happy', label: '😊 Happy' },
        { value: 'excited', label: '🤩 Excited' },
        { value: 'calm', label: '😌 Calm' },
        { value: 'neutral', label: '😐 Neutral' },
        { value: 'sad', label: '😢 Sad' },
        { value: 'anxious', label: '😰 Anxious' },
        { value: 'grateful', label: '🙏 Grateful' }
    ];

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
                setTitle('');
                setContent('');
                setMood('neutral');
                alert('Journal entry saved successfully!');
            },
            onError: (error) => {
                console.error('Error saving entry:', error);
                alert('Failed to save journal entry');
            },
        });
    };

    const handleStartEdit = (entry) => {
        setEditingEntry(entry);
        setTitle(entry.title);
        setContent(entry.user_notes || entry.content);
        setMood(entry.metadata?.mood || 'neutral');
        setShowForm(true);
        setSelectedEntry(null);
    };

    const handleUpdateEntry = (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert('Please fill in both title and content');
            return;
        }

        updateEntryMutation.mutate({
            id: editingEntry.id,
            data: {
                title: title.trim(),
                content: content.trim(),
                mood,
                date: editingEntry.metadata?.date || editingEntry.createdAt
            }
        }, {
            onSuccess: () => {
                setTitle('');
                setContent('');
                setMood('neutral');
                setEditingEntry(null);
                alert('Journal entry updated successfully!');
            },
            onError: (error) => {
                console.error('Error updating entry:', error);
                alert('Failed to update journal entry');
            },
        });
    };

    const handleCancelEdit = () => {
        setEditingEntry(null);
        setTitle('');
        setContent('');
        setMood('neutral');
    };

    const handleDelete = (entryId) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            deleteEntryMutation.mutate(entryId, {
                onSuccess: () => {
                    setSelectedEntry(null);
                    alert('Entry deleted successfully!');
                },
                onError: (error) => {
                    console.error('Error deleting entry:', error);
                    alert('Failed to delete entry');
                },
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="journal-page">
            <div className="glass-container">
                <div className="journal-page-header">
                    <div className="journal-icon">📓</div>
                    <h2>Personal Journal</h2>
                    <p className="subtitle">Record your thoughts, feelings, and daily experiences</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <button 
                        className={showForm ? 'journal-btn-primary' : 'journal-btn-secondary'}
                        onClick={() => { setShowForm(true); setSelectedEntry(null); }}
                    >
                        ✍️ {editingEntry ? 'Edit Entry' : 'Write New Entry'}
                    </button>
                    <button 
                        className={!showForm ? 'journal-btn-primary' : 'journal-btn-secondary'}
                        onClick={() => { setShowForm(false); setEditingEntry(null); setTitle(''); setContent(''); setMood('neutral'); }}
                    >
                        📖 View Entries ({journalEntries.length})
                    </button>
                </div>

                {showForm ? (
                    <div className="journal-form-card">
                        <form onSubmit={editingEntry ? handleUpdateEntry : handleSubmit}>
                            {editingEntry && (
                                <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-primary)', margin: 0 }}>
                                        ✏️ Editing entry from {formatDate(editingEntry.metadata?.date || editingEntry.createdAt)}
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                                    Entry Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="journal-input"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                                    How are you feeling? {moods.find(m => m.value === mood)?.label.split(' ')[0] || '😊'}
                                </label>
                                <div className="mood-selector">
                                    {moods.map((moodOption) => (
                                        <button
                                            key={moodOption.value}
                                            type="button"
                                            className={`mood-option ${mood === moodOption.value ? 'selected' : ''}`}
                                            onClick={() => setMood(moodOption.value)}
                                        >
                                            {moodOption.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                                    Your Thoughts
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your thoughts here..."
                                    className="journal-input journal-textarea"
                                    required
                                />
                            </div>

                            <div className="journal-actions">
                                <button 
                                    type="submit" 
                                    className="journal-btn-primary" 
                                    disabled={editingEntry ? updateEntryMutation.isLoading : createEntryMutation.isLoading}
                                >
                                    {editingEntry 
                                        ? (updateEntryMutation.isLoading ? '💾 Updating...' : '💾 Update Entry')
                                        : (createEntryMutation.isLoading ? '💾 Saving...' : '💾 Save Entry')
                                    }
                                </button>
                                {editingEntry && (
                                    <button 
                                        type="button" 
                                        className="journal-btn-secondary" 
                                        onClick={handleCancelEdit}
                                    >
                                        ✖️ Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="journal-entries-section">
                        {isLoading ? (
                            <div className="glass-loading">
                                <div className="glass-spinner"></div>
                                <p>Loading your journal...</p>
                            </div>
                        ) : journalEntries.length === 0 ? (
                            <div className="journal-empty-state">
                                <div className="journal-empty-icon">📔</div>
                                <h3>No Journal Entries Yet</h3>
                                <p>Start writing to capture your thoughts and memories</p>
                            </div>
                        ) : (
                            <div className="journal-entries-grid">
                                {journalEntries.map((entry) => (
                                    <div key={entry.id} className="journal-entry-card">
                                        <div className="journal-entry-header">
                                            <span className="journal-entry-date">
                                                {formatDate(entry.metadata?.date || entry.createdAt)}
                                            </span>
                                            <span className="journal-entry-mood">
                                                {moods.find(m => m.value === entry.metadata?.mood)?.label || '😐 Neutral'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="journal-entry-title">{entry.title}</h3>
                                        <p className="journal-entry-content">{entry.user_notes || entry.content}</p>
                                        
                                        <div className="journal-entry-actions">
                                            <button 
                                                className="journal-entry-btn journal-entry-btn-view"
                                                onClick={() => setSelectedEntry(entry)}
                                            >
                                                👁️ Read Full Entry
                                            </button>
                                            <button 
                                                className="journal-entry-btn journal-entry-btn-view"
                                                onClick={() => handleStartEdit(entry)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="journal-entry-btn journal-entry-btn-delete"
                                                onClick={() => handleDelete(entry.id)}
                                                disabled={deleteEntryMutation.isLoading}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {selectedEntry && (
                    <div 
                        style={{ 
                            position: 'fixed', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            background: 'rgba(0,0,0,0.8)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            zIndex: 1000,
                            padding: '2rem'
                        }} 
                        onClick={() => setSelectedEntry(null)}
                    >
                        <div 
                            className="glass-card" 
                            style={{ 
                                maxWidth: '700px', 
                                width: '100%', 
                                maxHeight: '80vh', 
                                overflow: 'auto'
                            }} 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setSelectedEntry(null)} 
                                style={{ 
                                    float: 'right', 
                                    background: 'none', 
                                    border: 'none', 
                                    fontSize: '1.5rem', 
                                    cursor: 'pointer', 
                                    color: 'var(--text-primary)' 
                                }}
                            >
                                ✕
                            </button>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                <span className="journal-entry-mood" style={{ display: 'inline-block' }}>
                                    {moods.find(m => m.value === selectedEntry.metadata?.mood)?.label || '😐 Neutral'}
                                </span>
                            </div>
                            
                            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{selectedEntry.title}</h2>
                            <p style={{ color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
                                {formatDate(selectedEntry.metadata?.date || selectedEntry.createdAt)}
                            </p>
                            
                            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                {selectedEntry.user_notes || selectedEntry.content}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button 
                                    className="glass-btn"
                                    onClick={() => {
                                        setSelectedEntry(null);
                                        handleStartEdit(selectedEntry);
                                    }}
                                >
                                    ✏️ Edit Entry
                                </button>
                                <button 
                                    className="glass-btn-secondary"
                                    onClick={() => {
                                        setSelectedEntry(null);
                                        handleDelete(selectedEntry.id);
                                    }}
                                    style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalPage;