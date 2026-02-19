import { useState, useCallback, useEffect } from 'react';

// ─── Toast Component ──────────────────────────────────────────────────────────

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
const COLORS = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', icon: '#10b981' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)',  icon: '#ef4444' },
    info:    { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.35)', icon: '#8b5cf6' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', icon: '#f59e0b' },
};

function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Slide in
        requestAnimationFrame(() => setVisible(true));
        // Auto-dismiss
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, toast.duration || 3500);
        return () => clearTimeout(timer);
    }, []);

    const c = COLORS[toast.type] || COLORS.info;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.85rem 1.1rem',
            background: c.bg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${c.border}`,
            borderRadius: 'var(--radius-md, 12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            minWidth: '260px', maxWidth: '380px',
            transform: visible ? 'translateX(0)' : 'translateX(120%)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            cursor: 'pointer',
        }} onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}>
            <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: c.icon, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
            }}>
                {ICONS[toast.type] || ICONS.info}
            </span>
            <span style={{ color: 'var(--text-primary, rgba(255,255,255,0.95))', fontSize: '0.9rem', lineHeight: 1.4 }}>
                {toast.message}
            </span>
        </div>
    );
}

export function ToastContainer({ toasts, onRemove }) {
    return (
        <div style={{
            position: 'fixed', top: '1.25rem', right: '1.25rem',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: '0.6rem',
            pointerEvents: 'none',
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{ pointerEvents: 'auto' }}>
                    <ToastItem toast={t} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
}

// ─── useToast hook ────────────────────────────────────────────────────────────

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, dur)  => addToast(msg, 'success', dur),
        error:   (msg, dur)  => addToast(msg, 'error',   dur),
        info:    (msg, dur)  => addToast(msg, 'info',    dur),
        warning: (msg, dur)  => addToast(msg, 'warning', dur),
    };

    return { toasts, toast, removeToast };
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
// Drop-in replacement for window.confirm() that matches the glass design

export function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = 'rgba(239,68,68,0.8)' }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
            <div style={{
                background: 'rgba(30,30,50,0.95)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 'var(--radius-lg, 20px)',
                padding: '2rem', maxWidth: '400px', width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
                <p style={{ color: 'var(--text-primary, rgba(255,255,255,0.95))', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '0.75rem 1.5rem',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 'var(--radius-md, 12px)', color: 'var(--text-primary, white)',
                        fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                    }}>Cancel</button>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: '0.75rem 1.5rem',
                        background: confirmColor, border: 'none',
                        borderRadius: 'var(--radius-md, 12px)', color: 'white',
                        fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                    }}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}