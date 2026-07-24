import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authFetch } from "../lib/auth"; // adjust path to wherever auth.js lives in your project

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function BulkImport() {
    const [file, setFile] = useState(null);
    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState("");
    const [loadingClients, setLoadingClients] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [batchResult, setBatchResult] = useState(null);
    const [batchItems, setBatchItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);``

    useEffect(() => {
        fetchClients();
    }, []);

    async function fetchClients() {
        setLoadingClients(true);
        try {
            const res = await authFetch(`${API_BASE}/api/clients`);
            const data = await res.json();
            setClients(data);
        } catch (err) {
            toast.error("Failed to load clients");
        } finally {
            setLoadingClients(false);
        }
    }

    function handleFileChange(e) {
        const selected = e.target.files[0];
        if (!selected) return;

        if (!selected.name.endsWith(".json")) {
            toast.error("Please select a .json file");
            return;
        }

        setFile(selected);
        setBatchResult(null);
        setBatchItems([]);
    }

    async function handleUpload() {
        if (!file) {
            toast.error("Choose a JSON file first");
            return;
        }
        if (!clientId) {
            toast.error("Select a client first");
            return;
        }

        setUploading(true);
        setBatchResult(null);
        setBatchItems([]);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("client_id", clientId);

            const res = await authFetch(`${API_BASE}/api/bulk-import`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Upload failed");
                setUploading(false);
                return;
            }

            setBatchResult(data);

            if (data.failedCount > 0) {
                toast.warning(`${data.successCount} succeeded, ${data.failedCount} failed`);
            } else {
                toast.success(`All ${data.successCount} articles queued successfully`);
            }

            await fetchBatchDetails(data.batchId);
        } catch (err) {
            toast.error("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    }

    async function fetchBatchDetails(batchId) {
        setLoadingItems(true);
        try {
            const res = await authFetch(`${API_BASE}/api/bulk-import/${batchId}`);
            const data = await res.json();
            setBatchItems(data.items || []);
        } catch (err) {
            toast.error("Failed to load batch details");
        } finally {
            setLoadingItems(false);
        }
    }

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
                Bulk Import Articles
            </h1>
            <p style={{ color: "#666", marginBottom: 24 }}>
                Upload a JSON file of ready-to-publish articles. Each one is queued into your
                WordPress multisite pipeline for translation and publishing.
            </p>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                    Client
                </label>
                <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    disabled={loadingClients}
                    style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        background: "#fff"
                    }}
                >
                    <option value="">
                        {loadingClients ? "Loading clients..." : "Select a client"}
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
                    Articles JSON file
                </label>
                <input type="file" accept=".json" onChange={handleFileChange} />
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

            {batchResult && (
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
                        Batch #{batchResult.batchId} Summary
                    </h2>
                    <p style={{ margin: 0 }}>
                        Total: {batchResult.total} &nbsp;|&nbsp;
                        <span style={{ color: "green" }}> Success: {batchResult.successCount}</span>
                        &nbsp;|&nbsp;
                        <span style={{ color: "crimson" }}> Failed: {batchResult.failedCount}</span>
                    </p>
                </div>
            )}

            {loadingItems && <p style={{ marginTop: 16 }}>Loading item details...</p>}

            {batchItems.length > 0 && (
                <table
                    style={{
                        width: "100%",
                        marginTop: 20,
                        borderCollapse: "collapse",
                        fontSize: 14
                    }}
                >
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
                            <th style={{ padding: "8px 6px" }}>Title</th>
                            <th style={{ padding: "8px 6px" }}>Status</th>
                            <th style={{ padding: "8px 6px" }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batchItems.map((item) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "8px 6px" }}>{item.title}</td>
                                <td style={{ padding: "8px 6px" }}>
                                    <span
                                        style={{
                                            padding: "2px 8px",
                                            borderRadius: 4,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            background: item.status === "success" ? "#e6f7ee" : "#fdecec",
                                            color: item.status === "success" ? "#0a7d3f" : "#c0392b"
                                        }}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                                <td style={{ padding: "8px 6px", color: "#666" }}>
                                    {item.error_message || (item.post_id ? `wp_posts #${item.post_id}` : "—")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}