import { useState, useEffect } from 'react';
import { authFetch } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

// const BASE_URL = 'http://localhost:5000';
const BASE_URL =  'https://prod.panditjee.com';

export default function InviteUser() {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'editor' });

    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await authFetch(`${BASE_URL}/auth/users`);
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus(null);
        try {
            const res = await authFetch(`${BASE_URL}/auth/invite`, {
                method: 'POST',
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatus('error');
                setMessage(data.error || 'Failed to create user');
            } else {
                setStatus('success');
                setMessage(`User "${form.username}" created!`);
                setForm({ username: '', email: '', password: '' });
                fetchUsers();
                setTimeout(() => setShowModal(false), 1200);
            }
        } catch {
            setStatus('error');
            setMessage('Network error — please try again');
        } finally {
            setSubmitting(false);
        }
    };

    const totalUsers = users.length;
    const recentUsers = users.filter(u => {
        const created = new Date(u.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created > weekAgo;
    }).length;
    const latestUser = users[0];

    return (
        <div style={s.page}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .iu-row:hover { background: #f9f7f4 !important; }
        .iu-btn-primary:hover { background: #1a1a1a !important; transform: translateY(-1px); }
        .iu-btn-ghost:hover { background: #f0ede8 !important; }
        .iu-input:focus { outline: none; border-color: #1a1a1a !important; }
        .iu-card { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .iu-card:nth-child(2) { animation-delay: 0.07s; }
        .iu-card:nth-child(3) { animation-delay: 0.14s; }
      `}</style>

            {/* Header */}
            <div style={s.header}>
                <div>
                    <h1 style={s.title}>Admin Users</h1>
                    <p style={s.subtitle}>Manage who has access to this dashboard</p>
                </div>
                <button
                    style={s.btnPrimary}
                    className="iu-btn-primary"
                    onClick={() => { setShowModal(true); setStatus(null); }}
                >
                    + Create User
                </button>
            </div>

            {/* KPI Cards */}
            <div style={s.kpiGrid}>
                <div style={s.kpiCard} className="iu-card">
                    <p style={s.kpiLabel}>Total Admins</p>
                    <p style={s.kpiValue}>{loadingUsers ? '—' : totalUsers}</p>
                    <p style={s.kpiHint}>accounts with access</p>
                </div>
                <div style={{ ...s.kpiCard, background: '#1a1a1a', color: '#fff' }} className="iu-card">
                    <p style={{ ...s.kpiLabel, color: 'rgba(255,255,255,0.5)' }}>Added This Week</p>
                    <p style={{ ...s.kpiValue, color: '#fff' }}>{loadingUsers ? '—' : recentUsers}</p>
                    <p style={{ ...s.kpiHint, color: 'rgba(255,255,255,0.35)' }}>new in last 7 days</p>
                </div>
                <div style={s.kpiCard} className="iu-card">
                    <p style={s.kpiLabel}>Latest Member</p>
                    <p style={{ ...s.kpiValue, fontSize: 20 }}>
                        {loadingUsers ? '—' : latestUser ? latestUser.username : 'None'}
                    </p>
                    <p style={s.kpiHint}>
                        {latestUser ? new Date(latestUser.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div style={s.tableCard}>
                <div style={s.tableHeader}>
                    <span style={s.tableTitle}>All Users</span>
                    <span style={s.tableCount}>{totalUsers} total</span>
                </div>

                {loadingUsers ? (
                    <div style={s.emptyState}>Loading users…</div>
                ) : users.length === 0 ? (
                    <div style={s.emptyState}>No admin users yet. Invite someone to get started.</div>
                ) : (
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>User</th>
                                <th style={s.th}>Email</th>
                                <th style={s.th}>Role</th>
                                <th style={{ ...s.th, textAlign: 'right' }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u.id} style={s.row} className="iu-row">
                                    <td style={s.td}>
                                        <div style={s.userCell}>
                                            <div style={{
                                                ...s.avatar,
                                                background: avatarColor(u.username),
                                            }}>
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <span style={s.username}>{u.username}</span>
                                            {i === 0 && <span style={s.badge}>Latest</span>}
                                        </div>
                                    </td>
                                    <td style={{ ...s.td, color: '#888' }}>{u.email}</td>
                                    <td style={s.td}>
                                        <span style={{
                                            display: 'inline-block',
                                            fontSize: 11,
                                            fontWeight: 500,
                                            letterSpacing: '0.4px',
                                            padding: '3px 10px',
                                            borderRadius: 20,
                                            ...(u.role === 'admin'
                                                ? { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }
                                                : { background: '#f0f9ff', color: '#075985', border: '1px solid #bae6fd' })
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ ...s.td, textAlign: 'right', color: '#aaa', fontSize: 13 }}>
                                        {new Date(u.created_at).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={s.overlay} onClick={() => setShowModal(false)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <div style={s.modalHeader}>
                            <div>
                                <h2 style={s.modalTitle}>Create User</h2>
                                <p style={s.modalSub}>They can log in immediately after creation</p>
                            </div>
                            <button style={s.closeBtn} className="iu-btn-ghost" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {status === 'success' && (
                            <div style={s.successBox}>✓ {message}</div>
                        )}
                        {status === 'error' && (
                            <div style={s.errorBox}>{message}</div>
                        )}

                        <form onSubmit={handleSubmit} style={s.form}>
                            {[
                                { key: 'username', label: 'Username', type: 'text', placeholder: 'john_doe' },
                                { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
                                { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                            ].map(({ key, label, type, placeholder }) => (
                                <div key={key} style={s.field}>
                                    <label style={s.label}>{label}</label>
                                    <input
                                        type={type}
                                        required
                                        value={form[key]}
                                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                                        placeholder={placeholder}
                                        style={s.input}
                                        className="iu-input"
                                    />
                                </div>

                            ))}

                            <div style={s.field}>
                                <label style={s.label}>Role</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                    style={{ ...s.input, cursor: 'pointer' }}
                                >
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div style={s.modalActions}>
                                <button
                                    type="button"
                                    style={s.btnGhost}
                                    className="iu-btn-ghost"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{ ...s.btnPrimary, opacity: submitting ? 0.6 : 1 }}
                                    className="iu-btn-primary"
                                >
                                    {submitting ? 'Creating…' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function avatarColor(name) {
    const colors = ['#2d2d2d', '#4a3728', '#1e3a4a', '#2d3a1e', '#3a1e3a', '#1e2d4a'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

const s = {
    page: {
        fontFamily: "'Geist', sans-serif",
        maxWidth: 860,
        margin: '0 auto',
        padding: '40px 24px',
        color: '#1a1a1a',
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 36,
    },
    title: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 34,
        fontWeight: 400,
        margin: '0 0 4px',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        margin: 0,
        fontWeight: 300,
    },
    btnPrimary: {
        background: '#1a1a1a',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '10px 20px',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: "'Geist', sans-serif",
        whiteSpace: 'nowrap',
    },
    btnGhost: {
        background: 'transparent',
        color: '#555',
        border: '1px solid #e5e1da',
        borderRadius: 8,
        padding: '10px 20px',
        fontSize: 14,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: "'Geist', sans-serif",
    },
    kpiGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 32,
    },
    kpiCard: {
        background: '#f9f7f4',
        border: '1px solid #ede9e3',
        borderRadius: 14,
        padding: '24px 28px',
        transition: 'transform 0.2s',
    },
    kpiLabel: {
        fontSize: 12,
        color: '#aaa',
        margin: '0 0 8px',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        fontWeight: 500,
    },
    kpiValue: {
        fontSize: 36,
        fontFamily: "'Instrument Serif', serif",
        fontWeight: 400,
        margin: '0 0 4px',
        letterSpacing: '-1px',
        lineHeight: 1,
    },
    kpiHint: {
        fontSize: 12,
        color: '#bbb',
        margin: 0,
    },
    tableCard: {
        background: '#fff',
        border: '1px solid #ede9e3',
        borderRadius: 14,
        overflow: 'hidden',
    },
    tableHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderBottom: '1px solid #f0ece6',
    },
    tableTitle: {
        fontSize: 15,
        fontWeight: 500,
    },
    tableCount: {
        fontSize: 12,
        color: '#bbb',
        background: '#f5f2ee',
        padding: '3px 10px',
        borderRadius: 20,
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        fontSize: 11,
        color: '#bbb',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        padding: '12px 24px',
        textAlign: 'left',
        fontWeight: 500,
        background: '#faf8f5',
        borderBottom: '1px solid #f0ece6',
    },
    row: {
        borderBottom: '1px solid #f5f2ee',
        transition: 'background 0.12s',
        cursor: 'default',
    },
    td: {
        padding: '14px 24px',
        fontSize: 14,
        color: '#1a1a1a',
    },
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 13,
        fontWeight: 500,
        flexShrink: 0,
    },
    username: {
        fontWeight: 500,
        fontSize: 14,
    },
    badge: {
        fontSize: 10,
        background: '#f0f9ff',
        color: '#0284c7',
        border: '1px solid #bae6fd',
        borderRadius: 20,
        padding: '2px 8px',
        fontWeight: 500,
        letterSpacing: '0.3px',
    },
    emptyState: {
        padding: '48px 24px',
        textAlign: 'center',
        color: '#bbb',
        fontSize: 14,
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        backdropFilter: 'blur(4px)',
    },
    modal: {
        background: '#fff',
        borderRadius: 18,
        padding: '32px',
        width: '100%',
        maxWidth: 440,
        margin: '0 16px',
        animation: 'modalIn 0.25s cubic-bezier(0.22,1,0.36,1) both',
        border: '1px solid #ede9e3',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    modalTitle: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 24,
        fontWeight: 400,
        margin: '0 0 4px',
    },
    modalSub: {
        fontSize: 13,
        color: '#aaa',
        margin: 0,
        fontWeight: 300,
    },
    closeBtn: {
        background: 'transparent',
        border: '1px solid #e5e1da',
        borderRadius: 8,
        width: 32,
        height: 32,
        cursor: 'pointer',
        fontSize: 12,
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
        flexShrink: 0,
    },
    form: { display: 'flex', flexDirection: 'column', gap: 16 },
    field: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: 12, fontWeight: 500, color: '#555', letterSpacing: '0.3px' },
    input: {
        padding: '10px 14px',
        border: '1px solid #e5e1da',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: "'Geist', sans-serif",
        color: '#1a1a1a',
        background: '#faf8f5',
        transition: 'border-color 0.15s',
        boxSizing: 'border-box',
        width: '100%',
    },
    modalActions: {
        display: 'flex',
        gap: 8,
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    successBox: {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        color: '#15803d',
        fontSize: 13,
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 16,
    },
    errorBox: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        fontSize: 13,
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 16,
    },
};