import { useState, useEffect, useRef } from 'react'
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Send, X, Image, Tag, Link2, Clock, ChevronDown, Sparkles } from 'lucide-react'
import { SiWordpress } from 'react-icons/si'
import { showError, showSuccess, showWarning } from '@/components/Toast'

const BASE_URL = "https://prod.panditjee.com"
// const BASE_URL = "http://localhost:5000"

const platformConfig = {
    facebook:  { icon: Facebook,  color: '#1877F2', bg: '#E7F0FD', label: 'Facebook' },
    instagram: { icon: Instagram, color: '#E1306C', bg: '#FCE4EC', label: 'Instagram' },
    twitter:   { icon: Twitter,   color: '#1DA1F2', bg: '#E3F2FD', label: 'Twitter' },
    linkedin:  { icon: Linkedin,  color: '#0A66C2', bg: '#E8F4FD', label: 'LinkedIn' },
    youtube:   { icon: Youtube,   color: '#FF0000', bg: '#FFEBEE', label: 'YouTube' },
    telegram:  { icon: Send,      color: '#229ED9', bg: '#E3F4FC', label: 'Telegram' },
}

const BLOG_LANGUAGES = [
    { label: "English",  value: "English",  flag: "🇬🇧" },
    { label: "Hindi",    value: "Hindi",    flag: "🇮🇳" },
    { label: "Tamil",    value: "Tamil",    flag: "🇮🇳" },
    { label: "Telugu",   value: "Telugu",   flag: "🇮🇳" },
    { label: "Marathi",  value: "Marathi",  flag: "🇮🇳" },
    { label: "Bengali",  value: "Bengali",  flag: "🇮🇳" },
    { label: "Gujarati", value: "Gujarati", flag: "🇮🇳" },
]

