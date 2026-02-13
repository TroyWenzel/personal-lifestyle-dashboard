import { useState, useEffect } from 'react';
import { getJournalEntries, saveJournalEntry } from '../api/journalService';

const JournalPage = () => {
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: 'neutral' });
    const [loading, setLoading] = useState(false);

    const moods = [
        { emoji: '😊', value: 'happy', label: 'Happy' },
        { emoji: '😢', value: 'sad', label: 'Sad' },
        { emoji: '😐', value: 'neutral', label: 'Neutral' },
        { emoji: '😡', value: 'angry', label: 'Angry' },
        { emoji: '😴', value: 'tired', label: 'Tired' },
        { emoji: '🤩', value: 'excited', label: 'Excited' },
        { emoji: '😌', value: 'peaceful', label: 'Peaceful' },
        { emoji: '😰', value: 'anxious', label: 'Anxious' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const entryWithDate = {
                ...newEntry,
                date: new Date().toISOString(),
                id: Date.now()
            };
            await saveJournalEntry(entryWithDate);
            setEntries([entryWithDate, ...entries]);
            setNewEntry({ title: '', content: '', mood: 'neutral' });
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Failed to save journal entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="journal-container">
            <h2>📔 Personal Journal</h2>
            
            <div className="journal-form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Entry Title"
                            value={newEntry.title}
                            onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <textarea
                            placeholder="What's on your mind today?"
                            value={newEntry.content}
                            onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                            rows={6}
                            required
                        />
                    </div>
                    
                    <div className="mood-selection">
                        <label>How are you feeling?</label>
                        <div className="mood-options">
                            {moods.map(mood => (
                                <button
                                    type="button"
                                    key={mood.value}
                                    className={`mood-btn ${newEntry.mood === mood.value ? 'selected' : ''}`}
                                    onClick={() => setNewEntry({...newEntry, mood: mood.value})}
                                >
                                    <span className="mood-emoji">{mood.emoji}</span>
                                    <span className="mood-label">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Saving...' : 'Save Entry'}
                    </button>
                </form>
            </div>

            <div className="entries-grid">
                {entries.map(entry => (
                    <div key={entry.id} className={`journal-card mood-${entry.mood}`}>
                        <div className="card-header">
                            <div className="entry-mood">
                                <span className="mood-emoji">
                                    {moods.find(m => m.value === entry.mood)?.emoji}
                                </span>
                                <span className="mood-label">
                                    {moods.find(m => m.value === entry.mood)?.label}
                                </span>
                            </div>
                            <span className="entry-date">
                                {new Date(entry.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <h3>{entry.title}</h3>
                        <p className="entry-content">{entry.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JournalPage;