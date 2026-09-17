import { useState, useEffect } from "react";
    import { toast } from "sonner";
    import { authFetch } from "../lib/auth";
    import TodayImports from "@/components/TodayImports";

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const LANGUAGE_OPTIONS = [
        "English", "Hindi", "Tamil", "Telugu", "Marathi", "Gujarati",
        "Punjabi", "Bengali", "Kannada", "Malayalam", "Urdu"
    ];

    // Default client to preselect once the client list loads — change here if it changes.
    const DEFAULT_CLIENT_EMAIL = "cliqindiaoffice@gmail.com";
    const DEFAULT_LANGUAGE = "English";

    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
        const [tagsModalOpen, setTagsModalOpen] = useState(false);
        const [tagsModalRowId, setTagsModalRowId] = useState(null);
        const [tagsDraft, setTagsDraft] = useState([]);       // chips already added, in the modal
        const [tagsInputValue, setTagsInputValue] = useState(""); // text currently being typed

        useEffect(() => {
            loadOptions();
        }, []);

        // Revoke object URLs for image previews on unmount, so we don't leak memory.
        useEffect(() => {
            return () => {
                rows.forEach(r => {
                    if (r.imagePreviewUrl) URL.revokeObjectURL(r.imagePreviewUrl);
                });
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    slug: "",           // ← NEW
                    tags: "", 
                    detectedCategory,
                    image: null,
                    imagePreviewUrl: null
                };
            }));

            // Append rather than replace, so users can add files in multiple batches
            setRows(prev => [...prev, ...newRows]);
            setResults(null);
        }

        function removeRow(id) {
            setRows(prev => {
                const target = prev.find(r => r.id === id);
                if (target?.imagePreviewUrl) URL.revokeObjectURL(target.imagePreviewUrl);
                return prev.filter(r => r.id !== id);
            });
        }

        function updateRowCategory(id, value) {
            setRows(prev => prev.map(r => (r.id === id ? { ...r, masterCategoryId: value } : r)));
        }

        function updateRowSchedule(id, value) {
            setRows(prev => prev.map(r => (r.id === id ? { ...r, scheduledAt: value } : r)));
        }

        function updateRowSlug(id, value) {
            const normalized = value
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
            setRows(prev => prev.map(r => (r.id === id ? { ...r, slug: normalized } : r)));
        }

        function updateRowTags(id, value) {
            setRows(prev => prev.map(r => (r.id === id ? { ...r, tags: value } : r)));
        }

        function updateRowImage(id, file) {
            if (!file) return;

            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                toast.error(`${file.name} isn't a supported image type (jpeg/png/webp/gif)`);
                return;
            }
            if (file.size > MAX_IMAGE_BYTES) {
                toast.error(`${file.name} is larger than 5MB`);
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            setRows(prev => prev.map(r => {
                if (r.id !== id) return r;
                if (r.imagePreviewUrl) URL.revokeObjectURL(r.imagePreviewUrl);
                return { ...r, image: file, imagePreviewUrl: previewUrl };
            }));
        }

        function removeRowImage(id) {
            setRows(prev => prev.map(r => {
                if (r.id !== id) return r;
                if (r.imagePreviewUrl) URL.revokeObjectURL(r.imagePreviewUrl);
                return { ...r, image: null, imagePreviewUrl: null };
            }));
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

                // The backend pairs mdFiles[i] with imageFiles[i] purely by array
                // position — it doesn't know which row a file belongs to. So rows
                // WITH an image must be sent first (in their original relative order),
                // followed by rows WITHOUT one. That way the "images" array (which only
                // contains entries for image rows) lines up correctly against the front
                // of "files", and the trailing no-image rows simply run out of images
                // to pair with — exactly what we want.
                const withImage = rows.filter(r => r.image);
                const withoutImage = rows.filter(r => !r.image);
                const orderedRows = [...withImage, ...withoutImage];

                orderedRows.forEach(r => formData.append("files", r.file));
                withImage.forEach(r => formData.append("images", r.image));

                formData.append("clientId", clientId);
                formData.append("language", language);

                const fileMeta = orderedRows.map(r => ({
                    master_category_id: r.masterCategoryId || null,
                    scheduled_at: r.scheduledAt || null,
                    slug: r.slug || null,     
                    tags: r.tags || null 
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

                rows.forEach(r => {
                    if (r.imagePreviewUrl) URL.revokeObjectURL(r.imagePreviewUrl);
                });
                setRows([]);
            } catch (err) {
                toast.error("Upload failed: " + err.message);
            } finally {
                setUploading(false);
            }
        }

        function openTagsModal(row) {
            setTagsModalRowId(row.id);
            setTagsDraft(row.tags ? row.tags.split(",").map(t => t.trim()).filter(Boolean) : []);
            setTagsInputValue("");
            setTagsModalOpen(true);
        }

        function addTagsFromInput() {
            const parts = tagsInputValue.split(",").map(t => t.trim()).filter(Boolean);
            if (parts.length === 0) return;

            setTagsDraft(prev => {
                const next = [...prev];
                parts.forEach(p => {
                    if (!next.some(t => t.toLowerCase() === p.toLowerCase())) next.push(p);
                });
                return next;
            });
            setTagsInputValue("");
        }

        function removeDraftTag(tag) {
            setTagsDraft(prev => prev.filter(t => t !== tag));
        }

        function handleTagsInputKeyDown(e) {
            if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTagsFromInput();
            }
        }

        function saveTagsModal() {
            // catch any text left un-submitted in the box when Save is clicked
            const leftover = tagsInputValue.split(",").map(t => t.trim()).filter(Boolean);
            const finalTags = [...tagsDraft];
            leftover.forEach(t => {
                if (!finalTags.some(x => x.toLowerCase() === t.toLowerCase())) finalTags.push(t);
            });

            setRows(prev => prev.map(r =>
                r.id === tagsModalRowId ? { ...r, tags: finalTags.join(", ") } : r
            ));
            setTagsModalOpen(false);
        }

        function closeTagsModal() {
            setTagsModalOpen(false);
        }

        return (
            <div className="bimd-page">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

                    .bimd-page {
                        --paper: #F6F5F0;
                        --panel: #FFFFFF;
                        --ink: #1C1B17;
                        --ink-soft: #4A473F;
                        --graphite: #78756A;
                        --rule: #E2DFD3;
                        --rule-strong: #CBC7B8;
                        --press: #24486B;
                        --press-ink: #16314B;
                        --press-tint: #EAF0F5;
                        --wire-green: #2F6B4A;
                        --wire-green-bg: #EEF4EE;
                        --wire-red: #A23B2E;
                        --wire-red-bg: #FBEFEC;
                        --amber: #93641C;

                        background: var(--paper);
                        color: var(--ink);
                        font-family: 'IBM Plex Sans', system-ui, sans-serif;
                        min-height: 100%;
                        padding: 40px 24px 80px;
                    }

                    .bimd-shell { max-width: 1080px; margin: 0 auto; }

                    .bimd-masthead {
                        border-bottom: 1px solid var(--rule-strong);
                        padding-bottom: 22px;
                        margin-bottom: 32px;
                        animation: bimd-rise 420ms ease-out;
                    }
                    .bimd-kicker {
                        font-size: 13px;
                        color: var(--graphite);
                        margin: 0 0 6px;
                        letter-spacing: 0.01em;
                    }
                    .bimd-title {
                        font-family: 'Newsreader', Georgia, serif;
                        font-weight: 500;
                        font-size: 34px;
                        line-height: 1.15;
                        margin: 0 0 10px;
                        color: var(--ink);
                    }
                    .bimd-sub {
                        font-size: 14.5px;
                        line-height: 1.55;
                        color: var(--ink-soft);
                        max-width: 62ch;
                        margin: 0;
                    }

                    .bimd-section { margin-bottom: 28px; }
                    .bimd-section-label {
                        font-size: 12.5px;
                        font-weight: 600;
                        color: var(--graphite);
                        margin: 0 0 10px;
                    }

                    .bimd-settings-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }
                    @media (max-width: 640px) {
                        .bimd-settings-grid { grid-template-columns: 1fr; }
                    }

                    .bimd-field label {
                        display: block;
                        font-size: 13px;
                        font-weight: 500;
                        color: var(--ink-soft);
                        margin-bottom: 6px;
                    }

                    .bimd-select, .bimd-input {
                        width: 100%;
                        padding: 9px 11px;
                        border: 1px solid var(--rule-strong);
                        border-radius: 4px;
                        background: var(--panel);
                        color: var(--ink);
                        font-size: 13.5px;
                        font-family: inherit;
                        transition: border-color 140ms ease;
                    }
                    .bimd-select:focus-visible, .bimd-input:focus-visible {
                        outline: none;
                        border-color: var(--press);
                        box-shadow: 0 0 0 3px var(--press-tint);
                    }
                    .bimd-select:disabled { color: var(--graphite); background: var(--paper); }

                    .bimd-dropzone {
                        border: 1px dashed var(--rule-strong);
                        border-radius: 6px;
                        background: var(--panel);
                        padding: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                        flex-wrap: wrap;
                    }
                    .bimd-dropzone-text { font-size: 13.5px; color: var(--ink-soft); }
                    .bimd-dropzone-text strong { color: var(--ink); font-weight: 600; }
                    .bimd-file-label {
                        display: inline-flex;
                        align-items: center;
                        padding: 9px 16px;
                        background: var(--ink);
                        color: var(--paper);
                        border-radius: 4px;
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background 140ms ease;
                        white-space: nowrap;
                        position: relative;
                    }
                    .bimd-file-label:hover { background: var(--press-ink); }
                    .bimd-file-label input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; }
                    .bimd-file-label:has(input:focus-visible) {
                        outline: 2px solid var(--press);
                        outline-offset: 2px;
                    }

                    .bimd-queue-wrap {
                        border: 1px solid var(--rule);
                        border-radius: 6px;
                        background: var(--panel);
                        overflow-x: auto;
                    }
                    table.bimd-table {
                        width: 100%;
                        border-collapse: collapse;
                        min-width: 780px;
                    }
                    .bimd-table thead th {
                        text-align: left;
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--graphite);
                        padding: 12px 14px;
                        border-bottom: 1px solid var(--rule-strong);
                        white-space: nowrap;
                    }
                    .bimd-table th.bimd-col-num { width: 36px; }
                    .bimd-table tbody td {
                        padding: 12px 14px;
                        border-bottom: 1px solid var(--rule);
                        vertical-align: top;
                    }
                    .bimd-table tbody tr:last-child td { border-bottom: none; }
                    .bimd-row-num {
                        font-variant-numeric: tabular-nums;
                        color: var(--graphite);
                        font-size: 13px;
                    }
                    .bimd-filename { font-size: 13px; color: var(--ink); word-break: break-word; }
                    .bimd-hint {
                        display: block;
                        font-size: 11px;
                        color: var(--graphite);
                        margin-top: 4px;
                    }
                    .bimd-hint-arrow { color: var(--ink-soft); }

                    .bimd-img-cell { display: flex; align-items: center; gap: 8px; }
                    .bimd-thumb {
                        width: 46px; height: 46px;
                        object-fit: cover;
                        border-radius: 4px;
                        border: 1px solid var(--rule-strong);
                        flex-shrink: 0;
                    }
                    .bimd-image-input {
                        display: inline-flex;
                        align-items: center;
                        font-size: 12px;
                        color: var(--graphite);
                        max-width: 190px;
                        padding: 5px 8px 5px 5px;
                        border: 1px dashed var(--rule-strong);
                        border-radius: 4px;
                        background: var(--panel);
                    }
                    .bimd-image-input::file-selector-button,
                    .bimd-image-input::-webkit-file-upload-button {
                        margin-right: 8px;
                        padding: 5px 11px;
                        border: none;
                        border-radius: 4px;
                        background: var(--press-tint);
                        color: var(--press);
                        font-size: 12px;
                        font-weight: 500;
                        font-family: inherit;
                        cursor: pointer;
                        transition: background 140ms ease, color 140ms ease;
                    }
                    .bimd-image-input:hover::file-selector-button,
                    .bimd-image-input:hover::-webkit-file-upload-button {
                        background: var(--press);
                        color: #fff;
                    }
                    .bimd-image-input:focus-visible {
                        outline: none;
                        border-color: var(--press);
                        box-shadow: 0 0 0 3px var(--press-tint);
                    }

                    .bimd-tags-btn {
                    padding: 7px 12px;
                    border: 1px solid var(--rule-strong);
                    border-radius: 4px;
                    background: var(--panel);
                    color: var(--press);
                    font-size: 12.5px;
                    font-weight: 500;
                    font-family: inherit;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: background 140ms ease, border-color 140ms ease;
                      }
