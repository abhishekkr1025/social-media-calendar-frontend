import { useState, useRef, useEffect } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { SiWordpress } from 'react-icons/si';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Send, X } from 'lucide-react';

const PLATFORM_ICONS = {
    facebook:  { Icon: Facebook,  color: '#1877F2' },
    instagram: { Icon: Instagram, color: '#E1306C' },
    twitter:   { Icon: Twitter,   color: '#1DA1F2' },
    linkedin:  { Icon: Linkedin,  color: '#0A66C2' },
    youtube:   { Icon: Youtube,   color: '#FF0000' },
    telegram:  { Icon: Send,      color: '#229ED9' },
};

const STATUS_COLORS = {
    published:  { bg: '#DCFCE7', text: '#15803D' },
    scheduled:  { bg: '#FEF9C3', text: '#A16207' },
    failed:     { bg: '#FEE2E2', text: '#DC2626' },
    processing: { bg: '#DBEAFE', text: '#1D4ED8' },
};

// ── Real-time countdown hook ──────────────────────────────────────────────────
function useCountdown(dateStr, timeStr) {
    const getRemaining = () => {
        if (!dateStr || !timeStr) return null;
        const target = new Date(`${dateStr}T${timeStr}:00`);
        return target - new Date();
    };

    const [remaining, setRemaining] = useState(getRemaining);

    useEffect(() => {
        const tick = () => setRemaining(getRemaining());
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [dateStr, timeStr]);

    if (remaining === null) return { label: '—', color: '#9B9590', urgent: false };
    if (remaining < 0)      return { label: 'Published', color: '#15803D', urgent: false, done: true };

    const totalSecs = Math.floor(remaining / 1000);
    const days      = Math.floor(totalSecs / 86400);
    const hours     = Math.floor((totalSecs % 86400) / 3600);
    const mins      = Math.floor((totalSecs % 3600) / 60);
    const secs      = totalSecs % 60;

    const urgent  = totalSecs < 3600;
    const warning = totalSecs < 86400;

    let label;
    if (days > 0)       label = `${days}d ${hours}h ${mins}m`;
    else if (hours > 0) label = `${hours}h ${mins}m ${String(secs).padStart(2,'0')}s`;
    else                label = `${mins}m ${String(secs).padStart(2,'0')}s`;

    const color = urgent ? '#DC2626' : warning ? '#D97706' : '#059669';
    const bg    = urgent ? '#FEF2F2' : warning ? '#FFFBEB' : '#F0FDF4';

    return { label, color, bg, urgent, warning, done: false };
}

function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// ── Draggable wrapper (keep existing DnD) ────────────────────────────────────
function DraggablePost({ post }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: post.id });
    return (
        <div ref={setNodeRef} {...listeners} {...attributes}
            style={{ opacity: isDragging ? 0.4 : 1, cursor: 'grab' }}
        />
    );
}

