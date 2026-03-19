import { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    Chip, CircularProgress, Dialog, DialogTitle,
    DialogContent, IconButton, Tooltip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TranslateIcon from "@mui/icons-material/Translate";

const API_URL = "https://prod.panditjee.com/api/wp-posts";

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

    useEffect(() => {
        fetch(API_URL)
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
            const res = await fetch(`https://prod.panditjee.com/api/wp-posts/${post.id}/translations`);
            const data = await res.json();
            setTranslations(data);
        } catch {
            setTranslations([]);
        } finally {
            setTranslationsLoading(false);
        }
    }

    function openPreview(translation) {
        setPreviewTranslation(translation);
        setPreviewOpen(true);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-center mt-10">{error}</div>
        );
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
                                <TableCell>
                                    <StatusBadge status={post.status} />
                                </TableCell>
                                
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
                                        <button className="text-red-600 text-sm hover:underline">
                                            Delete
                                        </button>
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
                                    <TableCell><b>Preview</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {translations.map(t => (
                                    <TableRow key={t.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={t.language}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 220 }}>
                                            <span className="block truncate text-sm">
                                                {t.title || "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-gray-500">
                                                {t.site_url}{t.site_path || ""}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={t.status} />
                                        </TableCell>
                                        <TableCell>
                                            {t.wp_url ? (
                                                
                                                 <a   href={t.wp_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
                                                >
                                                    View <OpenInNewIcon sx={{ fontSize: 14 }} />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => openPreview(t)}
                                                className="text-sm text-indigo-600 hover:underline"
                                            >
                                                Preview
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>
            </Dialog>

            {/* ===== Content Preview Modal ===== */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
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
                                <span className="font-semibold text-base">Content Preview</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 font-normal truncate max-w-lg">
                                {previewTranslation?.title}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {previewTranslation?.wp_url && (
                                
                                  <a  href={previewTranslation.wp_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-blue-600 text-sm hover:underline"
                                >
                                    Open in WordPress <OpenInNewIcon sx={{ fontSize: 14 }} />
                                </a>
                            )}
                            <IconButton onClick={() => setPreviewOpen(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </div>
                    </div>
                </DialogTitle>

                <DialogContent dividers>
                    {previewTranslation && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 flex gap-4 flex-wrap">
                                <span>
                                    🌐 <b>Site:</b> {previewTranslation.site_url}{previewTranslation.site_path || ""}
                                </span>
                                <span>
                                    📅 <b>Published:</b> {formatDate(previewTranslation.created_at)}
                                </span>
                            </div>

                            {previewTranslation.excerpt && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Excerpt</p>
                                    <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded p-3">
                                        {previewTranslation.excerpt}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Content</p>
                                <div
                                    className="prose max-w-none text-sm border rounded p-4 bg-white max-h-[400px] overflow-y-auto"
                                    dangerouslySetInnerHTML={{ __html: previewTranslation.content || "<p>No content</p>" }}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
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