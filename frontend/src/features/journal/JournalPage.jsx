import { useState, useEffect } from 'react';
import { useSavedItems, useCreateJournalEntry, useUpdateJournalEntry, useDeleteItem } from '@/api/queries';
import { useLocation } from 'react-router-dom';
import '@/styles/GlassDesignSystem.css';
import '@/styles/features/Journal.css';
import { useToast, ToastContainer, ConfirmDialog } from '@/components/ui/Toast';

// ═══════════════════════════════════════════════════════════════
// Personal Journal Page
// ═══════════════════════════════════════════════════════════════

const JournalPage = () => {
    const { toasts, toast, removeToast } = useToast();
    const [confirmDelete, setConfirmDelete] = useState({ show: false, entryId: null });
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

    const journalEntries = savedItems.filter(item => item.type === 'journal');

    // ─── Handle navigation from Dashboard ─────────────────────
    useEffect(() => {
        if (location.state?.savedItem) {
            setSelectedEntry(location.state.savedItem);
            setShowForm(false);
            window.history.replaceState({}, document.title);
        } else if (location.state?.tab === 'saved') {
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

    // ─── Event Handlers ───────────────────────────────────────

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast.warning('Please fill in both title and content');
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
                toast.success('Journal entry saved!');
            },
            onError: (error) => {
                console.error('Error saving entry:', error);
                toast.error('Failed to save journal entry');
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
            toast.warning('Please fill in both title and content');
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
                toast.success('Journal entry updated!');
            },
            onError: (error) => {
                console.error('Error updating entry:', error);
                toast.error('Failed to update journal entry');
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
        setConfirmDelete({ show: true, entryId });
    };

    const doDeleteEntry = (entryId) => {
        deleteEntryMutation.mutate(entryId, {
            onSuccess: () => {
                setSelectedEntry(null);
                toast.success('Entry deleted');
            },
            onError: (error) => {
                console.error('Error deleting entry:', error);
                toast.error('Failed to delete entry');
            },
        });
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

    // ─── Render ───────────────────────────────────────────────

    return (
        <div className="journal-page">
            <div className="glass-container">
                {/* ─── Header ───────────────────────────────── */}
                <div className="journal-page-header">
                    <div className="journal-icon">📓</div>
                    <h2>Personal Journal</h2>
                    <p className="subtitle">Record your thoughts, feelings, and daily experiences</p>
                </div>

                {/* ─── Tab Switcher ─────────────────────────── */}
                <div className="journal-tabs">
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

                {/* ─── Form Tab ──────────────────────────────── */}
                {showForm ? (
                    <div className="journal-form-card">
                        <form onSubmit={editingEntry ? handleUpdateEntry : handleSubmit}>
                            {editingEntry && (
                                <div className="journal-edit-banner">
                                    <p>
                                        ✏️ Editing entry from {formatDate(editingEntry.metadata?.date || editingEntry.createdAt)}
                                    </p>
                                </div>
                            )}

                            <div className="journal-form-group">
                                <label>Entry Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="journal-input"
                                    required
                                />
                            </div>

                            <div className="journal-form-group">
                                <label>How are you feeling?</label>
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

                            <div className="journal-form-group">
                                <label>Your Thoughts</label>
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
                    /* ─── Entries Tab ─────────────────────────── */
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

                {/* ─── Full Entry Modal ───────────────────────── */}
                {selectedEntry && (
                    <div 
                        className="modal-overlay"
                        onClick={() => setSelectedEntry(null)}
                    >
                        <div 
                            className="glass-card journal-full-entry"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setSelectedEntry(null)} 
                                className="modal-close-btn"
                            >
                                ✕
                            </button>
                            
                            <div className="journal-full-mood">
                                <span className="journal-entry-mood">
                                    {moods.find(m => m.value === selectedEntry.metadata?.mood)?.label || '😐 Neutral'}
                                </span>
                            </div>
                            
                            <h2 className="journal-full-title">{selectedEntry.title}</h2>
                            <p className="journal-full-date">
                                {formatDate(selectedEntry.metadata?.date || selectedEntry.createdAt)}
                            </p>
                            
                            <div className="journal-full-content">
                                {selectedEntry.user_notes || selectedEntry.content}
                            </div>

                            <div className="journal-full-actions">
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
                                    className="glass-btn-secondary journal-delete-btn"
                                    onClick={() => {
                                        setSelectedEntry(null);
                                        handleDelete(selectedEntry.id);
                                    }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Confirm Delete Dialog ─────────────────────── */}
            {confirmDelete.show && (
                <ConfirmDialog
                    message="Are you sure you want to delete this journal entry? This cannot be undone."
                    confirmLabel="Delete Entry"
                    onConfirm={() => {
                        doDeleteEntry(confirmDelete.entryId);
                        setConfirmDelete({ show: false, entryId: null });
                    }}
                    onCancel={() => setConfirmDelete({ show: false, entryId: null })}
                />
            )}
            
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default JournalPage;