// ── Main Calendar ─────────────────────────────────────────────────────────────
function MonthCalendar({ posts = [], wpPosts = [], onDateClick, calendarDate }) {
    const [popup, setPopup] = useState(null); // { dateStr, type: 'social'|'wp', items, anchorRect }

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startIndex = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startIndex; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));

    const isToday = (d) => {
        const t = new Date();
        return d.getFullYear() === t.getFullYear() &&
            d.getMonth() === t.getMonth() &&
            d.getDate() === t.getDate();
    };

    const handleBadgeClick = (e, dateStr, type, items) => {
        e.stopPropagation();
        if (popup?.dateStr === dateStr && popup?.type === type) {
            setPopup(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setPopup({ dateStr, type, items, anchorRect: rect });
    };

    const closePopup = () => setPopup(null);

    return (
        <div style={{ position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.94) translateY(-4px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%      { opacity: 0.4; transform: scale(0.8); }
                }
                    from { opacity: 0; transform: scale(0.94) translateY(-4px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                    <div key={d} style={{
                        textAlign: 'center', fontSize: 11, fontWeight: 700,
                        color: '#9B9590', letterSpacing: '0.06em',
                        textTransform: 'uppercase', padding: '4px 0',
                    }}>{d}</div>
                ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {days.map((dateObj, idx) => {
                    if (!dateObj) return <div key={idx} />;

                    const dateStr = toLocalDateString(dateObj);
                    const socialItems = posts.filter(p => p.date === dateStr);
                    const wpItems = wpPosts.filter(p => p.date === dateStr);
                    const today = isToday(dateObj);

                    return (
                        <DroppableCell
                            key={dateStr}
                            dateStr={dateStr}
                            onClick={() => { closePopup(); onDateClick(dateStr); }}
                            today={today}
                        >
                            {/* Date number */}
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700,
                                background: today ? '#1D4ED8' : 'transparent',
                                color: today ? 'white' : '#374151',
                                marginBottom: 4, flexShrink: 0,
                            }}>
                                {dateObj.getDate()}
                            </div>

                            {/* Count badges */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

                                {/* Social badge */}
                                {socialItems.length > 0 && (
                                    <button
                                        onClick={e => handleBadgeClick(e, dateStr, 'social', socialItems)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            padding: '4px 8px', borderRadius: 8,
                                            border: popup?.dateStr === dateStr && popup?.type === 'social'
                                                ? '1.5px solid #3B82F6'
                                                : '1.5px solid #BFDBFE',
                                            background: popup?.dateStr === dateStr && popup?.type === 'social'
                                                ? '#DBEAFE'
                                                : '#EFF6FF',
                                            cursor: 'pointer', width: '100%',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            if (!(popup?.dateStr === dateStr && popup?.type === 'social')) {
                                                e.currentTarget.style.background = '#DBEAFE';
                                                e.currentTarget.style.borderColor = '#93C5FD';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!(popup?.dateStr === dateStr && popup?.type === 'social')) {
                                                e.currentTarget.style.background = '#EFF6FF';
                                                e.currentTarget.style.borderColor = '#BFDBFE';
                                            }
                                        }}
                                    >
                                        <span style={{
                                            width: 16, height: 16, borderRadius: '50%',
                                            background: '#3B82F6', color: 'white',
                                            fontSize: 9, fontWeight: 800,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            {socialItems.length}
                                        </span>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: '#1D4ED8', lineHeight: 1 }}>
                                            Social
                                        </span>
                                    </button>
                                )}

                                {/* WP badge */}
                                {wpItems.length > 0 && (
                                    <button
                                        onClick={e => handleBadgeClick(e, dateStr, 'wp', wpItems)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            padding: '4px 8px', borderRadius: 8,
                                            border: popup?.dateStr === dateStr && popup?.type === 'wp'
                                                ? '1.5px solid #F97316'
                                                : '1.5px solid #FED7AA',
                                            background: popup?.dateStr === dateStr && popup?.type === 'wp'
                                                ? '#FFEDD5'
                                                : '#FFF7ED',
                                            cursor: 'pointer', width: '100%',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            if (!(popup?.dateStr === dateStr && popup?.type === 'wp')) {
                                                e.currentTarget.style.background = '#FFEDD5';
                                                e.currentTarget.style.borderColor = '#FDBA74';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!(popup?.dateStr === dateStr && popup?.type === 'wp')) {
                                                e.currentTarget.style.background = '#FFF7ED';
                                                e.currentTarget.style.borderColor = '#FED7AA';
                                            }
                                        }}
                                    >
                                        <span style={{
                                            width: 16, height: 16, borderRadius: '50%',
                                            background: '#F97316', color: 'white',
                                            fontSize: 9, fontWeight: 800,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            {wpItems.length}
                                        </span>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: '#C2410C', lineHeight: 1 }}>
                                            Blog
                                        </span>
                                    </button>
                                )}
                            </div>
                        </DroppableCell>
                    );
                })}
            </div>

            {/* Popup overlay — close on outside click */}
            {popup && (
                <>
                    <div
                        onClick={closePopup}
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    />
                    <PostPopup popup={popup} onClose={closePopup} />
                </>
            )}
        </div>
    );
}

// ── Droppable cell ────────────────────────────────────────────────────────────
function DroppableCell({ dateStr, onClick, today, children }) {
    const { setNodeRef, isOver } = useDroppable({ id: dateStr });
    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            style={{
                minHeight: 100, padding: '8px 6px',
                borderRadius: 10, cursor: 'pointer',
                border: today
                    ? '1.5px solid #3B82F6'
                    : isOver
                    ? '1.5px solid #93C5FD'
                    : '1.5px solid #F0EDE8',
                background: isOver ? '#F0F7FF' : today ? '#F8FBFF' : 'white',
                transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column',
                boxShadow: today ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
            }}
            onMouseEnter={e => {
                if (!today) e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={e => {
                if (!today) e.currentTarget.style.borderColor = '#F0EDE8';
            }}
        >
            {children}
        </div>
    );
}

// ── Post popup (draggable) ────────────────────────────────────────────────────
function PostPopup({ popup, onClose }) {
    const { type, items, anchorRect, dateStr } = popup;
    const isSocial = type === 'social';

    const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });

    // Initial position — below the badge
    const [pos, setPos] = useState({
        x: Math.max(8, (anchorRect?.left || 0) - 80),
        y: (anchorRect?.bottom || 0) + 8,
    });

    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const onMouseDown = (e) => {
        // Only drag on the header bar
        dragging.current = true;
        offset.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
        };
        e.preventDefault();
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!dragging.current) return;
            setPos({
                x: Math.max(0, e.clientX - offset.current.x),
                y: Math.max(0, e.clientY - offset.current.y),
            });
        };
        const onMouseUp = () => { dragging.current = false; };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [pos]);

    return (
        <div
            style={{
                position: 'fixed',
                top: pos.y,
                left: pos.x,
                zIndex: 50,
                width: 300,
                background: 'white',
                border: '1.5px solid #E5E1D8',
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                animation: 'popIn 0.18s ease',
                overflow: 'hidden',
                userSelect: 'none',
            }}
            onClick={e => e.stopPropagation()}
        >
            {/* Header — drag handle */}
            <div
                onMouseDown={onMouseDown}
                style={{
                    padding: '12px 14px 10px',
                    borderBottom: '1px solid #F0EDE8',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: isSocial ? '#EFF6FF' : '#FFF7ED',
                    cursor: 'grab',
                }}
            >
                <div>
                    {/* Drag indicator */}
                    <div style={{
                        display: 'flex', gap: 3, marginBottom: 5,
                    }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{
                                width: 3, height: 3, borderRadius: '50%',
                                background: isSocial ? '#93C5FD' : '#FDBA74',
                            }} />
                        ))}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isSocial ? '#1D4ED8' : '#C2410C', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                        {isSocial ? '📱 Social Posts' : '✍️ Blog Posts'}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{formattedDate}</div>
                </div>
                <button
                    onMouseDown={e => e.stopPropagation()} // don't trigger drag on close
                    onClick={onClose}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9B9590', display: 'flex', padding: 2,
                    }}
                >
                    <X size={15} />
                </button>
            </div>

            {/* Items */}
            <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px 0' }}>
                {items.map((item, i) => (
                    isSocial
                        ? <SocialPopupItem key={item.id || i} post={item} />
                        : <WpPopupItem key={item.id || i} post={item} />
                ))}
            </div>
        </div>
    );
}