export default function BottomSheetScheduler({
    isOpen,
    onClose,
    selectedDate,
    clients,
    selectedClient,
    onSelectClient,
    masterCategories,
    onPostScheduled, // callback to refresh posts after scheduling
}) {
    const [type, setType] = useState('social')
    const [isVisible, setIsVisible] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Social post state
    const [social, setSocial] = useState({
        content: '', file: null, platforms: [], time: '09:00'
    })

    // Blog post state
    const [blog, setBlog] = useState({
        title: '', content: '', language: 'English',
        master_category_id: '', featured_image: null,
        slug: '', tags: '', time: '09:00'
    })

    // ── Animation ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsAnimating(true))
            })
        } else {
            setIsAnimating(false)
            const t = setTimeout(() => setIsVisible(false), 400)
            return () => clearTimeout(t)
        }
    }, [isOpen])

    const resetAndClose = () => {
        setIsAnimating(false)
        setTimeout(() => {
            onClose()
            setSocial({ content: '', file: null, platforms: [], time: '09:00' })
            setBlog({
                title: '', content: '', language: 'English',
                master_category_id: '', featured_image: null,
                slug: '', tags: '', time: '09:00'
            })
        }, 400)
    }

    // ── Social Post Submit ────────────────────────────────────────────────────

    const handleScheduleSocial = async () => {
        if (!selectedClient) {
            showWarning("Please select a client")
            return
        }
        if (!social.content) {
            showWarning("Please enter post content")
            return
        }
        if (social.platforms.length === 0) {
            showWarning("Please select at least one platform")
            return
        }
        if (!social.file) {
            showWarning("Please upload an image or video")
            return
        }
        if (!social.time) {
            showWarning("Please select a time")
            return
        }

        setIsSubmitting(true)

        try {
            const scheduled_at = `${selectedDate} ${social.time}:00`

            const formData = new FormData()
            formData.append("clientId", selectedClient.id)
            formData.append("title", social.content)
            formData.append("caption", social.content)
            formData.append("scheduled_at", scheduled_at)
            formData.append("platforms", JSON.stringify(social.platforms))
            formData.append("file", social.file)

            const res = await fetch(`${BASE_URL}/api/posts`, {
                method: "POST",
                body: formData
            })

            if (!res.ok) throw new Error("Failed to save post")

            showSuccess(`Post scheduled on ${social.platforms.join(', ')}`)

            if (onPostScheduled) onPostScheduled()
            resetAndClose()

        } catch (err) {
            console.error("❌ Error scheduling post:", err)
            showError("Failed to schedule post. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // ── Blog Post Submit ──────────────────────────────────────────────────────

    const handleScheduleBlog = async () => {
        if (!selectedClient) {
            showWarning("Please select a client")
            return
        }
        if (!blog.title) {
            showWarning("Blog title is required")
            return
        }
        if (!blog.content) {
            showWarning("Blog content is required")
            return
        }
        if (!blog.time) {
            showWarning("Please select a time")
            return
        }

        setIsSubmitting(true)

        try {
            const scheduled_at = `${selectedDate} ${blog.time}:00`

            const formData = new FormData()
            formData.append("clientId", selectedClient.id)
            formData.append("title", blog.title)
            formData.append("content", blog.content)
            formData.append("excerpt", "")
            formData.append("scheduled_at", scheduled_at)
            formData.append("status", "scheduled")
            formData.append("language", blog.language)
            formData.append("master_category_id", blog.master_category_id || "")
            formData.append("slug", blog.slug || "")
            formData.append("tags", blog.tags || "")

            if (blog.featured_image) {
                formData.append("featured_image", blog.featured_image)
            }

            const res = await fetch(`${BASE_URL}/api/wp-posts`, {
                method: "POST",
                body: formData
            })

            if (!res.ok) {
                const err = await res.text()
                console.error(err)
                showError("Failed to schedule blog post")
                return
            }

            showSuccess("Blog post scheduled successfully!")

            if (onPostScheduled) onPostScheduled()
            resetAndClose()

        } catch (err) {
            console.error("❌ Error scheduling blog:", err)
            showError("Failed to schedule blog post. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = () => {
        if (type === 'social') handleScheduleSocial()
        else handleScheduleBlog()
    }

    const togglePlatform = (p) => {
        setSocial(prev => ({
            ...prev,
            platforms: prev.platforms.includes(p)
                ? prev.platforms.filter(x => x !== p)
                : [...prev.platforms, p]
        }))
    }

    if (!isVisible) return null

    const formattedDate = selectedDate
        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : 'Today'

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet" />

            {/* Backdrop */}
            <div
                onClick={resetAndClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    background: 'rgba(15,12,10,0.55)',
                    backdropFilter: 'blur(6px)',
                    opacity: isAnimating ? 1 : 0,
                    transition: 'opacity 0.4s cubic-bezier(0.32,0.72,0,1)',
                }}
            />

            {/* Sheet */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
                transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.45s cubic-bezier(0.32,0.72,0,1)',
                borderRadius: '28px 28px 0 0',
                background: '#FAFAF7',
                boxShadow: '0 -12px 60px rgba(0,0,0,0.22)',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'DM Sans', sans-serif",
            }}>

                {/* Drag handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
                    <div style={{ width: 44, height: 4, borderRadius: 2, background: '#CCC8BE' }} />
                </div>

                {/* Header */}
                <div style={{ padding: '14px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <Sparkles size={12} color="#8B6F47" />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#8B6F47', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Schedule
                            </span>
                        </div>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 24, fontWeight: 700,
                            color: '#1A1714', margin: 0, lineHeight: 1.25
                        }}>
                            {formattedDate}
                        </h2>
                    </div>
                    <button onClick={resetAndClose} style={{
                        width: 34, height: 34, borderRadius: '50%',
                        border: '1.5px solid #E8E4DA', background: 'white',
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        marginTop: 4, flexShrink: 0,
                    }}>
                        <X size={15} color="#6B6760" />
                    </button>
                </div>

                {/* Type toggle */}
                <div style={{ padding: '16px 28px 0' }}>
                    <div style={{
                        display: 'inline-flex', background: '#EDEAD E',
                        background: '#EDEADE', borderRadius: 14, padding: 3,
                    }}>
                        {[
                            { key: 'social', label: '📱 Social Post' },
                            { key: 'blog',   label: '✍️ Blog Post' },
                        ].map(({ key, label }) => (
                            <button key={key} onClick={() => setType(key)} style={{
                                padding: '8px 22px', borderRadius: 11,
                                border: 'none', cursor: 'pointer',
                                fontSize: 13, fontWeight: 600,
                                fontFamily: "'DM Sans', sans-serif",
                                transition: 'all 0.2s ease',
                                background: type === key ? 'white' : 'transparent',
                                color: type === key ? '#1A1714' : '#9B9590',
                                boxShadow: type === key ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                            }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable form body */}
                <div style={{
                    flex: 1, overflowY: 'auto',
                    padding: '20px 28px 8px',
                    display: 'flex', flexDirection: 'column', gap: 18,
                }}>

                    {/* Client */}
                    <div>
                        <FieldLabel>Client</FieldLabel>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                            {clients.map(c => (
                                <button key={c.id} onClick={() => onSelectClient(c)} style={{
                                    padding: '7px 16px', borderRadius: 20,
                                    border: selectedClient?.id === c.id
                                        ? '2px solid #8B6F47'
                                        : '1.5px solid #E5E1D8',
                                    background: selectedClient?.id === c.id ? '#F5EDE0' : 'white',
                                    color: selectedClient?.id === c.id ? '#7A5C35' : '#6B6760',
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.15s',
                                }}>
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── SOCIAL FORM ── */}
                    {type === 'social' && (
                        <>
                            {/* Platforms */}
                            <div>
                                <FieldLabel>Platforms</FieldLabel>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                                    {Object.entries(platformConfig).map(([key, cfg]) => {
                                        const selected = social.platforms.includes(key)
                                        const Icon = cfg.icon
                                        return (
                                            <button key={key} onClick={() => togglePlatform(key)} style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '8px 14px', borderRadius: 10,
                                                border: selected ? `2px solid ${cfg.color}` : '1.5px solid #E5E1D8',
                                                background: selected ? cfg.bg : 'white',
                                                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                                                fontFamily: "'DM Sans', sans-serif",
                                                color: selected ? cfg.color : '#6B6760',
                                                transition: 'all 0.15s',
                                            }}>
                                                <Icon size={14} color={selected ? cfg.color : '#9B9590'} />
                                                {cfg.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <FieldLabel>Content</FieldLabel>
                                <textarea
                                    value={social.content}
                                    onChange={e => setSocial(p => ({ ...p, content: e.target.value }))}
                                    placeholder="What's on your mind? Write your post caption here..."
                                    rows={4}
                                    style={{ ...textareaStyle, marginTop: 8 }}
                                />
                                <div style={{ fontSize: 11, color: '#B0AAA0', textAlign: 'right', marginTop: 3 }}>
                                    {social.content.length} chars
                                </div>
                            </div>

                            {/* Media Upload */}
                            <FileUpload
                                label="Media (Image / Video)"
                                accept="image/*,video/*"
                                file={social.file}
                                onChange={f => setSocial(p => ({ ...p, file: f }))}
                                onRemove={() => setSocial(p => ({ ...p, file: null }))}
                            />

                            {/* Time */}
                            <TimeField
                                value={social.time}
                                onChange={v => setSocial(p => ({ ...p, time: v }))}
                            />
                        </>
                    )}

                    {/* ── BLOG FORM ── */}
                    {type === 'blog' && (
                        <>
                            {/* Language + Category */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <FieldLabel>Language</FieldLabel>
                                    <SelectField
                                        value={blog.language}
                                        onChange={v => setBlog(p => ({ ...p, language: v }))}
                                    >
                                        {BLOG_LANGUAGES.map(l => (
                                            <option key={l.value} value={l.value}>
                                                {l.flag} {l.label}
                                            </option>
                                        ))}
                                    </SelectField>
                                </div>
                                <div>
                                    <FieldLabel>Category</FieldLabel>
                                    <SelectField
                                        value={blog.master_category_id}
                                        onChange={v => setBlog(p => ({ ...p, master_category_id: v }))}
                                    >
                                        <option value="">Select...</option>
                                        {masterCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </SelectField>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <FileUpload
                                label="Featured Image"
                                accept="image/*"
                                file={blog.featured_image}
                                onChange={f => setBlog(p => ({ ...p, featured_image: f }))}
                                onRemove={() => setBlog(p => ({ ...p, featured_image: null }))}
                                optional
                                hint="Site default image used if not uploaded"
                            />

                            {/* Title */}
                            <div>
                                <FieldLabel>Blog Title</FieldLabel>
                                <input
                                    type="text"
                                    value={blog.title}
                                    onChange={e => setBlog(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Enter a compelling title..."
                                    style={{ ...inputStyle, marginTop: 8 }}
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <FieldLabel>Blog Content</FieldLabel>
                                <textarea
                                    value={blog.content}
                                    onChange={e => setBlog(p => ({ ...p, content: e.target.value }))}
                                    placeholder="Write your article here... HTML supported."
                                    rows={7}
                                    style={{ ...textareaStyle, marginTop: 8 }}
                                />
                                <div style={{ fontSize: 11, color: '#B0AAA0', textAlign: 'right', marginTop: 3 }}>
                                    {blog.content.length} chars
                                </div>
                            </div>

                            {/* Slug + Tags side by side */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {/* Slug */}
                                <div>
                                    <FieldLabel optional>
                                        <Link2 size={11} style={{ marginRight: 4 }} /> Slug
                                    </FieldLabel>
                                    <div style={{
                                        display: 'flex', marginTop: 8,
                                        border: '1.5px solid #E5E1D8', borderRadius: 10,
                                        overflow: 'hidden', background: 'white',
                                        transition: 'border-color 0.15s',
                                    }}>
                                        <span style={{
                                            padding: '10px 10px', fontSize: 11,
                                            color: '#B0AAA0', background: '#F7F5F1',
                                            borderRight: '1.5px solid #E5E1D8',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            /article/
                                        </span>
                                        <input
                                            type="text"
                                            value={blog.slug}
                                            onChange={e => setBlog(p => ({
                                                ...p,
                                                slug: e.target.value.toLowerCase()
                                                    .replace(/\s+/g, '-')
                                                    .replace(/[^a-z0-9-]/g, '')
                                            }))}
                                            placeholder="post-slug"
                                            style={{
                                                flex: 1, border: 'none', outline: 'none',
                                                padding: '10px 10px', fontSize: 12,
                                                background: 'transparent',
                                                fontFamily: "'DM Sans', sans-serif",
                                                color: '#1A1714',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <FieldLabel optional>
                                        <Tag size={11} style={{ marginRight: 4 }} /> Tags
                                    </FieldLabel>
                                    <input
                                        type="text"
                                        value={blog.tags}
                                        onChange={e => setBlog(p => ({ ...p, tags: e.target.value }))}
                                        placeholder="politics, india, news"
                                        style={{ ...inputStyle, marginTop: 8 }}
                                    />
                                </div>
                            </div>

                            {/* Tag chips preview */}
                            {blog.tags && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: -8 }}>
                                    {blog.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                        <span key={i} style={{
                                            padding: '3px 10px', borderRadius: 20,
                                            background: '#EEF4FF', color: '#3B82F6',
                                            fontSize: 12, fontWeight: 500,
                                            border: '1px solid #BFDBFE',
                                        }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Time */}
                            <TimeField
                                value={blog.time}
                                onChange={v => setBlog(p => ({ ...p, time: v }))}
                            />
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '16px 28px 36px',
                    borderTop: '1px solid #EDEADE',
                    background: '#FAFAF7',
                    display: 'flex', gap: 10,
                    flexShrink: 0,
                }}>
                    <button onClick={resetAndClose} disabled={isSubmitting} style={{
                        padding: '14px 22px', borderRadius: 12,
                        border: '1.5px solid #E5E1D8', background: 'white',
                        color: '#6B6760', fontSize: 14, fontWeight: 500,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        flexShrink: 0,
                    }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} style={{
                        flex: 1, padding: '14px 24px', borderRadius: 12,
                        border: 'none',
                        background: isSubmitting
                            ? '#9B9590'
                            : 'linear-gradient(135deg, #2D2420 0%, #4A3728 50%, #6B4F35 100%)',
                        color: 'white', fontSize: 14, fontWeight: 600,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8,
                        boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(45,36,32,0.35)',
                        letterSpacing: '0.01em',
                        transition: 'all 0.2s',
                    }}>
                        {isSubmitting ? (
                            <>
                                <span style={{
                                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white', borderRadius: '50%',
                                    animation: 'spin 0.7s linear infinite',
                                    display: 'inline-block',
                                }} />
                                Scheduling...
                            </>
                        ) : (
                            <>
                                <Sparkles size={15} />
                                Schedule {type === 'social' ? 'Post' : 'Blog'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({ children, optional }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
                fontSize: 11, fontWeight: 700, color: '#7A7570',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center',
            }}>
                {children}
            </span>
            {optional && (
                <span style={{
                    fontSize: 10, color: '#B8B3AB', background: '#F0EDE6',
                    borderRadius: 4, padding: '1px 6px', fontWeight: 500,
                    textTransform: 'none', letterSpacing: 0,
                }}>
                    optional
                </span>
            )}
        </div>
    )
}

function SelectField({ value, onChange, children }) {
    return (
        <div style={{ position: 'relative', marginTop: 8 }}>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    ...inputStyle, width: '100%',
                    appearance: 'none', paddingRight: 32, cursor: 'pointer',
                }}
            >
                {children}
            </select>
            <ChevronDown size={13} style={{
                position: 'absolute', right: 11, top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none', color: '#9B9590',
            }} />
        </div>
    )
}

function TimeField({ value, onChange }) {
    return (
        <div>
            <FieldLabel>
                <Clock size={11} style={{ marginRight: 4 }} /> Publish Time
            </FieldLabel>
            <div style={{ position: 'relative', display: 'inline-block', marginTop: 8 }}>
                <input
                    type="time"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 38, width: 'auto', cursor: 'pointer' }}
                />
                <Clock size={14} style={{
                    position: 'absolute', left: 11, top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none', color: '#9B9590',
                }} />
            </div>
        </div>
    )
}

function FileUpload({ label, accept, file, onChange, onRemove, optional, hint }) {
    const ref = useRef()
    return (
        <div>
            <FieldLabel optional={optional}>{label}</FieldLabel>
            {!file ? (
                <div
                    onClick={() => ref.current.click()}
                    style={{
                        marginTop: 8, border: '1.5px dashed #D8D3C8',
                        borderRadius: 12, padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', background: '#F9F7F3',
                        transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#8B6F47'
                        e.currentTarget.style.background = '#F5EDE0'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#D8D3C8'
                        e.currentTarget.style.background = '#F9F7F3'
                    }}
                >
                    <div style={{
                        width: 38, height: 38, borderRadius: 9,
                        background: '#EDEADE', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Image size={17} color="#8B6F47" />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#4A3728' }}>
                            Click to upload
                        </div>
                        {hint && (
                            <div style={{ fontSize: 11, color: '#B0AAA0', marginTop: 1 }}>{hint}</div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{
                    marginTop: 8, borderRadius: 12, padding: '10px 14px',
                    background: '#F0F7EE', border: '1.5px solid #B8DEAF',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 7,
                            background: '#CBE8C5', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Image size={14} color="#2E7D32" />
                        </div>
                        <span style={{ fontSize: 13, color: '#2E6B28', fontWeight: 500 }}>
                            {file.name.length > 28 ? file.name.substring(0, 28) + '…' : file.name}
                        </span>
                    </div>
                    <button onClick={onRemove} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#C62828', display: 'flex', alignItems: 'center', padding: 4,
                    }}>
                        <X size={15} />
                    </button>
                </div>
            )}
            <input ref={ref} type="file" accept={accept} style={{ display: 'none' }}
                onChange={e => onChange(e.target.files?.[0] || null)} />
        </div>
    )
}

// ── Shared styles ────────────────────────────────────────────────────────────

const inputStyle = {
    padding: '10px 14px',
    borderRadius: 10, border: '1.5px solid #E5E1D8',
    fontSize: 13, color: '#1A1714',
    background: 'white', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
}

const textareaStyle = {
    ...inputStyle,
    width: '100%', resize: 'vertical',
    lineHeight: 1.65, display: 'block',
}