import { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    Chip, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Tooltip, Button,
    Checkbox
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TranslateIcon from "@mui/icons-material/Translate";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import { authFetch } from '../lib/auth';


const API_URL = "https://prod.panditjee.com/api/wp-posts";
// const API_URL = "http://localhost:5000/api/wp-posts";

export default function WPPostsTest() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [translations, setTranslations] = useState([]);
    const [translationsLoading, setTranslationsLoading] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewTranslation, setPreviewTranslation] = useState(null);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [editSlug, setEditSlug] = useState("");
    const [editTags, setEditTags] = useState("");
    const [applyingAll, setApplyingAll] = useState(false);
    const [applyAllResult, setApplyAllResult] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // ── Bulk delete (per post row) state ──
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkDeletePost, setBulkDeletePost] = useState(null);
    const [bulkTranslations, setBulkTranslations] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [bulkDeleteResults, setBulkDeleteResults] = useState({}); // { [id]: 'pending' | 'success' | 'error' }

    useEffect(() => {
        authFetch(API_URL)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                setPosts([...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    async function openTranslations(post) {
        setSelectedPost(post);
        setTranslations([]);
        setModalOpen(true);
        setTranslationsLoading(true);
        try {
            const res = await authFetch(`https://prod.panditjee.com/api/wp-posts/${post.id}/translations`);
            const data = await res.json();
            setTranslations(data);
        } catch {
            setTranslations([]);
        } finally {
            setTranslationsLoading(false);
        }
    }


    async function applyTagsAndSlugToAll() {
    if (!editTags && !editSlug) {
        setSaveError("Enter tags or slug to apply to all translations.");
        return;
    }

    setApplyingAll(true);
    setApplyAllResult(null);

    try {
        const res = await authFetch(
            `https://prod.panditjee.com/api/wp-posts/translations/apply-all/${selectedPost.id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tags: editTags, slug: editSlug }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            setSaveError(data.error || "Failed to apply to all.");
            return;
        }

        setApplyAllResult(data.results);

    } catch (err) {
        setSaveError("Network error. Please try again.");
    } finally {
        setApplyingAll(false);
    }
}

    function openPreview(translation) {
        setPreviewTranslation(translation);
        setIsEditing(false);
        setSaveError(null);
        setSaveSuccess(false);
        setPreviewOpen(true);
    }

    function startEditing() {
    setEditTitle(previewTranslation.title || "");
    setEditContent(previewTranslation.content || "");
    setEditSlug(previewTranslation.slug || "");
    setEditTags(previewTranslation.tags || "");
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
}

    function cancelEditing() {
        setIsEditing(false);
        setSaveError(null);
    }

    async function saveEdits() {
        if (!editTitle.trim() || !editContent.trim()) {
            setSaveError("Title and content cannot be empty.");
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            const res = await authFetch(
                `https://prod.panditjee.com/api/wp-posts/translations/${previewTranslation.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: editTitle,
                        content: editContent,
                        slug: editSlug,
                        tags: editTags,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setSaveError(data.error || "Failed to save.");
                return;
            }

            // Update local state
            const updated = {
                ...previewTranslation,
                title: editTitle,
                content: editContent,
                slug: editSlug,
                tags: editTags,
            };
            setPreviewTranslation(updated);
            setTranslations(prev =>
                prev.map(t => t.id === previewTranslation.id ? updated : t)
            );

            setIsEditing(false);
            setSaveSuccess(true);

            // Clear success message after 3s
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (err) {
            setSaveError("Network error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    // Deletes the wp-posts row itself (called once every translation of that post is gone).
    async function deletePostEntry(postId) {
        try {
            const res = await authFetch(`${API_URL}/delete/${postId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error("Failed to delete post entry:", data.error);
                return;
            }
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            console.error("Network error deleting post entry:", err);
        }
    }

    async function deleteTranslation(translationId, language) {
    if (!window.confirm(`Delete the ${language} translation from WordPress? This cannot be undone.`)) return;

    setDeletingId(translationId);
    try {
        const res = await authFetch(
            `https://prod.panditjee.com/api/wp-posts/translations/${translationId}`,
            { method: "DELETE" }
        );

        const data = await res.json();

        if (!res.ok) {
            alert(`Failed: ${data.error}`);
            return;
        }

        // Remove from local state; if that was the last translation for this post,
        // delete the wp-posts entry too and close the translations modal.
        setTranslations(prev => {
            const updated = prev.filter(t => t.id !== translationId);
            if (updated.length === 0 && selectedPost) {
                deletePostEntry(selectedPost.id);
                setModalOpen(false);
            }
            return updated;
        });

        // Close preview if it was open for this translation
        if (previewTranslation?.id === translationId) {
            setPreviewOpen(false);
        }

    } catch (err) {
        alert("Network error. Please try again.");
    } finally {
        setDeletingId(null);
    }
}

    // ── Bulk delete modal (opened from the main posts row) ──
    async function openBulkDelete(post) {
        setBulkDeletePost(post);
        setBulkTranslations([]);
        setSelectedIds([]);
        setBulkDeleteResults({});
        setBulkDeleteOpen(true);
        setBulkLoading(true);
        try {
            const res = await authFetch(`https://prod.panditjee.com/api/wp-posts/${post.id}/translations`);
            const data = await res.json();
            setBulkTranslations(data);
        } catch {
            setBulkTranslations([]);
        } finally {
            setBulkLoading(false);
        }
    }

    function toggleSelectId(id) {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    }

    function toggleSelectAll() {
        if (selectedIds.length === bulkTranslations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(bulkTranslations.map(t => t.id));
        }
    }

    async function deleteSelectedTranslations() {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} selected translation(s) from WordPress? This cannot be undone.`)) return;

        setBulkDeleting(true);

        // Mark all selected as pending
        setBulkDeleteResults(prev => {
            const next = { ...prev };
            selectedIds.forEach(id => { next[id] = "pending"; });
            return next;
        });

        // Delete each selected translation, updating status as each completes
        const idsToDelete = [...selectedIds];
        const successIds = [];

        await Promise.all(idsToDelete.map(async (id) => {
            try {
                const res = await authFetch(
                    `https://prod.panditjee.com/api/wp-posts/translations/${id}`,
                    { method: "DELETE" }
                );
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setBulkDeleteResults(prev => ({ ...prev, [id]: data.error || "error" }));
                    return;
                }

                successIds.push(id);
                setBulkDeleteResults(prev => ({ ...prev, [id]: "success" }));
                setBulkTranslations(prev => prev.filter(t => t.id !== id));
                setTranslations(prev => prev.filter(t => t.id !== id));
                setSelectedIds(prev => prev.filter(x => x !== id));
            } catch {
                setBulkDeleteResults(prev => ({ ...prev, [id]: "Network error" }));
            }
        }));

        setBulkDeleting(false);

        // If every translation for this post is now gone, remove the post entry too.
        const remaining = bulkTranslations.filter(t => !successIds.includes(t.id));
        if (remaining.length === 0 && bulkDeletePost) {
            deletePostEntry(bulkDeletePost.id);
            setBulkDeleteOpen(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-600 text-center mt-10">{error}</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-semibold">WordPress Posts</h2>
                <p className="text-sm text-gray-500">All scheduled & published WordPress posts</p>
            </div>

            {/* ===== Main Posts Table ===== */}
            <div className="overflow-auto rounded-lg border">
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Title</b></TableCell>
                            <TableCell><b>Client ID</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Category</b></TableCell>
                            <TableCell><b>Scheduled At</b></TableCell>
                            <TableCell><b>Created At</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.map(post => (
                            <TableRow key={post.id} hover>
                                <TableCell sx={{ maxWidth: 280 }}>
                                    <span className="block truncate">{post.title}</span>
                                </TableCell>
                                <TableCell>{post.client_id}</TableCell>
                                <TableCell><StatusBadge status={post.status} /></TableCell>
                                <TableCell>{post.master_category_name || "-"}</TableCell>
                                <TableCell>{formatDate(post.scheduled_at)}</TableCell>
                                <TableCell>{formatDate(post.created_at)}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2 items-center">
                                        <Tooltip title="View all translated posts">
                                            <button
                                                onClick={() => openTranslations(post)}
                                                className="flex items-center gap-1 text-purple-600 text-sm hover:underline"
                                            >
                                                <TranslateIcon fontSize="small" />
                                                Translations
                                            </button>
                                        </Tooltip>
                                        <Tooltip title="Delete translated articles">
                                            <button
                                                onClick={() => openBulkDelete(post)}
                                                className="flex items-center gap-1 text-red-600 text-sm hover:underline"
                                            >
                                                <DeleteIcon fontSize="small" />
                                                Delete
                                            </button>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* ===== Translations Modal ===== */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <TranslateIcon className="text-purple-600" />
                                <span className="font-semibold">Translated Posts</span>
                                {translations.length > 0 && (
                                    <Chip
                                        label={`${translations.length} language${translations.length > 1 ? "s" : ""}`}
                                        size="small"
                                        color="secondary"
                                    />
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 font-normal">
                                {selectedPost?.title}
                            </p>
                        </div>
                        <IconButton onClick={() => setModalOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent dividers>
                    {translationsLoading ? (
                        <div className="flex justify-center py-10">
                            <CircularProgress />
                        </div>
                    ) : translations.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <TranslateIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                            <p>No translations found for this post.</p>
                        </div>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                                    <TableCell><b>Language</b></TableCell>
                                    <TableCell><b>Title</b></TableCell>
                                    <TableCell><b>Site URL</b></TableCell>
                                    <TableCell><b>Status</b></TableCell>
                                    <TableCell><b>WP Link</b></TableCell>
                                    <TableCell><b>Preview / Edit</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {translations.map(t => (
                                    <TableRow key={t.id} hover>
                                        <TableCell>
                                            <Chip label={t.language} size="small" variant="outlined" color="primary" />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 220 }}>
                                            <span className="block truncate text-sm">{t.title || "-"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-gray-500">
                                                {t.site_url}{t.site_path || ""}
                                            </span>
                                        </TableCell>
                                        <TableCell><StatusBadge status={t.status} /></TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {t.wp_url ? (
                                                    <a href={t.wp_url} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-1 text-blue-600 text-sm hover:underline">
                                                        View <OpenInNewIcon sx={{ fontSize: 14 }} />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                                {t.external_post_id && t.site_url && (
                                                    
                                                       <a href={`${t.site_url}${t.site_path || ""}/wp-admin/post.php?post=${t.external_post_id}&action=edit`}
                                                        target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-1 text-orange-500 text-sm hover:underline"
                                                    >
                                                        Edit in WP <OpenInNewIcon sx={{ fontSize: 14 }} />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <button
                                                    onClick={() => openPreview(t)}
                                                    className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                                                >
                                                    <EditIcon fontSize="small" />
                                                    Preview / Edit
                                                </button>

                                                {/* ← ADD DELETE BUTTON */}
                                                <button
                                                    onClick={() => deleteTranslation(t.id, t.language)}
                                                    disabled={deletingId === t.id}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                        fontSize: 12, fontWeight: 600,
                                                        color: deletingId === t.id ? '#9B9590' : '#DC2626',
                                                        background: 'none', border: 'none',
                                                        cursor: deletingId === t.id ? 'not-allowed' : 'pointer',
                                                        padding: 0,
                                                    }}
                                                >
                                                    {deletingId === t.id ? '⟳ Deleting...' : '🗑 Delete'}
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>

            {/* ===== Bulk Delete (checkbox) Modal — opened from post row ===== */}
            <Dialog open={bulkDeleteOpen} onClose={() => { if (!bulkDeleting) setBulkDeleteOpen(false); }} maxWidth="md" fullWidth>
                <DialogTitle>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <DeleteIcon className="text-red-600" />
                                <span className="font-semibold">Delete Translated Articles</span>
                                {bulkTranslations.length > 0 && (
                                    <Chip
                                        label={`${bulkTranslations.length} language${bulkTranslations.length > 1 ? "s" : ""}`}
                                        size="small"
                                    />
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 font-normal">
                                {bulkDeletePost?.title}
                            </p>
                        </div>
                        <IconButton onClick={() => setBulkDeleteOpen(false)} size="small" disabled={bulkDeleting}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent dividers>
                    {bulkLoading ? (
                        <div className="flex justify-center py-10">
                            <CircularProgress />
                        </div>
                    ) : bulkTranslations.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <TranslateIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                            <p>No translations found for this post.</p>
                        </div>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={bulkTranslations.length > 0 && selectedIds.length === bulkTranslations.length}
                                            indeterminate={selectedIds.length > 0 && selectedIds.length < bulkTranslations.length}
                                            onChange={toggleSelectAll}
                                            disabled={bulkDeleting}
                                        />
                                    </TableCell>
                                    <TableCell><b>Language</b></TableCell>
                                    <TableCell><b>Title</b></TableCell>
                                    <TableCell><b>Site URL</b></TableCell>
                                    <TableCell><b>Status</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bulkTranslations.map(t => {
                                    const result = bulkDeleteResults[t.id];
                                    return (
                                        <TableRow key={t.id} hover selected={selectedIds.includes(t.id)}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedIds.includes(t.id)}
                                                    onChange={() => toggleSelectId(t.id)}
                                                    disabled={bulkDeleting}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={t.language} size="small" variant="outlined" color="primary" />
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 220 }}>
                                                <span className="block truncate text-sm">{t.title || "-"}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-gray-500">
                                                    {t.site_url}{t.site_path || ""}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {result === "pending" ? (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <CircularProgress size={12} /> Deleting...
                                                    </span>
                                                ) : result === "success" ? (
                                                    <span className="text-xs text-green-600">✅ Deleted</span>
                                                ) : result ? (
                                                    <span className="text-xs text-red-600">❌ {result}</span>
                                                ) : (
                                                    <StatusBadge status={t.status} />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <span className="text-sm text-gray-500 mr-auto">
                        {selectedIds.length} selected
                    </span>
                    <Button onClick={() => setBulkDeleteOpen(false)} color="inherit" disabled={bulkDeleting}>
                        Close
                    </Button>
                    <Button
                        onClick={deleteSelectedTranslations}
                        variant="contained"
                        color="error"
                        startIcon={bulkDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                        disabled={bulkDeleting || selectedIds.length === 0}
                    >
                        {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ===== Content Preview + Edit Modal ===== */}
            <Dialog open={previewOpen} onClose={() => { setPreviewOpen(false); setIsEditing(false); }} maxWidth="md" fullWidth>
                <DialogTitle>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <Chip
                                    label={previewTranslation?.language}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                                <span className="font-semibold text-base">
                                    {isEditing ? "Edit Translation" : "Content Preview"}
                                </span>
                            </div>
                            {!isEditing && (
                                <p className="text-sm text-gray-500 mt-1 font-normal truncate max-w-lg">
                                    {previewTranslation?.title}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {!isEditing && previewTranslation?.wp_url && (
                                
                                 <a   href={previewTranslation.wp_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
                                >
                                    Open in WordPress <OpenInNewIcon sx={{ fontSize: 14 }} />
                                </a>
                            )}
                            {!isEditing && (
                                <Tooltip title="Edit this translation">
                                    <IconButton onClick={startEditing} size="small" color="primary">
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <IconButton onClick={() => { setPreviewOpen(false); setIsEditing(false); }} size="small">
                                <CloseIcon />
                            </IconButton>
                        </div>
                    </div>
                </DialogTitle>

                <DialogContent dividers>
                    {previewTranslation && (
                        <div className="space-y-4">

                            {/* Success banner */}
                            {saveSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 rounded px-4 py-2 text-sm">
                                    ✅ Translation updated and republished to WordPress successfully.
                                </div>
                            )}

                            {/* Error banner */}
                            {saveError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-2 text-sm">
                                    ❌ {saveError}
                                </div>
                            )}

                            {/* Site info */}
                            {!isEditing && (
                                <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 flex gap-4 flex-wrap">
                                    <span>
                                        🌐 <b>Site:</b> {previewTranslation.site_url}{previewTranslation.site_path || ""}
                                    </span>
                                    <span>
                                        📅 <b>Published:</b> {formatDate(previewTranslation.created_at)}
                                    </span>
                                </div>
                            )}

                            {!isEditing && (previewTranslation.slug || previewTranslation.tags) && (
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 rounded p-3">
                                    {previewTranslation.slug && (
                                        <span>
                                            🔗 <b>Slug:</b> /{previewTranslation.slug}
                                        </span>
                                    )}
                                    {previewTranslation.tags && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span>🏷️ <b>Tags:</b></span>
                                            {previewTranslation.tags.split(",")
                                                .map(t => t.trim())
                                                .filter(Boolean)
                                                .map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── EDIT MODE ── */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                                            Content
                                        </label>
                                        <textarea
                                            value={editContent}
                                            onChange={e => setEditContent(e.target.value)}
                                            rows={14}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            HTML is supported. Changes will be republished to WordPress immediately.
                                        </p>
                                    </div>
                                    {/* Slug */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                                            Slug <span className="text-gray-400 font-normal normal-case">(optional)</span>
                                        </label>
                                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                                            <span className="bg-gray-50 px-3 py-2 text-xs text-gray-400 border-r border-gray-300 whitespace-nowrap">
                                                /article/
                                            </span>
                                            <input
                                                type="text"
                                                value={editSlug}
                                                onChange={e =>
                                                    setEditSlug(
                                                        e.target.value
                                                            .toLowerCase()
                                                            .replace(/\s+/g, "-")
                                                            .replace(/[^a-z0-9-]/g, "")
                                                    )
                                                }
                                                placeholder="my-post-slug"
                                                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Lowercase letters, numbers and hyphens only.
                                        </p>
                                    </div>

                                    {/* Tags */}
                                  
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                                            Tags <span className="text-gray-400 font-normal normal-case">(optional — comma separated)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editTags}
                                            onChange={e => setEditTags(e.target.value)}
                                            placeholder="politics, india, news, election"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Tags will be created on WordPress automatically if they don't exist.
                                        </p>
                                        {editTags && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {editTags.split(",").map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Apply to all button */}
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Apply tags & slug to all translations
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    This will update and republish all language versions immediately.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={applyTagsAndSlugToAll}
                                                variant="outlined"
                                                color="secondary"
                                                size="small"
                                                disabled={applyingAll || (!editTags && !editSlug)}
                                                startIcon={applyingAll ? <CircularProgress size={14} /> : <TranslateIcon />}
                                            >
                                                {applyingAll ? "Applying..." : "Apply to All"}
                                            </Button>
                                        </div>

                                        {/* Per-language results */}
                                        {applyAllResult && (
                                            <div className="mt-3 space-y-1">
                                                {applyAllResult.map((r, i) => (
                                                    <div key={i} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded ${r.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                                        }`}>
                                                        <span>{r.success ? "✅" : "❌"}</span>
                                                        <span className="font-medium">{r.language}</span>
                                                        <span>{r.success ? "Updated & republished" : r.error}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* ── PREVIEW MODE ── */
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Content</p>
                                    <div
                                        className="prose max-w-none text-sm border rounded p-4 bg-white max-h-[400px] overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: previewTranslation.content || "<p>No content</p>" }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>

                {/* ── Dialog Actions ── */}
                <DialogActions sx={{ px: 3, py: 2 }}>
                    {isEditing ? (
                        <>
                            <Button onClick={cancelEditing} startIcon={<CancelIcon />} color="inherit" disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                onClick={saveEdits}
                                startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                                variant="contained" disabled={isSaving}
                            >
                                {isSaving ? "Saving & Publishing..." : "Save & Republish"}
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* ← ADD DELETE BUTTON IN PREVIEW MODE */}
                            <Button
                                onClick={() => deleteTranslation(previewTranslation.id, previewTranslation.language)}
                                disabled={deletingId === previewTranslation?.id}
                                color="error"
                                startIcon={deletingId === previewTranslation?.id ? <CircularProgress size={14} /> : null}
                                sx={{ mr: 'auto' }} // pushes it to the left
                            >
                                {deletingId === previewTranslation?.id ? 'Deleting...' : '🗑 Delete from WordPress'}
                            </Button>

                            <Button onClick={startEditing} startIcon={<EditIcon />} variant="outlined">
                                Edit Translation
                            </Button>
                            <Button onClick={() => { setPreviewOpen(false); setIsEditing(false); }} color="inherit">
                                Close
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    )
}

function StatusBadge({ status }) {
    const colorMap = {
        published: "success",
        processing: "warning",
        failed: "error",
        scheduled: "info"
    };
    return (
        <Chip
            label={status}
            color={colorMap[status] || "default"}
            size="small"
            variant="outlined"
        />
    );
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
}