// ── Countdown bar component ───────────────────────────────────────────────────
function CountdownBar({ countdown, time }) {
    if (!countdown) return null;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '5px 8px', borderRadius: 7,
            background: countdown.done ? '#F0FDF4' : (countdown.bg || '#F0FDF4'),
            border: `1px solid ${countdown.color}22`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {/* Pulsing dot — only when not done and urgent */}
                {!countdown.done && (
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: countdown.color, flexShrink: 0,
                        animation: countdown.urgent ? 'pulse 1s infinite' : 'none',
                    }} />
                )}
                {countdown.done && <span style={{ fontSize: 12 }}>✅</span>}
                <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280' }}>
                    {countdown.done ? 'Published' : 'Posts in'}
                </span>
            </div>
            <span style={{
                fontSize: 11, fontWeight: 800,
                color: countdown.color,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
            }}>
                {countdown.done ? '—' : countdown.label}
            </span>
        </div>
    );
}

// ── Social post popup row ─────────────────────────────────────────────────────
function SocialPopupItem({ post }) {
    const platforms = Array.isArray(post.platforms) ? post.platforms : [];
    const countdown = useCountdown(post.date, post.time);

    return (
        <div style={{
            padding: '8px 14px 10px',
            borderBottom: '1px solid #F9F7F3',
            display: 'flex', flexDirection: 'column', gap: 6,
        }}>
            {/* Caption */}
            <p style={{
                fontSize: 12, color: '#374151', margin: 0,
                lineHeight: 1.4, fontWeight: 500,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
                {post.caption || post.title || '—'}
            </p>

            {/* Platform icons + scheduled time */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                    {platforms.map(p => {
                        const cfg = PLATFORM_ICONS[p];
                        if (!cfg) return null;
                        const { Icon, color } = cfg;
                        return (
                            <span key={p} style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: color + '18',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={11} color={color} />
                            </span>
                        );
                    })}
                </div>
                <span style={{ fontSize: 10, color: '#9B9590', fontWeight: 600 }}>
                    🕐 {post.time || '—'}
                </span>
            </div>

            {/* Countdown */}
            <CountdownBar countdown={countdown} time={post.time} />
        </div>
    );
}

// ── WP post popup row ─────────────────────────────────────────────────────────
function WpPopupItem({ post }) {
    const status = post.status || 'scheduled';
    const statusStyle = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#6B7280' };
    const countdown = useCountdown(post.date, post.time);

    return (
        <div style={{
            padding: '8px 14px 10px',
            borderBottom: '1px solid #F9F7F3',
            display: 'flex', flexDirection: 'column', gap: 6,
        }}>
            {/* Title */}
            <p style={{
                fontSize: 12, color: '#374151', margin: 0,
                lineHeight: 1.4, fontWeight: 500,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
                {post.title || '—'}
            </p>

            {/* WP icon + language + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <SiWordpress size={12} color="#F97316" />
                    <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>
                        {post.language || '—'}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 10, color: '#9B9590', fontWeight: 600 }}>
                        🕐 {post.time || '—'}
                    </span>
                    <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px',
                        borderRadius: 20, background: statusStyle.bg, color: statusStyle.text,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Countdown — only for scheduled posts */}
            {status === 'scheduled' && (
                <CountdownBar countdown={countdown} time={post.time} />
            )}
        </div>
    );
}

export default MonthCalendar;