.bimd-tags-btn:hover { background: var(--press-tint); border-color: var(--press); }
.bimd-tags-btn:focus-visible { outline: 2px solid var(--press); outline-offset: 2px; }

.bimd-tag-chips-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
    max-width: 200px;
}
.bimd-tag-chip-mini {
    font-size: 11px;
    padding: 2px 7px;
    background: var(--press-tint);
    color: var(--press-ink);
    border-radius: 999px;
    white-space: nowrap;
}

.bimd-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(28, 27, 23, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}
.bimd-modal {
    background: var(--panel);
    border-radius: 8px;
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    animation: bimd-rise 200ms ease-out;
}
.bimd-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--rule);
}
.bimd-modal-title {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 18px;
    font-weight: 500;
    margin: 0;
    color: var(--ink);
}
.bimd-modal-close {
    border: none;
    background: none;
    font-size: 20px;
    line-height: 1;
    color: var(--graphite);
    cursor: pointer;
    padding: 4px;
}
.bimd-modal-close:hover { color: var(--wire-red); }
.bimd-modal-body { padding: 18px 20px; }
.bimd-modal-label {
    display: block;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--ink-soft);
    margin-bottom: 8px;
}
.bimd-tags-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--rule-strong);
    border-radius: 4px;
    background: var(--panel);
    color: var(--ink);
    font-size: 13.5px;
    font-family: inherit;
    resize: vertical;
}
.bimd-tags-textarea:focus-visible {
    outline: none;
    border-color: var(--press);
    box-shadow: 0 0 0 3px var(--press-tint);
}
.bimd-tag-chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
}
.bimd-tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px 6px 12px;
    background: var(--press-tint);
    color: var(--press-ink);
    border-radius: 4px;
    font-size: 13px;
}
.bimd-tag-chip-remove {
    border: none;
    background: none;
    color: var(--press);
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
    border-radius: 3px;
}
.bimd-tag-chip-remove:hover { color: #fff; background: var(--wire-red); }
.bimd-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 14px 20px;
    border-top: 1px solid var(--rule);
}

                    .bimd-link-btn {
                        border: none;
                        background: none;
                        color: var(--graphite);
                        cursor: pointer;
                        font-size: 12px;
                        font-family: inherit;
                        padding: 0;
                        text-decoration: underline;
                        text-underline-offset: 2px;
                    }
                    .bimd-link-btn:hover { color: var(--wire-red); }
                    .bimd-link-btn:focus-visible { outline: 2px solid var(--press); outline-offset: 2px; }

                    .bimd-actions {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: 40px;
                    }
                    .bimd-submit {
                        padding: 11px 22px;
                        background: var(--press);
                        color: #fff;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        font-family: inherit;
                        transition: background 140ms ease;
                    }
                    .bimd-submit:hover:not(:disabled) { background: var(--press-ink); }
                    .bimd-submit:disabled { background: var(--rule-strong); color: var(--graphite); cursor: not-allowed; }
                    .bimd-submit:focus-visible { outline: 2px solid var(--press); outline-offset: 2px; }

                    .bimd-results { animation: bimd-rise 320ms ease-out; }
                    .bimd-results-heading {
                        font-family: 'Newsreader', Georgia, serif;
                        font-size: 19px;
                        font-weight: 500;
                        margin: 0 0 14px;
                        color: var(--ink);
                    }
                    .bimd-result-card {
                        display: flex;
                        gap: 12px;
                        align-items: flex-start;
                        padding: 13px 14px;
                        margin-bottom: 8px;
                        background: var(--panel);
                        border: 1px solid var(--rule);
                        border-left: 3px solid var(--wire-green);
                        border-radius: 3px;
                    }
                    .bimd-result-card.is-error { border-left-color: var(--wire-red); }
                    .bimd-result-thumb {
                        width: 40px; height: 40px;
                        object-fit: cover;
                        border-radius: 4px;
                        border: 1px solid var(--rule-strong);
                        flex-shrink: 0;
                    }
                    .bimd-result-filename { margin: 0 0 3px; font-size: 12.5px; color: var(--graphite); }
                    .bimd-result-line { margin: 2px 0; font-size: 13.5px; color: var(--ink); }
                    .bimd-result-line strong { font-weight: 600; }
                    .bimd-result-error { margin: 2px 0; font-size: 13.5px; color: var(--wire-red); }

                    @keyframes bimd-rise {
                        from { opacity: 0; transform: translateY(6px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @media (prefers-reduced-motion: reduce) {
                        .bimd-masthead, .bimd-results { animation: none; }
                    }
                `}</style>

                <div className="bimd-shell">
                    <header className="bimd-masthead">
                        <p className="bimd-kicker">Publishing pipeline</p>
                        <h1 className="bimd-title">Import from Markdown</h1>
                        <p className="bimd-sub">
                            Upload ready-to-publish articles (.md with frontmatter). Each one is queued
                            into the WordPress multisite pipeline for translation and publishing. Client
                            and language apply to the whole batch; category, schedule, and featured image
                            are set per article.
                        </p>
                    </header>

                    <section className="bimd-section">
                        <div className="bimd-settings-grid">
                            <div className="bimd-field">
                                <label htmlFor="bimd-client">Client</label>
                                <select
                                    id="bimd-client"
                                    className="bimd-select"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    disabled={loadingOptions}
                                >
                                    <option value="">
                                        {loadingOptions ? "Loading…" : "Select a client"}
                                    </option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bimd-field">
                                <label htmlFor="bimd-language">Original language</label>
                                <select
                                    id="bimd-language"
                                    className="bimd-select"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    {LANGUAGE_OPTIONS.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bimd-section">
                        <p className="bimd-section-label">Markdown files</p>
                        <div className="bimd-dropzone">
                            <p className="bimd-dropzone-text">
                                {rows.length > 0
                                    ? <><strong>{rows.length}</strong> file{rows.length === 1 ? "" : "s"} in this batch — add more or continue below.</>
                                    : <>No files added yet. Select one or more <strong>.md</strong> files to start a batch.</>
                                }
                            </p>
                            <label className="bimd-file-label">
                                Add files
                                <input type="file" accept=".md" multiple onChange={handleFileChange} />
                            </label>
                        </div>
                    </section>

                    {rows.length > 0 && (
                        <section className="bimd-section">
                            <p className="bimd-section-label">Batch queue</p>
                            <div className="bimd-queue-wrap">
                                <table className="bimd-table">
                                    <thead>
                                        <tr>
                                            <th className="bimd-col-num">#</th>
                                            <th>File</th>
                                            <th>Category</th>
                                            <th>Slug</th>
                                            <th>Tags</th>
                                            <th>Scheduled at</th>
                                            <th>Image</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r, idx) => (
                                            <tr key={r.id}>
                                                <td className="bimd-row-num">{idx + 1}</td>
                                                <td>
                                                    <span className="bimd-filename">{r.file.name}</span>
                                                </td>
                                                <td>
                                                    <select
                                                        className="bimd-select"
                                                        value={r.masterCategoryId}
                                                        onChange={(e) => updateRowCategory(r.id, e.target.value)}
                                                        disabled={loadingOptions}
                                                    >
                                                        <option value="">No category</option>
                                                        {categories.map((c) => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {r.detectedCategory && (
                                                        <span className="bimd-hint">
                                                            Detected: {r.detectedCategory}
                                                            {resolveCategoryName(r.detectedCategory) !== r.detectedCategory
                                                                ? <span className="bimd-hint-arrow"> → {resolveCategoryName(r.detectedCategory)}</span>
                                                                : ""}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--rule-strong)", borderRadius: 4, overflow: "hidden" }}>
                                                        
                                                        <input
                                                            type="text"
                                                            className="bimd-input"
                                                            style={{ border: "none", borderRadius: 0 }}
                                                            value={r.slug}
                                                            placeholder="auto"
                                                            onChange={(e) => updateRowSlug(r.id, e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td>
                                                    <button className="bimd-tags-btn" onClick={() => openTagsModal(r)}>
                                                        {r.tags ? `Edit tags` : "Add tags"}
                                                    </button>
                                                    {r.tags && (
                                                        <div className="bimd-tag-chips-preview">
                                                            {r.tags.split(",").map(t => t.trim()).filter(Boolean).map((t, i) => (
                                                                <span key={i} className="bimd-tag-chip-mini">{t}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <input
                                                        type="datetime-local"
                                                        className="bimd-input"
                                                        value={r.scheduledAt}
                                                        onChange={(e) => updateRowSchedule(r.id, e.target.value)}
                                                    />
                                                    <span className="bimd-hint">Blank uses the file's date_published, or now</span>
                                                </td>
                                                <td>
                                                    {r.imagePreviewUrl ? (
                                                        <div className="bimd-img-cell">
                                                            <img className="bimd-thumb" src={r.imagePreviewUrl} alt="" />
                                                            <button className="bimd-link-btn" onClick={() => removeRowImage(r.id)}>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="file"
                                                            className="bimd-image-input"
                                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                                            aria-label={`Featured image for ${r.file.name}`}
                                                            onChange={(e) => updateRowImage(r.id, e.target.files?.[0])}
                                                        />
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="bimd-link-btn" onClick={() => removeRow(r.id)}>
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    <div className="bimd-actions">
                        <button
                            className="bimd-submit"
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? "Uploading…" : `Upload & queue${rows.length ? ` (${rows.length})` : ""}`}
                        </button>
                    </div>

                    {results && (
                        <section className="bimd-results">
                            <h2 className="bimd-results-heading">
                                {results.succeededCount} of {results.total} queued successfully
                            </h2>

                            {results.results.map((r, i) => (
                                <div key={i} className={`bimd-result-card${r.success ? "" : " is-error"}`}>
                                    {r.success && r.featured_image_url && (
                                        <img className="bimd-result-thumb" src={r.featured_image_url} alt="" />
                                    )}
                                    <div>
                                        <p className="bimd-result-filename">{r.filename}</p>
                                        {r.success ? (
                                            <>
                                                <p className="bimd-result-line"><strong>Title:</strong> {r.title}</p>
                                                <p className="bimd-result-line"><strong>Post ID:</strong> {r.postId}</p>
                                                <p className="bimd-result-line">
                                                    <strong>Scheduled for:</strong> {new Date(r.scheduledAt).toLocaleString()}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="bimd-result-error">
                                                <strong>Error:</strong> {r.error}{r.details ? ` — ${r.details}` : ""}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {tagsModalOpen && (
                        <div className="bimd-modal-overlay" onClick={closeTagsModal}>
                            <div className="bimd-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="bimd-modal-header">
                                    <h3 className="bimd-modal-title">Add tags</h3>
                                    <button className="bimd-modal-close" onClick={closeTagsModal} aria-label="Close">×</button>
                                </div>

                                <div className="bimd-modal-body">
                                    <label htmlFor="bimd-tags-input" className="bimd-modal-label">
                                        Type a tag, then press Enter or comma to add it
                                    </label>
                                    <textarea
                                        id="bimd-tags-input"
                                        className="bimd-tags-textarea"
                                        rows={3}
                                        autoFocus
                                        value={tagsInputValue}
                                        onChange={(e) => setTagsInputValue(e.target.value)}
                                        onKeyDown={handleTagsInputKeyDown}
                                        placeholder="e.g. politics, india, election"
                                    />

                                    {tagsDraft.length > 0 && (
                                        <div className="bimd-tag-chip-list">
                                            {tagsDraft.map((tag, i) => (
                                                <span key={i} className="bimd-tag-chip">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        className="bimd-tag-chip-remove"
                                                        onClick={() => removeDraftTag(tag)}
                                                        aria-label={`Remove tag ${tag}`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bimd-modal-footer">
                                    <button className="bimd-link-btn" onClick={closeTagsModal}>Cancel</button>
                                    <button className="bimd-submit" onClick={saveTagsModal}>
                                        Save{tagsDraft.length > 0 ? ` (${tagsDraft.length})` : ""}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}



                    <TodayImports />
                </div>
            </div>
        );
    }