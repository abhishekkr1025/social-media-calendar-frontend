import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authFetch } from "../lib/auth";
import TodayImports from "@/components/TodayImports";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const LANGUAGE_OPTIONS = [
    "English", "Hindi", "Tamil", "Telugu", "Marathi", "Gujarati",
    "Punjabi", "Bengali", "Kannada", "Malayalam", "Urdu"
];

//trying again CI CD Pipeline testing
// Default client to preselect once the client list loads — change here if it changes.
const DEFAULT_CLIENT_EMAIL = "cliqindiaoffice@gmail.com";
const DEFAULT_LANGUAGE = "English";

let rowIdCounter = 0;
function nextRowId() {
    rowIdCounter += 1;
    return `row-${Date.now()}-${rowIdCounter}`;
}

/**
    Pulls the `category:` value out of a file's YAML frontmatter, if present.
    Lightweight on purpose — we only need this one field client-side, not a full parse.
*/
function extractFrontmatterCategory(rawText) {
    const frontmatterMatch = rawText.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const catLine = frontmatterMatch[1]
        .split('\n')
        .find(line => /^\s*category\s*:/i.test(line));
    if (!catLine) return null;

    let value = catLine.split(':').slice(1).join(':').trim();
    value = value.replace(/^["']|["']$/g, '').trim();
    return value || null;
}

/**
    Maps a frontmatter `category:` value (lowercased) to the category name actually
    used in the client's master category list, for cases where the writer's category
    slug doesn't match the admin category name 1:1. Add more entries here as new
    mismatches come up — no code change needed elsewhere.
*/
const CATEGORY_ALIASES = {
    "world": "International",
    "india": "National",
    "politics": "Political",
    "science-tech": "Science & Tech"
};

function resolveCategoryName(rawCategory) {
    if (!rawCategory) return null;
    const normalized = rawCategory.trim().toLowerCase();
    return CATEGORY_ALIASES[normalized] || rawCategory;
}

/**
    Matches a category name against the loaded master category list.
    Tries an exact (case-insensitive) match first, then falls back to a loose
    substring match so e.g. "sports" still matches a category named "Sports News".
*/
function findCategoryId(categoryName, categories) {
    if (!categoryName || categories.length === 0) return "";
    const normalized = categoryName.trim().toLowerCase();

    const exact = categories.find(c => c.name.trim().toLowerCase() === normalized);
    if (exact) return String(exact.id);

    const partial = categories.find(c => {
        const name = c.name.trim().toLowerCase();
        return name.includes(normalized) || normalized.includes(name);
    });
    return partial ? String(partial.id) : "";
}

export default function BulkImportMd() {
    const [rows, setRows] = useState([]);
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState("");
    const [categories, setCategories] = useState([]);
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        loadOptions();
    }, []);

    // If files were added before categories finished loading, fill in any
    // auto-detected category that couldn't be matched yet, once the list arrives.
    useEffect(() => {
        if (categories.length === 0) return;
        setRows(prev => prev.map(r => {
            if (r.masterCategoryId || !r.detectedCategory) return r;
            const matchId = findCategoryId(resolveCategoryName(r.detectedCategory), categories);
            return matchId ? { ...r, masterCategoryId: matchId } : r;
        }));
    }, [categories]);

    async function loadOptions() {
        setLoadingOptions(true);
        try {
            const [clientsRes, categoriesRes] = await Promise.all([
                authFetch(`${API_BASE}/api/clients`),
                authFetch(`${API_BASE}/api/master-categories`)
            ]);
            const clientsData = await clientsRes.json();
            setClients(clientsData);
            setCategories(await categoriesRes.json());

            const defaultClient = clientsData.find(
                c => c.email && c.email.toLowerCase() === DEFAULT_CLIENT_EMAIL.toLowerCase()
            );
            if (defaultClient) {
                setClientId(String(defaultClient.id));
            }
        } catch (err) {
            toast.error("Failed to load clients/categories");
        } finally {
            setLoadingOptions(false);
        }
    }

    async function handleFileChange(e) {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;

        const mdFiles = selected.filter(f => f.name.endsWith(".md"));
        const rejectedCount = selected.length - mdFiles.length;

        if (rejectedCount > 0) {
            toast.error(`${rejectedCount} file(s) skipped — only .md files are accepted`);
        }

        if (mdFiles.length === 0) return;

        // Reset the input immediately so selecting the same file again later still fires onChange
        e.target.value = "";

        const newRows = await Promise.all(mdFiles.map(async (file) => {
            let detectedCategory = null;
            try {
                const text = await file.text();
                detectedCategory = extractFrontmatterCategory(text);
            } catch (err) {
                // if we can't read the file for some reason, just leave category unset —
                // it's still selectable manually in the row
            }

            return {
                id: nextRowId(),
                file,
                masterCategoryId: findCategoryId(resolveCategoryName(detectedCategory), categories),
                scheduledAt: "",
                detectedCategory
            };
        }));

        // Append rather than replace, so users can add files in multiple batches
        setRows(prev => [...prev, ...newRows]);
        setResults(null);
    }

    function removeRow(id) {
        setRows(prev => prev.filter(r => r.id !== id));
    }

    function updateRowCategory(id, value) {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, masterCategoryId: value } : r)));
    }

    function updateRowSchedule(id, value) {
        setRows(prev => prev.map(r => (r.id === id ? { ...r, scheduledAt: value } : r)));
    }

    async function handleUpload() {
        if (rows.length === 0) {
            toast.error("Choose at least one .md file first");
            return;
        }
        if (!clientId) {
            toast.error("Select a client first");
            return;
        }

        setUploading(true);
        setResults(null);

        try {
            const formData = new FormData();

            // Files are appended in row order; fileMeta below is a parallel array
            // in the SAME order, so the backend can zip req.files[i] with fileMeta[i].
            rows.forEach(r => formData.append("files", r.file));
            formData.append("clientId", clientId);
            formData.append("language", language);

            const fileMeta = rows.map(r => ({
                master_category_id: r.masterCategoryId || null,
                scheduled_at: r.scheduledAt || null
            }));
            formData.append("fileMeta", JSON.stringify(fileMeta));

            const res = await authFetch(`${API_BASE}/api/bulk-import-md`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Upload failed");
                setUploading(false);
                return;
            }

            setResults(data);

            if (data.failedCount === 0) {
                toast.success(`All ${data.succeededCount} article(s) queued for publishing`);
            } else if (data.succeededCount === 0) {
                toast.error(`All ${data.failedCount} file(s) failed to import`);
            } else {
                toast.warning(`${data.succeededCount} queued, ${data.failedCount} failed`);
            }

            setRows([]);
        } catch (err) {
            toast.error("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Import Articles from Markdown
            </h1>
            <p style={{ color: "#666", marginBottom: 24 }}>
                Upload one or more ready-to-publish articles (.md with frontmatter). They're queued
                into your WordPress multisite pipeline for translation and publishing. Client and
                language apply to every file below; category and schedule can be set per file.
            </p>

            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                        Client
                    </label>
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        disabled={loadingOptions}
                        style={selectStyle}
                    >
                        <option value="">
                            {loadingOptions ? "Loading..." : "Select a client"}
                        </option>
                        {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                        Original Language
                    </label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={selectStyle}
                    >
                        {LANGUAGE_OPTIONS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                    Markdown files
                </label>
                <input type="file" accept=".md" multiple onChange={handleFileChange} />
            </div>

            {rows.length > 0 && (
                <div style={{ marginBottom: 16, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>File</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Scheduled At</th>
                                <th style={{ ...thStyle, width: 80 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id}>
                                    <td style={tdStyle}>
                                        <span style={{ fontSize: 13, color: "#444" }}>{r.file.name}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <select
                                            value={r.masterCategoryId}
                                            onChange={(e) => updateRowCategory(r.id, e.target.value)}
                                            disabled={loadingOptions}
                                            style={rowInputStyle}
                                        >
                                            <option value="">No category</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        {r.detectedCategory && (
                                            <span style={{ display: "block", fontSize: 11, color: "#999", marginTop: 2 }}>
                                                Detected: {r.detectedCategory}
                                                {resolveCategoryName(r.detectedCategory) !== r.detectedCategory
                                                    ? ` → ${resolveCategoryName(r.detectedCategory)}`
                                                    : ""}
                                            </span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <input
                                            type="datetime-local"
                                            value={r.scheduledAt}
                                            onChange={(e) => updateRowSchedule(r.id, e.target.value)}
                                            style={rowInputStyle}
                                        />
                                        <span style={{ display: "block", fontSize: 11, color: "#999", marginTop: 2 }}>
                                            Blank uses the file's date_published, or now
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => removeRow(r.id)}
                                            style={{
                                                border: "none",
                                                background: "none",
                                                color: "#999",
                                                cursor: "pointer",
                                                fontSize: 12
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                    padding: "10px 20px",
                    background: uploading ? "#999" : "#111",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: uploading ? "not-allowed" : "pointer",
                    fontWeight: 500
                }}
            >
                {uploading ? "Uploading..." : `Upload & Queue${rows.length ? ` (${rows.length})` : ""}`}
            </button>

            {results && (
                <div style={{ marginTop: 32 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                        {results.succeededCount} of {results.total} queued successfully
                    </h2>

                    {results.results.map((r, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 12,
                                marginBottom: 8,
                                border: `1px solid ${r.success ? "#d4edda" : "#f5c6cb"}`,
                                borderRadius: 8,
                                background: r.success ? "#f6fef8" : "#fff6f6"
                            }}
                        >
                            <p style={{ margin: "2px 0", fontSize: 13, color: "#888" }}>
                                {r.filename}
                            </p>
                            {r.success ? (
                                <>
                                    <p style={{ margin: "2px 0" }}><strong>Title:</strong> {r.title}</p>
                                    <p style={{ margin: "2px 0" }}><strong>Post ID:</strong> {r.postId}</p>
                                    <p style={{ margin: "2px 0" }}>
                                        <strong>Scheduled for:</strong> {new Date(r.scheduledAt).toLocaleString()}
                                    </p>
                                </>
                            ) : (
                                <p style={{ margin: "2px 0", color: "#c0392b" }}>
                                    <strong>Error:</strong> {r.error}{r.details ? ` — ${r.details}` : ""}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <TodayImports />
        </div>
    );
}

const selectStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: 6,
    background: "#fff"
};

const rowInputStyle = {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #ccc",
    borderRadius: 6,
    background: "#fff",
    fontSize: 13
};

const thStyle = {
    textAlign: "left",
    padding: "8px",
    borderBottom: "2px solid #eee",
    fontSize: 12,
    color: "#666",
    fontWeight: 600
};

const tdStyle = {
    padding: "8px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "top"
};