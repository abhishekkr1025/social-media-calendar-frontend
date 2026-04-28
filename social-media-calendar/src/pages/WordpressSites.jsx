import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from '../lib/auth';

const BASE_URL = 'https://prod.panditjee.com';
// const BASE_URL = 'http://localhost:5000';

const LANGUAGE_FLAGS = {
    English: '🇬🇧', Hindi: '🇮🇳', Tamil: '🇮🇳',
    Telugu: '🇮🇳', Marathi: '🇮🇳', Bengali: '🇮🇳',
    Gujarati: '🇮🇳', Kannada: '🇮🇳', Punjabi: '🇮🇳',
};

const LANGUAGE_COLORS = {
    English:  { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
    Hindi:    { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    Tamil:    { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' },
    Telugu:   { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
    Marathi:  { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' },
    Bengali:  { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' },
    Gujarati: { bg: '#FEF9C3', text: '#A16207', border: '#FEF08A' },
    Kannada:  { bg: '#CCFBF1', text: '#0F766E', border: '#99F6E4' },
};

export default function WordPressSites() {
    const [sites, setSites] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("all");
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editSite, setEditSite] = useState(null);
    const [syncingId, setSyncingId] = useState(null);
    const [testingId, setTestingId] = useState(null);
    const [testResults, setTestResults] = useState({});
    const [form, setForm] = useState({
        client_id: "", site_url: "", site_path: "",
        language: "", username: "", app_password: "", default_media_id: ""
    });
    const navigate = useNavigate();

    useEffect(() => { fetchAll(); }, []);

    async function fetchAll() {
        try {
            setLoading(true);
            const [sitesRes, clientsRes] = await Promise.all([
                authFetch(`${BASE_URL}/api/wordpress-sites`),
                authFetch(`${BASE_URL}/api/clients`)
            ]);
            setSites(await sitesRes.json());
            setClients(await clientsRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function createSite() {
        await authFetch(`${BASE_URL}/api/add/wordpress-sites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });
        setShowAdd(false);
        setForm({ client_id: "", site_url: "", site_path: "", language: "", username: "", app_password: "", default_media_id: "" });
        fetchAll();
    }

    async function updateSite() {
        if (!editSite) return;
        await authFetch(`${BASE_URL}/api/wordpress-sites/${editSite.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: editSite.client_id,
                site_url: editSite.site_url,
                site_path: editSite.site_path,
                language: editSite.language,
                username: editSite.username,
                app_password: editSite.app_password,
                default_media_id: editSite.default_media_id
            })
        });
        setEditSite(null);
        fetchAll();
    }

    async function testConnection(id) {
        setTestingId(id);
        try {
            const res = await authFetch(`${BASE_URL}/api/wordpress-sites/${id}/test`, { method: "POST" });
            const data = await res.json();
            setTestResults(prev => ({ ...prev, [id]: data.success }));
            setTimeout(() => setTestResults(prev => {
                const n = { ...prev }; delete n[id]; return n;
            }), 4000);
        } catch {
            setTestResults(prev => ({ ...prev, [id]: false }));
        } finally {
            setTestingId(null);
        }
    }

    async function syncCategories(id) {
        setSyncingId(id);
        try {
            const res = await authFetch(`${BASE_URL}/api/wordpress-sites/${id}/sync-categories`, { method: "POST" });
            const data = await res.json();
            alert(data.success ? "✅ Categories synced!" : "❌ Sync failed");
        } catch {
            alert("❌ Error syncing categories");
        } finally {
            setSyncingId(null);
        }
    }

    const filteredSites = selectedClient === "all"
        ? sites
        : sites.filter(s => String(s.client_id) === selectedClient);

    return (
        <div style={{ minHeight: '100vh', background: '#F7F6F3', fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,400&display=swap" rel="stylesheet" />

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .site-card {
                    animation: fadeUp 0.35s ease both;
                    transition: box-shadow 0.2s ease, transform 0.2s ease;
                }
                .site-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
                }
                .action-btn { transition: all 0.15s ease; }
                .action-btn:hover { filter: brightness(0.94); transform: scale(1.02); }
                .action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            `}</style>

            {/* ── Header ── */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #ECEAE4',
                padding: '28px 40px 24px',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <p style={{
                                fontSize: 10, fontWeight: 700, color: '#2563EB',
                                letterSpacing: '0.12em', textTransform: 'uppercase',
                                margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                                <span style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: '#2563EB', display: 'inline-block'
                                }} />
                                Connections
                            </p>
                            <h1 style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: 30, fontWeight: 600,
                                color: '#1A1714', margin: 0,
                                letterSpacing: '-0.02em', lineHeight: 1.2,
                            }}>
                                WordPress Sites
                            </h1>
                            <p style={{ color: '#9B9590', fontSize: 13, margin: '5px 0 0', fontWeight: 400 }}>
                                {sites.length} site{sites.length !== 1 ? 's' : ''} across {clients.length} client{clients.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Client filter */}
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={selectedClient}
                                    onChange={e => setSelectedClient(e.target.value)}
                                    style={{
                                        background: 'white', border: '1.5px solid #E5E1D8',
                                        color: '#4A4540', borderRadius: 10,
                                        padding: '9px 34px 9px 14px',
                                        fontSize: 13, cursor: 'pointer',
                                        outline: 'none', appearance: 'none',
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontWeight: 500,
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                                    onBlur={e => e.target.style.borderColor = '#E5E1D8'}
                                >
                                    <option value="all">All Clients</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none', fontSize: 10 }}>▾</span>
                            </div>

                            {/* Add button */}
                            <button
                                onClick={() => setShowAdd(true)}
                                style={{
                                    background: '#1D4ED8', color: 'white',
                                    border: 'none', borderRadius: 10,
                                    padding: '9px 18px', fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                    fontFamily: "'DM Sans', sans-serif",
                                    boxShadow: '0 2px 10px rgba(29,78,216,0.3)',
                                    transition: 'background 0.15s, box-shadow 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#1E40AF'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,78,216,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#1D4ED8'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(29,78,216,0.3)'; }}
                            >
                                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                                Connect Site
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 32, height: 32, border: '3px solid #E5E1D8',
                                borderTopColor: '#1D4ED8', borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 14px',
                            }} />
                            <p style={{ color: '#9B9590', fontSize: 14 }}>Loading sites...</p>
                        </div>
                    </div>
                ) : filteredSites.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 40px',
                        border: '2px dashed #E5E1D8', borderRadius: 18,
                        background: 'white',
                    }}>
                        <div style={{ fontSize: 44, marginBottom: 14 }}>🌐</div>
                        <p style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 20, color: '#3A3530', margin: '0 0 6px', fontWeight: 500,
                        }}>
                            No sites connected yet
                        </p>
                        <p style={{ color: '#9B9590', fontSize: 13 }}>
                            Click "Connect Site" to add your first WordPress site
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                        gap: 18,
                    }}>
                        {filteredSites.map((site, idx) => {
                            const lang = LANGUAGE_COLORS[site.language] || { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
                            const flag = LANGUAGE_FLAGS[site.language] || '🌐';
                            const testResult = testResults[site.id];
                            const isTesting = testingId === site.id;
                            const isSyncing = syncingId === site.id;

                            return (
                                <div
                                    key={site.id}
                                    className="site-card"
                                    style={{
                                        background: 'white',
                                        border: '1.5px solid #ECEAE4',
                                        borderRadius: 16,
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                                        animationDelay: `${idx * 0.05}s`,
                                    }}
                                >
                                    {/* Top accent bar — unique color per language */}
                                    <div style={{
                                        height: 3,
                                        background: `linear-gradient(90deg, ${lang.border}, ${lang.bg})`,
                                    }} />

                                    {/* Card Header */}
                                    <div style={{ padding: '18px 20px 14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {/* Client badge */}
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700, color: '#6B7280',
                                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                                    display: 'block', marginBottom: 4,
                                                }}>
                                                    {site.client_name}
                                                </span>
                                                {/* URL */}
                                                <a
                                                    href={`${site.site_url}${site.site_path || ''}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: 14, fontWeight: 600,
                                                        color: '#1A1714', textDecoration: 'none',
                                                        display: 'block', overflow: 'hidden',
                                                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                        transition: 'color 0.15s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#1D4ED8'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#1A1714'}
                                                >
                                                    {site.site_url}{site.site_path || ''}
                                                    <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.5 }}>↗</span>
                                                </a>
                                            </div>

                                            {/* Language pill */}
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '4px 10px', borderRadius: 20,
                                                background: lang.bg, color: lang.text,
                                                border: `1.5px solid ${lang.border}`,
                                                fontSize: 11, fontWeight: 700,
                                                whiteSpace: 'nowrap', flexShrink: 0,
                                            }}>
                                                {flag} {site.language}
                                            </span>
                                        </div>

                                        {/* Test result */}
                                        {testResult !== undefined && (
                                            <div style={{
                                                marginTop: 10, padding: '6px 12px', borderRadius: 8,
                                                background: testResult ? '#F0FDF4' : '#FFF1F2',
                                                border: `1px solid ${testResult ? '#BBF7D0' : '#FECDD3'}`,
                                                fontSize: 12, fontWeight: 500,
                                                color: testResult ? '#15803D' : '#BE123C',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                            }}>
                                                {testResult ? '✅ Connection successful' : '❌ Connection failed'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Meta row */}
                                    <div style={{
                                        display: 'flex', gap: 0,
                                        borderTop: '1px solid #F3F2EE',
                                        borderBottom: '1px solid #F3F2EE',
                                    }}>
                                        {[
                                            { label: 'Username', value: site.username, icon: '👤' },
                                            { label: 'Media ID', value: site.default_media_id || '—', icon: '🖼️' },
                                            { label: 'Added', value: new Date(site.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), icon: '📅' },
                                        ].map((item, i) => (
                                            <div key={i} style={{
                                                flex: 1, padding: '10px 14px',
                                                borderRight: i < 2 ? '1px solid #F3F2EE' : 'none',
                                            }}>
                                                <p style={{ fontSize: 9, fontWeight: 700, color: '#B0AAA0', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>
                                                    {item.icon} {item.label}
                                                </p>
                                                <p style={{ fontSize: 12, color: '#4A4540', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ padding: '12px 16px', display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                                        <Btn
                                            onClick={() => setEditSite({ ...site, app_password: '' })}
                                            color="#3B82F6" bg="#EFF6FF" border="#BFDBFE"
                                        >✏️ Edit</Btn>

                                        <Btn
                                            onClick={() => testConnection(site.id)}
                                            disabled={isTesting}
                                            color="#16A34A" bg="#F0FDF4" border="#BBF7D0"
                                        >
                                            {isTesting ? '⟳ Testing...' : '🔌 Test'}
                                        </Btn>

                                        <Btn
                                            onClick={() => syncCategories(site.id)}
                                            disabled={isSyncing}
                                            color="#9333EA" bg="#FAF5FF" border="#DDD6FE"
                                        >
                                            {isSyncing ? '⟳ Syncing...' : '🔄 Sync'}
                                        </Btn>

                                        <Btn
                                            onClick={() => navigate(`/wordpress-sites/${site.id}/categories`)}
                                            color="#D97706" bg="#FFFBEB" border="#FDE68A"
                                        >📂 Categories</Btn>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Add Modal ── */}
            {showAdd && (
                <LightModal title="Connect WordPress Site" onClose={() => setShowAdd(false)}>
                    <Field label="Client">
                        <LSelect value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                            <option value="">Select client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </LSelect>
                    </Field>
                    <Field label="Site URL">
                        <LInput placeholder="https://example.com" value={form.site_url} onChange={e => setForm({ ...form, site_url: e.target.value })} />
                    </Field>
                    <Field label="Site Path" hint="optional — e.g. /hindi">
                        <LInput placeholder="/path" value={form.site_path} onChange={e => setForm({ ...form, site_path: e.target.value })} />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Username">
                            <LInput placeholder="wp_username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                        </Field>
                        <Field label="App Password">
                            <LInput type="password" placeholder="xxxx xxxx" value={form.app_password} onChange={e => setForm({ ...form, app_password: e.target.value })} />
                        </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Language">
                            <LSelect value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                                <option value="">Select...</option>
                                {Object.keys(LANGUAGE_FLAGS).map(l => <option key={l} value={l}>{LANGUAGE_FLAGS[l]} {l}</option>)}
                            </LSelect>
                        </Field>
                        <Field label="Default Media ID" hint="optional">
                            <LInput placeholder="123" value={form.default_media_id} onChange={e => setForm({ ...form, default_media_id: e.target.value })} />
                        </Field>
                    </div>
                    <SaveRow onCancel={() => setShowAdd(false)} onSave={createSite} label="Connect Site" />
                </LightModal>
            )}

            {/* ── Edit Modal ── */}
            {editSite && (
                <LightModal title="Edit WordPress Site" onClose={() => setEditSite(null)}>
                    <Field label="Client">
                        <LSelect value={editSite.client_id} disabled>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </LSelect>
                    </Field>
                    <Field label="Site URL">
                        <LInput value={editSite.site_url} onChange={e => setEditSite({ ...editSite, site_url: e.target.value })} />
                    </Field>
                    <Field label="Site Path" hint="optional">
                        <LInput value={editSite.site_path || ''} onChange={e => setEditSite({ ...editSite, site_path: e.target.value })} placeholder="/path" />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Username">
                            <LInput value={editSite.username} onChange={e => setEditSite({ ...editSite, username: e.target.value })} />
                        </Field>
                        <Field label="New App Password" hint="blank = keep">
                            <LInput type="password" value={editSite.app_password} onChange={e => setEditSite({ ...editSite, app_password: e.target.value })} placeholder="••••••••" />
                        </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Language">
                            <LSelect value={editSite.language} onChange={e => setEditSite({ ...editSite, language: e.target.value })}>
                                {Object.keys(LANGUAGE_FLAGS).map(l => <option key={l} value={l}>{LANGUAGE_FLAGS[l]} {l}</option>)}
                            </LSelect>
                        </Field>
                        <Field label="Default Media ID">
                            <LInput value={editSite.default_media_id || ''} onChange={e => setEditSite({ ...editSite, default_media_id: e.target.value })} placeholder="123" />
                        </Field>
                    </div>
                    <SaveRow onCancel={() => setEditSite(null)} onSave={updateSite} label="Save Changes" />
                </LightModal>
            )}
        </div>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Btn({ children, onClick, disabled, color, bg, border }) {
    return (
        <button className="action-btn" onClick={onClick} disabled={disabled} style={{
            padding: '6px 12px', borderRadius: 8,
            border: `1.5px solid ${border}`,
            background: bg, color, fontSize: 12, fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
        }}>
            {children}
        </button>
    );
}

function LightModal({ title, onClose, children }) {
    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 50,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20, animation: 'fadeUp 0.2s ease',
            }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'white', border: '1.5px solid #ECEAE4',
                    borderRadius: 20, padding: '28px',
                    width: '100%', maxWidth: 520,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                    display: 'flex', flexDirection: 'column', gap: 16,
                    maxHeight: '90vh', overflowY: 'auto',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 22, color: '#1A1714', margin: 0, fontWeight: 500,
                    }}>{title}</h2>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        border: '1.5px solid #E5E1D8', background: '#F7F6F3',
                        color: '#6B6760', cursor: 'pointer', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1,
                    }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({ label, hint, children }) {
    return (
        <div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6A6560', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {label}
                </label>
                {hint && <span style={{ fontSize: 10, color: '#B0AAA0', fontStyle: 'italic' }}>{hint}</span>}
            </div>
            {children}
        </div>
    );
}

function LInput({ type = 'text', placeholder, value, onChange, disabled }) {
    return (
        <input
            type={type} placeholder={placeholder} value={value}
            onChange={onChange} disabled={disabled}
            style={{
                width: '100%', padding: '10px 14px',
                background: disabled ? '#F7F6F3' : 'white',
                border: '1.5px solid #E5E1D8', borderRadius: 10,
                color: disabled ? '#9B9590' : '#1A1714',
                fontSize: 13, outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
            }}
            onFocus={e => !disabled && (e.target.style.borderColor = '#1D4ED8')}
            onBlur={e => (e.target.style.borderColor = '#E5E1D8')}
        />
    );
}

function LSelect({ value, onChange, disabled, children }) {
    return (
        <div style={{ position: 'relative' }}>
            <select
                value={value} onChange={onChange} disabled={disabled}
                style={{
                    width: '100%', padding: '10px 34px 10px 14px',
                    background: disabled ? '#F7F6F3' : 'white',
                    border: '1.5px solid #E5E1D8', borderRadius: 10,
                    color: disabled ? '#9B9590' : '#1A1714',
                    fontSize: 13, outline: 'none', appearance: 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    boxSizing: 'border-box',
                }}
            >
                {children}
            </select>
            <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: '#9B9590', pointerEvents: 'none', fontSize: 10 }}>▾</span>
        </div>
    );
}

function SaveRow({ onCancel, onSave, label }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
            <button onClick={onCancel} style={{
                padding: '10px 20px', borderRadius: 10,
                border: '1.5px solid #E5E1D8', background: 'white',
                color: '#6B6760', fontSize: 13, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.15s',
            }}
                onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
                Cancel
            </button>
            <button onClick={onSave} style={{
                padding: '10px 22px', borderRadius: 10,
                border: 'none', background: '#1D4ED8',
                color: 'white', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 2px 10px rgba(29,78,216,0.3)',
                transition: 'background 0.15s',
            }}
                onMouseEnter={e => e.currentTarget.style.background = '#1E40AF'}
                onMouseLeave={e => e.currentTarget.style.background = '#1D4ED8'}
            >
                {label}
            </button>
        </div>
    );
}