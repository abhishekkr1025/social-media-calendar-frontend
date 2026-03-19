import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
} from "@mui/material";

const API_URL = "https://prod.panditjee.com/api/wp-posts";
// const API_URL = "http://localhost:5000/api/wp-posts"

export default function WPPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPost, setEditingPost] = useState(null);



    useEffect(() => {
        fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch posts");
                return res.json();
            })
            .then((data) => {
                const sortedPosts = [...data].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );

                setPosts(sortedPosts);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-center mt-10">
                {error}
            </div>
        );
    }

    async function handleDelete(post) {
        const confirmDelete = window.confirm(
            `Delete "${post.title}"?\nThis will also delete it from WordPress.`
        );

        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `https://prod.panditjee.com/api/wp-posts/delete/${post.id}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error("Delete failed");

            // remove from UI
            setPosts(prev => prev.filter(p => p.id !== post.id));

        } catch (err) {
            alert("Failed to delete post");
        }
    }

    function openEditModal(post) {
        setEditingPost(post);
    }

    async function updatePost(updatedPost) {
        try {
            const res = await fetch(
                `https://prod.panditjee.com/api/wp-posts//wp-posts/${updatedPost.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedPost),
                }
            );

            if (!res.ok) throw new Error("Update failed");

            const saved = await res.json();

            setPosts(prev =>
                prev.map(p => (p.id === saved.id ? saved : p))
            );

            setEditingPost(null);
        } catch (err) {
            alert("Failed to update post");
        }
    }



    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-semibold">WordPress Posts</h2>
                <p className="text-sm text-gray-500">
                    All scheduled & published WordPress posts
                </p>
            </div>

            {/* Table */}
            <div className="overflow-auto rounded-lg border">
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Title</b></TableCell>
                            <TableCell><b>Client ID</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Language</b></TableCell>
                            <TableCell><b>Category</b></TableCell>
                            <TableCell><b>Scheduled At</b></TableCell>
                            <TableCell><b>Created At</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {posts.map((post) => (
                            <TableRow key={post.id} hover>
                                <TableCell className="max-w-[280px] truncate">
                                    {post.title}
                                </TableCell>

                                <TableCell>{post.client_id}</TableCell>

                                <TableCell>
                                    <StatusBadge status={post.status} />
                                </TableCell>

                                <TableCell>
                                    {post.language || "-"}
                                </TableCell>

                                <TableCell>
                                    {post.master_category_name || "-"}
                                </TableCell>

                                <TableCell>
                                    {formatDate(post.scheduled_at)}
                                </TableCell>

                                <TableCell>
                                    {formatDate(post.created_at)}
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-2">
                                        <button
                                            className="text-blue-600 text-sm hover:underline"
                                            onClick={() => openEditModal(post)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="text-red-600 text-sm hover:underline"
                                            onClick={() => handleDelete(post)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

/* ================= HELPERS ================= */

function StatusBadge({ status }) {
    const colorMap = {
        published: "success",
        processing: "warning",
        failed: "error",
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
    const date = new Date(dateStr);
    return date.toLocaleString();
}
