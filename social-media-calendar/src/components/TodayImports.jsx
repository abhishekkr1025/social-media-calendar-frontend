import { useState, useEffect } from "react";
import { authFetch } from "../lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// const API_BASE =  "http://localhost:5000";

// Deterministic pseudo-random rotation per card, so it doesn't jitter on re-render
function rotationFor(id) {
    const seed = (id * 9301 + 49297) % 233280;
    const rand = seed / 233280; // 0..1
    return (rand * 5 - 2.5).toFixed(2); // -2.5deg .. 2.5deg
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

export default function TodayImports() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        loadToday();
    }, []);

    async function loadToday() {
        setLoading(true);
        try {
            const res = await authFetch(`${API_BASE}/api/bulk-import-md/today`);
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load today's imports", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');

                .ti-wrap {
                    margin-top: 40px;
                    font-family: 'Lora', serif;
                }

                .ti-heading {
                    display: flex;
                    align-items: baseline;
                    gap: 10px;
                    margin-bottom: 4px;
                }

                .ti-heading h2 {
                    font-family: 'Special Elite', monospace;
                    font-size: 18px;
                    font-weight: 400;
                    letter-spacing: 0.5px;
                    color: #2b2420;
                    margin: 0;
                }

                .ti-heading .ti-count {
                    font-family: 'Special Elite', monospace;
                    font-size: 12px;
                    color: #a63d2f;
                }

                .ti-subtext {
                    font-size: 12.5px;
                    color: #8a7c67;
                    margin: 0 0 24px 0;
                    font-style: italic;
                }

                .ti-empty {
                    padding: 40px 20px;
                    text-align: center;
                    font-family: 'Special Elite', monospace;
                    color: #a89a80;
                    font-size: 13px;
                    border: 1px dashed #d9cfb8;
                    border-radius: 4px;
                    background: #faf6ec;
                }

                .ti-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
                    gap: 28px 22px;
                    padding: 8px 4px 24px;
                }

                .ti-card {
                    --rot: 0deg;
                    position: relative;
                    background: linear-gradient(180deg, #faf5e6 0%, #f3ead2 100%);
                    border-radius: 2px;
                    padding: 20px 18px 26px;
                    cursor: pointer;
                    transform: rotate(var(--rot));
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    box-shadow:
                        0 1px 2px rgba(60,40,20,0.15),
                        0 6px 14px rgba(60,40,20,0.12);
                    min-height: 150px;
                    display: flex;
                    flex-direction: column;
                }

                /* torn top edge */
                .ti-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 6px;
                    background: repeating-linear-gradient(
                        110deg,
                        transparent 0px, transparent 5px,
                        rgba(60,40,20,0.06) 5px, rgba(60,40,20,0.06) 6px
                    );
                    clip-path: polygon(0% 100%, 2% 0%, 6% 80%, 11% 10%, 16% 90%, 21% 5%, 27% 75%, 33% 0%, 39% 85%, 45% 15%, 51% 95%, 57% 10%, 63% 80%, 69% 0%, 75% 90%, 81% 20%, 87% 100%, 93% 5%, 100% 100%);
                }

                /* dog-ear fold, bottom right */
                .ti-card::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 22px;
                    height: 22px;
                    background: linear-gradient(135deg, #e6d8b8 45%, #d3c39c 50%, #c3b287 100%);
                    clip-path: polygon(100% 0%, 0% 100%, 100% 100%);
                    box-shadow: -2px -2px 4px rgba(60,40,20,0.15);
                }

                .ti-card:hover {
                    transform: rotate(var(--rot)) translateY(-4px);
                    box-shadow:
                        0 2px 4px rgba(60,40,20,0.18),
                        0 12px 24px rgba(60,40,20,0.18);
                }

                .ti-stamp {
                    align-self: flex-start;
                    font-family: 'Special Elite', monospace;
                    font-size: 10.5px;
                    color: #a63d2f;
                    border: 1.5px dashed rgba(166,61,47,0.55);
                    border-radius: 50%;
                    width: 54px;
                    height: 54px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    line-height: 1.2;
                    transform: rotate(-9deg);
                    mix-blend-mode: multiply;
                    margin-bottom: 14px;
                    padding: 4px;
                }

                .ti-title {
                    font-family: 'Lora', serif;
                    font-weight: 600;
                    font-size: 15px;
                    color: #2b2420;
                    line-height: 1.35;
                    margin: 0 0 8px 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .ti-excerpt {
                    font-size: 12px;
                    color: #6b5f4f;
                    line-height: 1.5;
                    margin: 0;
                    flex: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .ti-meta {
                    font-family: 'Special Elite', monospace;
                    font-size: 10.5px;
                    color: #a89a80;
                    margin-top: 14px;
                    padding-top: 10px;
                    border-top: 1px dashed #d9cfb8;
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                }

                .ti-meta span:last-child {
                    text-align: right;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* Modal */
                .ti-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(30, 22, 14, 0.55);
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding: 5vh 20px;
                    overflow-y: auto;
                    z-index: 1000;
                    animation: ti-fade-in 0.15s ease;
                }

                @keyframes ti-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .ti-sheet {
                    background: #fbf7ea;
                    max-width: 680px;
                    width: 100%;
                    padding: 44px 48px 52px;
                    position: relative;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
                    animation: ti-unfold 0.22s cubic-bezier(0.2, 0.8, 0.3, 1);
                    transform-origin: top center;
                }

                @keyframes ti-unfold {
                    from { transform: scaleY(0.85) translateY(-10px); opacity: 0; }
                    to { transform: scaleY(1) translateY(0); opacity: 1; }
                }

                .ti-sheet-close {
                    position: absolute;
                    top: 18px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-family: 'Special Elite', monospace;
                    font-size: 13px;
                    color: #a89a80;
                    cursor: pointer;
                    padding: 4px 8px;
                }

                .ti-sheet-close:hover { color: #a63d2f; }

                .ti-sheet-meta {
                    font-family: 'Special Elite', monospace;
                    font-size: 11px;
                    color: #a89a80;
                    margin-bottom: 18px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px 14px;
                }

                .ti-sheet-title {
                    font-family: 'Lora', serif;
                    font-weight: 600;
                    font-size: 26px;
                    line-height: 1.3;
                    color: #2b2420;
                    margin: 0 0 20px 0;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #d9cfb8;
                }

                .ti-sheet-body {
                    font-family: 'Lora', serif;
                    font-size: 15.5px;
                    line-height: 1.75;
                    color: #362e26;
                }

                .ti-sheet-body p { margin: 0 0 16px 0; }
                .ti-sheet-body h1, .ti-sheet-body h2, .ti-sheet-body h3 {
                    font-family: 'Lora', serif;
                    color: #2b2420;
                    margin: 24px 0 10px 0;
                }
                .ti-sheet-body img { max-width: 100%; }
            `}</style>

            <div className="ti-wrap">
                <div className="ti-heading">
                    <h2>On the Desk Today</h2>
                    {posts.length > 0 && <span className="ti-count">({posts.length})</span>}
                </div>
                <p className="ti-subtext">Articles imported today — click a card to read the full piece.</p>

                {loading ? (
                    <div className="ti-empty">Fetching today's papers…</div>
                ) : posts.length === 0 ? (
                    <div className="ti-empty">Nothing imported today yet. The desk is clear.</div>
                ) : (
                    <div className="ti-grid">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="ti-card"
                                style={{ "--rot": `${rotationFor(post.id)}deg` }}
                                onClick={() => setSelected(post)}
                            >
                                <div className="ti-stamp">
                                    {formatTime(post.created_at)}
                                </div>
                                <p className="ti-title">{post.title}</p>
                                <p className="ti-excerpt">
                                    {post.excerpt || stripHtml(post.content).slice(0, 140)}
                                </p>
                                <div className="ti-meta">
                                    <span>{post.client_name || "—"}</span>
                                    <span title={post.source_filename}>{post.source_filename || ""}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="ti-overlay" onClick={() => setSelected(null)}>
                    <div className="ti-sheet" onClick={(e) => e.stopPropagation()}>
                        <button className="ti-sheet-close" onClick={() => setSelected(null)}>
                            ✕ close
                        </button>
                        <div className="ti-sheet-meta">
                            <span>{selected.client_name || "—"}</span>
                            <span>{selected.language}</span>
                            <span>{selected.source_filename}</span>
                            <span>{new Date(selected.created_at).toLocaleString()}</span>
                        </div>
                        <h1 className="ti-sheet-title">{selected.title}</h1>
                        <div
                            className="ti-sheet-body"
                            dangerouslySetInnerHTML={{ __html: selected.content }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}