// NewsSkillLauncher.jsx
import { useState } from 'react';

const SKILLS = [
    {
        number: '01',
        name: 'Daily news listing',
        description:
            "Pulls today's stories into the DAY AHEAD / FOLLOW UP STORIES format, sourced live.",
        prompt: '/daily-news-listing',
        note: 'Opens claude.ai with the prompt ready. Sign in and press send.',
    },
    {
        number: '02',
        name: 'Cliq news articles',
        description:
            "Turns a news listing into drafted articles, formatted for Cliq's publishing pipeline.",
        prompt: '/cliq-news-articles',
        note: 'Opens claude.ai with the command ready — paste the listing from step 1 before sending.',
    },
];

function openInClaude(prompt) {
    const url = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

    // Browsers don't let a page clear another site's cache/cookies directly.
    // The practical equivalent: open claude.ai's logout URL first, then redirect
    // that same tab to the prompt URL once the session has cleared. This will
    // also sign the user out of any other open claude.ai tabs.
    const win = window.open('https://claude.ai/logout', '_blank');
    if (!win) return; // popup blocked

    setTimeout(() => {
        win.location.href = url;
    }, 1200);
}

function SkillTicket({ skill, isLast }) {
    const [copied, setCopied] = useState(false);
    const [primaryHover, setPrimaryHover] = useState(false);
    const [secondaryHover, setSecondaryHover] = useState(false);

    const copyPrompt = async () => {
        await navigator.clipboard.writeText(skill.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div style={styles.ticketRow}>
            <div style={styles.ticketSpine}>
                <span style={styles.ticketNumber}>{skill.number}</span>
                {!isLast && <span style={styles.ticketConnector} aria-hidden="true" />}
            </div>

            <div style={styles.ticketBody}>
                <h3 style={styles.ticketName}>{skill.name}</h3>
                <p style={styles.ticketDescription}>{skill.description}</p>
                <p style={styles.ticketNote}>{skill.note}</p>

                <div style={styles.ticketActions}>
                    <button
                        onClick={() => openInClaude(skill.prompt)}
                        onMouseEnter={() => setPrimaryHover(true)}
                        onMouseLeave={() => setPrimaryHover(false)}
                        style={{
                            ...styles.btnPrimary,
                            ...(primaryHover ? styles.btnPrimaryHover : null),
                        }}
                    >
                        Open in Claude
                    </button>
                   
                </div>
            </div>
        </div>
    );
}

export default function NewsSkillLauncher() {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div style={styles.dispatchBoard}>
            <header style={styles.masthead}>
                <div style={styles.mastheadTop}>
                    <span style={styles.mastheadWord}>Dispatch</span>
                    <span style={styles.mastheadDate}>{today}</span>
                </div>
                <p style={styles.mastheadSubtitle}>News skill launcher</p>
                <div style={styles.mastheadRule} />
            </header>

            <div style={styles.ticketList}>
                {SKILLS.map((skill, i) => (
                    <SkillTicket key={skill.number} skill={skill} isLast={i === SKILLS.length - 1} />
                ))}
            </div>

            <footer style={styles.boardFooter}>
                <div style={styles.mastheadRule} />
                <p style={styles.footerText}>
                    Each button signs you out of claude.ai and opens a new tab with the
                    prompt ready — nothing here stores or touches your Claude login.
                </p>
            </footer>
        </div>
    );
}

const styles = {
    dispatchBoard: {
        maxWidth: 640,
        margin: "0 auto",
        padding: "32px 24px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#1a1a1a",
    },
    masthead: {
        marginBottom: 32,
    },
    mastheadTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    mastheadWord: {
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: "-0.02em",
    },
    mastheadDate: {
        fontSize: 13,
        color: "#666",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
    },
    mastheadSubtitle: {
        fontSize: 14,
        color: "#555",
        margin: "4px 0 0",
    },
    mastheadRule: {
        marginTop: 14,
        borderTop: "2px solid #1a1a1a",
    },
    ticketList: {
        display: "flex",
        flexDirection: "column",
    },
    ticketRow: {
        display: "flex",
        gap: 16,
    },
    ticketSpine: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 32,
        flexShrink: 0,
    },
    ticketNumber: {
        fontSize: 13,
        fontWeight: 600,
        color: "#888",
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
    },
    ticketConnector: {
        flex: 1,
        width: 1,
        background: "#ccc",
        marginTop: 4,
        marginBottom: 4,
    },
    ticketBody: {
        flex: 1,
        paddingBottom: 28,
    },
    ticketName: {
        fontSize: 18,
        fontWeight: 700,
        margin: "2px 0 6px",
    },
    ticketDescription: {
        fontSize: 14,
        lineHeight: 1.5,
        color: "#333",
        margin: "0 0 6px",
    },
    ticketNote: {
        fontSize: 12,
        color: "#888",
        fontStyle: "italic",
        margin: "0 0 12px",
    },
    ticketActions: {
        display: "flex",
        gap: 10,
    },
    btnPrimary: {
        padding: "8px 16px",
        background: "#1a1a1a",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "inherit",
        fontWeight: 600,
        transition: "background 0.15s ease",
    },
    btnPrimaryHover: {
        background: "#333",
    },
    btnSecondary: {
        padding: "8px 16px",
        background: "#fff",
        color: "#1a1a1a",
        border: "1px solid #1a1a1a",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "inherit",
        fontWeight: 600,
        transition: "background 0.15s ease",
    },
    btnSecondaryHover: {
        background: "#f2f2f2",
    },
    boardFooter: {
        marginTop: 8,
    },
    footerText: {
        fontSize: 12,
        color: "#888",
        marginTop: 12,
        lineHeight: 1.5,
    },
};