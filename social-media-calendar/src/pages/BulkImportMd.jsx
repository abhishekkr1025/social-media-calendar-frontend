import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authFetch } from "../lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const LANGUAGE_OPTIONS = [
    "English", "Hindi", "Tamil", "Telugu", "Marathi", "Gujarati",
    "Punjabi", "Bengali", "Kannada", "Malayalam", "Urdu"
];

export default function BulkImportMd() {
    const [file, setFile] = useState(null);
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState("");
    const [categories, setCategories] = useState([]);
    const [masterCategoryId, setMasterCategoryId] = useState("");
    const [language, setLanguage] = useState("English");
    const [scheduledAt, setScheduledAt] = useState("");
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        loadOptions();
    }, []);

    async function loadOptions() {
        setLoadingOptions(true);
        try {
            const [clientsRes, categoriesRes] = await Promise.all([
                authFetch(`${API_BASE}/api/clients`),
                authFetch(`${API_BASE}/api/master-categories`)
            ]);
            setClients(await clientsRes.json());
            setCategories(await categoriesRes.json());
        } catch (err) {
            toast.error("Failed to load clients/categories");
        } finally {
            setLoadingOptions(false);
        }
    }

    function handleFileChange(e) {
        const selected = e.target.files[0];
        if (!selected) return;

        if (!selected.name.endsWith(".md")) {
            toast.error("Please select a .md file");
            return;
        }

        setFile(selected);
        setResult(null);
    }

    async function handleUpload() {
        if (!file) {
            toast.error("Choose a .md file first");
            return;
        }
        if (!clientId) {
            toast.error("Select a client first");
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("clientId", clientId);
            formData.append("language", language);
            if (masterCategoryId) formData.append("master_category_id", masterCategoryId);
            if (scheduledAt) formData.append("scheduled_at", scheduledAt);

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

            setResult(data);
            toast.success(`"${data.title}" queued for publishing`);
        } catch (err) {
            toast.error("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Import Article from Markdown
            </h1>
            <p style={{ color: "#666", marginBottom: 24 }}>
                Upload a single ready-to-publish article (.md with frontmatter). It's queued
                into your WordPress multisite pipeline for translation and publishing.
            </p>

            <div style={{ marginBottom: 16 }}>
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

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                    Category
                </label>
                <select
                    value={masterCategoryId}
                    onChange={(e) => setMasterCategoryId(e.target.value)}
                    disabled={loadingOptions}
                    style={selectStyle}
                >
                    <option value="">No category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: 16 }}>
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

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                    Scheduled At (optional — leave blank to use the file's own date, or now)
                </label>
                <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    style={selectStyle}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                    Markdown file
                </label>
                <input type="file" accept=".md" onChange={handleFileChange} />
                {file && (
                    <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                        Selected: {file.name}
                    </p>
                )}
            </div>

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
                {uploading ? "Uploading..." : "Upload & Queue"}
            </button>

            {result && (
                <div
                    style={{
                        marginTop: 32,
                        padding: 16,
                        border: "1px solid #eee",
                        borderRadius: 8,
                        background: "#fafafa"
                    }}
                >
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                        Queued Successfully
                    </h2>
                    <p style={{ margin: "4px 0" }}><strong>Title:</strong> {result.title}</p>
                    <p style={{ margin: "4px 0" }}><strong>Post ID:</strong> {result.postId}</p>
                    <p style={{ margin: "4px 0" }}>
                        <strong>Scheduled for:</strong> {new Date(result.scheduledAt).toLocaleString()}
                    </p>
                </div>
            )}
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