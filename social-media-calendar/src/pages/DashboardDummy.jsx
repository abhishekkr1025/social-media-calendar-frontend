// ============================================================
// DASHBOARD.JSX  –  diff-friendly: only the changed sections
// are shown with full context. Search for ← NEW to find them.
// ============================================================

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Plus, Download, Trash2, Facebook, Instagram, Twitter, Linkedin, Youtube, Send } from 'lucide-react'

import '../App.css'
import { useNavigate } from 'react-router-dom'
import { SiWordpress } from 'react-icons/si'
import MonthCalendar from '@/components/MonthCalendar'
import { DndContext } from "@dnd-kit/core";
import { usePagination } from '@/services/usePagination'
import TablePagination from "@/components/TablePagination";
import WordPressSchedulerModal from '@/components/WordPressSchedulerModal'
import { showError, showSuccess, showWarning } from '@/components/Toast'
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Toolbar } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import { Telegram } from '@mui/icons-material'
import { authFetch } from '../lib/auth';

// ── NEW: Panditjee icon ─────────────────────────────────────
const PanditjeeIcon = () => (
  <span style={{ fontWeight: 700, fontSize: 14 }}>P</span>
);

function DashboardDummy() {
    const [clients, setClients] = useState([])
    const [posts, setPosts] = useState([])
    const [showAddClient, setShowAddClient] = useState(false)
    const [showAddPost, setShowAddPost] = useState(false)
    const [newClient, setNewClient] = useState('')
    const [selectedClient, setSelectedClient] = useState(null)
    const [currentView, setCurrentView] = useState('calendar')
    const [queuedPosts, setQueuedPosts] = useState([]);
    const [publishedPosts, setPublishedPosts] = useState([]);
    const navigate = useNavigate();
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [monthDirection, setMonthDirection] = useState("next");
    const [rawPosts, setRawPosts] = useState([]);
    const [isClosing, setIsClosing] = useState(false);
    const [isWpSchedulerOpen, setIsWpSchedulerOpen] = useState(false);
    // "social" | "blog" | "panditjee"  ← NEW option
    const [schedulerType, setSchedulerType] = useState("social");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [wpCategories, setWpCategories] = useState([]);
    const [masterCategories, setMasterCategories] = useState([]);
    const [wpPosts, setWpPosts] = useState([]);

    // ── NEW: Panditjee post state ────────────────────────────
    const [panditjeePost, setPanditjeePost] = useState({
        content: "",   // caption
        date: "",
        time: "",
        image: null
    });
    // ── NEW: Panditjee categories fetched from your backend ──
    // const [panditjeeCategories, setPanditjeeCategories] = useState([]);

    const [newPost, setNewPost] = useState({
        content: '',
        date: '',
        time: '',
        platforms: [],
        file: null
    })

    const [wpPost, setWpPost] = useState({
        title: "",
        content: "",
        excerpt: "",
        date: "",
        time: "",
        file: null,
        featured_image: null,
        wpStatus: "publish",
        language: "",
        master_category_id: "",
        slug: "",
        tags: "",
    });

    const {
        page: queuedPage,
        setPage: setQueuedPage,
        pageSize: queuedPageSize,
        setPageSize: setQueuedPageSize,
        totalPages: queuedTotalPages,
        paginatedData: paginatedQueuedPosts
    } = usePagination(queuedPosts, 5);

    const BLOG_LANGUAGES = [
        { label: "English", value: "English" },
        { label: "Hindi", value: "Hindi" },
        { label: "Tamil", value: "Tamil" },
        { label: "Telugu", value: "Telugu" },
        { label: "Marathi", value: "Marathi" },
        { label: "Bengali", value: "Bengali" },
        { label: "Gujarati", value: "Gujarati" }
    ];

    // const BASE_URL = "https://prod.panditjee.com";
    const BASE_URL = "http://localhost:5000"

    // ── NEW: fetch Panditjee categories when client changes ──
    // useEffect(() => {
    //     if (!selectedClient) return;
    //     fetch(`${BASE_URL}/api/panditjee/categories?clientId=${selectedClient.id}`)
    //         .then(res => res.json())
    //         .then(data => {
    //             if (Array.isArray(data)) setPanditjeeCategories(data);
    //         })
    //         .catch(() => {});
    // }, [selectedClient]);

    const fetchClients = async () => {
        try {
            const res = await authFetch(`${BASE_URL}/api/clients`);
            const data = await res.json();
            setClients(data);
        } catch (err) {
            console.error("Failed to fetch clients:", err);
        }
    };

    async function loadWpPostsForCalendar() {
        const res = await authFetch(`${BASE_URL}/api/wp-posts`);
        const data = await res.json();
        const formatted = data.map(p => {
            const dt = new Date(p.scheduled_at);
            return {
                id: `wp-${p.id}`,
                date: toLocalDateString(dt),
                time: dt.toISOString().split("T")[1].slice(0, 5),
                title: p.title,
                type: 'wp',
                status: p.status,
                language: p.language,
            };
        });
        setWpPosts(formatted);
    }

    useEffect(() => {
        loadQueued();
        loadPublished();
        fetchClients();
        loadAllPosts();
        loadWpPostsForCalendar();
    }, [selectedClient]);

    useEffect(() => {
        if (!clients.length || !rawPosts.length) return;
        const formatted = rawPosts.map(p => {
            const dt = new Date(p.scheduled_at);
            return {
                ...p,
                date: toLocalDateString(dt),
                time: dt.toISOString().split("T")[1].slice(0, 5),
                clientName: clients.find(c => c.id === p.clientId)?.name || "Client"
            };
        });
        setPosts(formatted);
    }, [clients, rawPosts]);

    useEffect(() => {
        authFetch(`${BASE_URL}/api/master-categories`)
            .then(res => res.json())
            .then(setMasterCategories);
    }, []);

    // ── NEW: Schedule a Panditjee post ───────────────────────
    const schedulePanditjeePost = async () => {
    if (!selectedClient) {
        showWarning("Please select a client");
        return;
    }

    if (!panditjeePost.content) {
        showWarning("Caption is required");
        return;
    }

    if (!panditjeePost.date || !panditjeePost.time) {
        showWarning("Please select date and time");
        return;
    }

    const scheduled_at = `${panditjeePost.date} ${panditjeePost.time}:00`;

    const formData = new FormData();
    formData.append("clientId", selectedClient.id);

    // ✅ IMPORTANT: use caption only
    formData.append("caption", panditjeePost.content);

    formData.append("scheduled_at", scheduled_at);
    formData.append("platform", "panditjee"); // 👈 important for worker

    if (panditjeePost.image) {
        formData.append("file", panditjeePost.image);
    }

    const res = await authFetch(`${BASE_URL}/api/panditjee/post`, {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        showError("Failed to schedule Panditjee post");
        return;
    }

    showSuccess("Panditjee post scheduled!");
    setPanditjeePost({
        title: "",
        content: "",
        date: "",
        time: "",
        category: "",
        image: null
    });

    closeScheduler();
};

    const scheduleWordPressPost = async () => {
        if (!selectedClient) { showWarning("Please select a client"); return; }
        if (!wpPost.title || !wpPost.content) { showWarning("Title and content are required"); return; }
        if (!wpPost.date || !wpPost.time) { showWarning("Please select date and time"); return; }

        const scheduled_at = `${wpPost.date} ${wpPost.time}:00`;
        const formData = new FormData();
        formData.append("clientId", selectedClient.id);
        formData.append("title", wpPost.title);
        formData.append("content", wpPost.content);
        formData.append("excerpt", wpPost.excerpt || "");
        formData.append("scheduled_at", scheduled_at);
        formData.append("status", "scheduled");
        formData.append("language", wpPost.language);
        formData.append("master_category_id", wpPost.master_category_id);
        formData.append("slug", wpPost.slug || "");
        formData.append("tags", wpPost.tags || "");
        if (wpPost.featured_image) formData.append("featured_image", wpPost.featured_image);

        const res = await authFetch(`${BASE_URL}/api/wp-posts`, { method: "POST", body: formData });
        if (!res.ok) { showError("Failed to schedule blog post"); return; }

        showSuccess("Blog Added Successfully!");
        setWpPost(prev => ({ ...prev, featured_image: null }));
        closeScheduler();
    };

    const handleAddClient = async () => { navigate("/onboard"); }
    const handleConnectButton = async () => { navigate("/connect-platform"); }

    const closeScheduler = () => {
        setIsClosing(true);
        setWpPost(prev => ({ ...prev, slug: "", tags: "", featured_image: null }));
        setTimeout(() => {
            setIsSchedulerOpen(false);
            setIsClosing(false);
        }, 200);
    };

    async function loadAllPosts() {
        const res = await authFetch(`${BASE_URL}/api/posts/all`);
        const data = await res.json();
        if (data.success) {
            setRawPosts(data.posts);
            setQueuedPosts(data.queued_posts || []);
        }
    }

    async function loadQueued() {
        const url = selectedClient?.id
            ? `${BASE_URL}/api/queued/${selectedClient.id}`
            : `${BASE_URL}/api/queued-posts`;
        const res = await authFetch(url);
        setQueuedPosts(await res.json());
    }

    async function loadPublished() {
        const url = selectedClient?.id
            ? `${BASE_URL}/api/published-posts/${selectedClient.id}`
            : `${BASE_URL}/api/published-posts`;
        const res = await authFetch(url);
        setPublishedPosts(await res.json());
    }

    const platformIcons = {
        facebook: <Facebook className="w-4 h-4" />,
        instagram: <Instagram className="w-4 h-4" />,
        twitter: <Twitter className="w-4 h-4" />,
        linkedin: <Linkedin className="w-4 h-4" />,
        youtube: <Youtube className="w-4 h-4" />,
        wordpress: <SiWordpress className='w-4 h-4' />,
        telegram: <Send className="w-5 h-5" />,
        panditjee: <PanditjeeIcon />,   // ← NEW
    }

    const platformColors = {
        facebook: 'bg-blue-500',
        instagram: 'bg-pink-500',
        twitter: 'bg-sky-500',
        linkedin: 'bg-blue-700',
        youtube: 'bg-red-500',
        wordpress: 'bg-blue-500',
        telegram: 'bg-sky-500',
        panditjee: 'bg-orange-500',     // ← NEW
    }

    function toLocalDateString(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    const addClient = async () => {
        if (!newClient.trim()) { showWarning("Please enter a client name"); return; }
        try {
            const response = await authFetch(`${BASE_URL}/api/clients`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newClient, email: "" })
            });
            if (!response.ok) throw new Error("Failed to add client");
            await fetchClients();
            setNewClient("");
            setShowAddClient(false);
        } catch (err) {
            showWarning("Failed to add client");
        }
    };

    const addPost = async () => {
        const isTrue = selectedClient && newPost.content && newPost.date && newPost.time && newPost.platforms.length > 0;
        if (isTrue) {
            try {
                const scheduled_at = `${newPost.date} ${newPost.time}:00`;
                const formData = new FormData();
                formData.append("clientId", selectedClient.id);
                formData.append("title", newPost.content);
                formData.append("caption", newPost.content);
                formData.append("scheduled_at", scheduled_at);
                formData.append("platforms", JSON.stringify(newPost.platforms));
                formData.append("file", newPost.file);

                const response = await authFetch(`${BASE_URL}/api/posts`, { method: "POST", body: formData });
                if (!response.ok) throw new Error("Failed to save post");

                closeScheduler();
                showSuccess(`Post Added on ${newPost.platforms}`);

                const postsRes = await authFetch(`${BASE_URL}/api/posts/all`);
                const updatedPosts = await postsRes.json();
                if (Array.isArray(updatedPosts)) setPosts(updatedPosts);

                setNewPost({ content: '', date: '', time: '', platforms: [] });
                setShowAddPost(false);
            } catch (error) {
                showWarning("Failed to save post. Check console for details.");
            }
        } else {
            showError("Please fill in all fields and select at least one platform!");
        }
    };

    const deletePost = async (postId) => {
        try {
            const response = await authFetch(`${BASE_URL}/api/deletePosts/${postId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete post");
            setPosts(posts.filter(post => post.id !== postId));
            showSuccess("Post deleted successfully!");
        } catch (error) {
            showError("Failed to delete post.");
        }
    };

    const goToPrevMonth = () => {
        setMonthDirection("prev");
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setMonthDirection("next");
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;
        const postId = active.id;
        const newDate = over.id;
        const post = posts.find(p => p.id === postId);
        if (!post || post.date === newDate) return;
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, date: newDate } : p));
        try {
            await authFetch(`${BASE_URL}/api/posts/${postId}/reschedule`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: newDate })
            });
        } catch (err) { console.error("Failed to reschedule post", err); }
    };

    const deleteClient = async (clientId) => {
        if (!window.confirm("Are you sure you want to delete this client?")) return;
        try {
            const response = await authFetch(`${BASE_URL}/api/deleteClient/${clientId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
            const responseText = await response.text();
            const result = JSON.parse(responseText);
            if (!response.ok) throw new Error(result.error || "Failed to delete client");
            setClients(prevClients => prevClients.filter(client => client.id !== clientId));
            showSuccess("Client deleted successfully!");
        } catch (error) {
            showError(`Failed to delete client: ${error.message}`);
        }
    };

    const togglePlatform = (platform) => {
        setNewPost(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform]
        }))
    }

    const exportToCSV = () => {
        const headers = ['Client', 'Date', 'Time', 'Content', 'Platforms']
        const rows = posts.map(post => [
            post.clientName, post.date, post.time,
            `"${post.content?.replace(/"/g, '""')}"`,
            post.platforms?.join('; ')
        ])
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `social-media-calendar-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const getPostsByDate = () => {
        const postsByDate = {}
        posts.forEach(post => {
            if (!postsByDate[post.date]) postsByDate[post.date] = []
            postsByDate[post.date].push(post)
        })
        return postsByDate
    }

    const filteredPosts = selectedClient
        ? posts.filter(p => p.clientId === selectedClient.id)
        : posts

    const {
        page: schedPage, setPage: setSchedPage,
        pageSize: schedPageSize, setPageSize: setSchedPageSize,
        totalPages: schedTotalPages, paginatedData: paginatedScheduledPosts
    } = usePagination(filteredPosts, 5);

    const {
        page: pubPage, setPage: setPubPage,
        pageSize: pubPageSize, setPageSize: setPubPageSize,
        totalPages: pubTotalPages, paginatedData: paginatedPublishedPosts
    } = usePagination(publishedPosts, 5);

    return (
        <div className="flex min-h-screen">
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[10px]" : "ml-0"}`}>
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-8 space-y-6">

                            {/* ── SCHEDULER MODAL ────────────────────────── */}
                            {isSchedulerOpen && (
                                <div
                                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
                                    onClick={closeScheduler}
                                >
                                    <Card
                                        className={`w-full max-w-lg max-h-[80vh] overflow-hidden transform transition-all duration-200 ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <CardHeader>
                                            <CardTitle>
                                                Schedule{" "}
                                                {schedulerType === "social" ? "Social Post"
                                                    : schedulerType === "blog" ? "Blog Post"
                                                    : "Panditjee Post"} — {selectedDate}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-4 overflow-y-auto max-h-[65vh] pr-2">

                                            {/* ── TAB TOGGLE (now 3 tabs) ── */}
                                            <div className="flex rounded-lg bg-gray-100 p-1">
                                                <button
                                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${schedulerType === "social" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                                    onClick={() => setSchedulerType("social")}
                                                >
                                                    Social Post
                                                </button>
                                                <button
                                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${schedulerType === "blog" ? "bg-white shadow text-purple-600" : "text-gray-500 hover:text-gray-700"}`}
                                                    onClick={() => setSchedulerType("blog")}
                                                >
                                                    Blog Post
                                                </button>
                                                {/* ← NEW TAB */}
                                                <button
                                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${schedulerType === "panditjee" ? "bg-white shadow text-orange-600" : "text-gray-500 hover:text-gray-700"}`}
                                                    onClick={() => setSchedulerType("panditjee")}
                                                >
                                                    Panditjee
                                                </button>
                                            </div>

                                            {/* ── CLIENT SELECTOR ── */}
                                            <div>
                                                <label className="text-sm font-medium">Client</label>
                                                <div className="flex gap-2 flex-wrap mt-1">
                                                    {clients.map((client) => (
                                                        <Button
                                                            key={client.id}
                                                            size="sm"
                                                            variant={selectedClient?.id === client.id ? "default" : "outline"}
                                                            onClick={() => setSelectedClient(client)}
                                                        >
                                                            {client.name}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* ── SOCIAL POST ── */}
                                            {schedulerType === "social" && (
                                                <>
                                                    <Textarea
                                                        placeholder="Post content"
                                                        value={newPost.content}
                                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                                    />
                                                    <div>
                                                        <label className="text-sm font-medium mb-1 block">Upload Image / Video</label>
                                                        <input
                                                            type="file"
                                                            accept="image/*,video/*"
                                                            onChange={(e) => setNewPost({ ...newPost, file: e.target.files?.[0] || null })}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {Object.keys(platformIcons)
                                                            .filter(p => p !== "wordpress" && p !== "panditjee")
                                                            .map((platform) => (
                                                                <Button
                                                                    key={platform}
                                                                    size="sm"
                                                                    variant={newPost.platforms.includes(platform) ? "default" : "outline"}
                                                                    onClick={() => togglePlatform(platform)}
                                                                >
                                                                    {platformIcons[platform]} {platform}
                                                                </Button>
                                                            ))}
                                                    </div>
                                                </>
                                            )}

                                            {/* ── BLOG POST (WORDPRESS) ── */}
                                            {schedulerType === "blog" && (
                                                <>
                                                    <div>
                                                        <label className="text-sm font-medium mb-1 block">Blog Language</label>
                                                        <select
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                            value={wpPost.language}
                                                            onChange={(e) => setWpPost({ ...wpPost, language: e.target.value })}
                                                        >
                                                            {BLOG_LANGUAGES.map(lang => (
                                                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium mb-1 block">Category</label>
                                                        <select
                                                            className="w-full border rounded-md px-3 py-2 text-sm"
                                                            value={wpPost.master_category_id}
                                                            onChange={(e) => setWpPost({ ...wpPost, master_category_id: e.target.value })}
                                                        >
                                                            <option value="">Select Category</option>
                                                            {masterCategories.map(cat => (
                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium mb-1 block">
                                                            Featured Image <span className="text-gray-400 font-normal">(optional)</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setWpPost({ ...wpPost, featured_image: e.target.files?.[0] || null })}
                                                            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                                                        />
                                                        {wpPost.featured_image && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-green-600">✓ {wpPost.featured_image.name}</span>
                                                                <button className="text-xs text-red-500 hover:underline" onClick={() => setWpPost({ ...wpPost, featured_image: null })}>Remove</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label className="text-sm font-medium mb-1 block">Blog Title</label>
                                                    <Input
                                                        placeholder="Blog title"
                                                        value={wpPost.title}
                                                        onChange={(e) => setWpPost({ ...wpPost, title: e.target.value })}
                                                    />
                                                    <label className="text-sm font-medium mb-1 block">Blog Content</label>
                                                    <Textarea
                                                        placeholder="Write your blog content..."
                                                        rows={6}
                                                        value={wpPost.content}
                                                        onChange={(e) => setWpPost({ ...wpPost, content: e.target.value })}
                                                    />
                                                    <div>
                                                        <label className="text-sm font-medium mb-1 block">
                                                            Slug <span className="text-gray-400 font-normal text-xs">(optional)</span>
                                                        </label>
                                                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                                            <span className="bg-gray-50 px-3 py-2 text-xs text-gray-400 border-r border-gray-300 whitespace-nowrap">/article/</span>
                                                            <input
                                                                type="text"
                                                                value={wpPost.slug}
                                                                onChange={e => setWpPost({ ...wpPost, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
                                                                placeholder="my-post-slug"
                                                                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium mb-1 block">
                                                            Tags <span className="text-gray-400 font-normal text-xs">(optional — comma separated)</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={wpPost.tags}
                                                            onChange={e => setWpPost({ ...wpPost, tags: e.target.value })}
                                                            placeholder="politics, india, news"
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
                                                        />
                                                        {wpPost.tags && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {wpPost.tags.split(",").map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                                                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-xs">#{tag}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {/* ── PANDITJEE POST (NEW) ── */}
                                            {schedulerType === "panditjee" && (
                                                <>
                                                    {/* Caption */}
                                                    <div>
                                                        <label className="text-sm font-medium mb-1 block">
                                                            Caption
                                                        </label>
                                                        <Textarea
                                                            placeholder="Write your caption..."
                                                            rows={4}
                                                            value={panditjeePost.content}
                                                            onChange={(e) =>
                                                                setPanditjeePost({
                                                                    ...panditjeePost,
                                                                    content: e.target.value
                                                                })
                                                            }
                                                        />
                                                    </div>

                                                    {/* Image / Video Upload */}
                                                    <div>
                                                        <label className="text-sm font-medium mb-1 block">
                                                            Upload Image / Video
                                                        </label>
                                                        <input
                                                            type="file"
                                                            accept="image/*,video/*"
                                                            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                                                            onChange={(e) =>
                                                                setPanditjeePost({
                                                                    ...panditjeePost,
                                                                    image: e.target.files?.[0] || null
                                                                })
                                                            }
                                                        />

                                                        {panditjeePost.image && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-green-600">
                                                                    ✓ {panditjeePost.image.name}
                                                                </span>
                                                                <button
                                                                    className="text-xs text-red-500 hover:underline"
                                                                    onClick={() =>
                                                                        setPanditjeePost({
                                                                            ...panditjeePost,
                                                                            image: null
                                                                        })
                                                                    }
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info Message */}
                                                    {selectedClient && (
                                                        <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                                                            Posting as <strong>{selectedClient.name}</strong> on Panditjee
                                                        </p>
                                                    )}
                                                </>
                                            )}

                                            {/* ── TIME PICKER ── */}
                                            <Input
                                                type="time"
                                                value={
                                                    schedulerType === "social"
                                                        ? newPost.time
                                                        : schedulerType === "blog"
                                                        ? wpPost.time
                                                        : panditjeePost.time
                                                }
                                                onChange={(e) => {
                                                    if (schedulerType === "social") setNewPost({ ...newPost, time: e.target.value });
                                                    else if (schedulerType === "blog") setWpPost({ ...wpPost, time: e.target.value });
                                                    else setPanditjeePost({ ...panditjeePost, time: e.target.value });
                                                }}
                                            />

                                            {/* ── ACTIONS ── */}
                                            <div className="flex gap-2">
                                                <Button
                                                    className="flex-1"
                                                    onClick={() => {
                                                        if (schedulerType === "social") addPost();
                                                        else if (schedulerType === "blog") scheduleWordPressPost();
                                                        else schedulePanditjeePost();
                                                    }}
                                                >
                                                    Schedule{" "}
                                                    {schedulerType === "social" ? "Post"
                                                        : schedulerType === "blog" ? "Blog"
                                                        : "on Panditjee"}
                                                </Button>
                                                <Button variant="outline" onClick={closeScheduler}>Cancel</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* ── MONTH NAV ── */}
                            <div className="flex items-center justify-between mb-4">
                                <Button variant="outline" size="sm" onClick={goToPrevMonth}>←</Button>
                                <h2 className="text-lg font-semibold">
                                    {calendarDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                                </h2>
                                <Button variant="outline" size="sm" onClick={goToNextMonth}>→</Button>
                            </div>

                            {/* ── CALENDAR ── */}
                            <DndContext onDragEnd={handleDragEnd}>
                                <div
                                    key={calendarDate.toISOString()}
                                    className={`transition-all duration-300 ease-in-out ${monthDirection === "next" ? "animate-slide-left" : "animate-slide-right"}`}
                                >
                                    <div className="w-full max-w-none">
                                        <MonthCalendar
                                            posts={filteredPosts}
                                            wpPosts={wpPosts}
                                            calendarDate={calendarDate}
                                            onDateClick={(date) => {
                                                setSelectedDate(date);
                                                setNewPost(prev => ({ ...prev, date, time: prev.time || "09:00" }));
                                                setWpPost(prev => ({ ...prev, date, time: prev.time || "09:00" }));
                                                setPanditjeePost(prev => ({ ...prev, date, time: prev.time || "09:00" }));
                                                if (!selectedClient && clients.length === 1) setSelectedClient(clients[0]);
                                                setIsSchedulerOpen(true);
                                            }}
                                        />
                                    </div>
                                </div>
                            </DndContext>

                            {/* ── SCHEDULED POSTS TABLE ── */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">
                                    {selectedClient ? `${selectedClient.name}'s Schedule` : 'All Scheduled Posts'}
                                </h2>
                                {filteredPosts.length === 0 ? (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No posts scheduled yet</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardContent className="p-0 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Client</th>
                                                        <th className="px-4 py-3 text-left">Date</th>
                                                        <th className="px-4 py-3 text-left">Time</th>
                                                        <th className="px-4 py-3 text-left">Content</th>
                                                        <th className="px-4 py-3 text-left">Platforms</th>
                                                        <th className="px-4 py-3 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedScheduledPosts.map(post => (
                                                        <tr key={post.id} className="border-b hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium">{post.clientName}</td>
                                                            <td className="px-4 py-3">{post.date}</td>
                                                            <td className="px-4 py-3">{post.time}</td>
                                                            <td className="px-4 py-3 truncate max-w-sm">{post.caption}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-1">
                                                                    {post.platforms?.map(platform => (
                                                                        <div key={platform} className={`${platformColors[platform]} p-1.5 rounded text-white`} title={platform}>
                                                                            {platformIcons[platform]}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button onClick={() => deletePost(post.id)} className="flex items-center gap-1 text-red-600 hover:text-red-800">
                                                                    <Trash2 className="w-4 h-4" /> Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <TablePagination page={schedPage} totalPages={schedTotalPages} pageSize={schedPageSize} setPage={setSchedPage} setPageSize={setSchedPageSize} />
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* ── QUEUED POSTS ── */}
                            <div className="mt-10">
                                <h2 className="text-xl font-semibold mb-3">Queued Posts (Waiting for Worker)</h2>
                                {queuedPosts.length === 0 ? (
                                    <p className="text-gray-500">No queued posts found.</p>
                                ) : (
                                    <Card>
                                        <CardContent className="p-0 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Platform</th>
                                                        <th className="px-4 py-3 text-left">Caption</th>
                                                        <th className="px-4 py-3 text-left">Status</th>
                                                        <th className="px-4 py-3 text-left">Scheduled At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedQueuedPosts.map(q => (
                                                        <tr key={q.id} className="border-b hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium">{q.platform?.toUpperCase()}</td>
                                                            <td className="px-4 py-3 truncate max-w-md">{q.title}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${q.status === "queued" && "bg-yellow-100 text-yellow-800"} ${q.status === "processing" && "bg-blue-100 text-blue-800"} ${q.status === "posted" && "bg-green-100 text-green-800"} ${q.status === "failed" && "bg-red-100 text-red-800"}`}>
                                                                    {q.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">{new Date(q.scheduled_at).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <TablePagination page={queuedPage} totalPages={queuedTotalPages} pageSize={queuedPageSize} setPage={setQueuedPage} setPageSize={setQueuedPageSize} />
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* ── PUBLISHED POSTS ── */}
                            <div className="mt-10">
                                <h2 className="text-xl font-semibold mb-3">Published Posts (History)</h2>
                                {publishedPosts.length === 0 ? (
                                    <p className="text-gray-500">No published posts yet.</p>
                                ) : (
                                    <Card>
                                        <CardContent className="p-0 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Platform</th>
                                                        <th className="px-4 py-3 text-left">Caption</th>
                                                        <th className="px-4 py-3 text-left">Status</th>
                                                        <th className="px-4 py-3 text-left">Posted At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedPublishedPosts.map(p => (
                                                        <tr key={p.id} className="border-b hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium">{p.platform?.toUpperCase()}</td>
                                                            <td className="px-4 py-3 truncate max-w-md">{p.caption}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 rounded text-xs ${p.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                                    {p.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">{new Date(p.created_at).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <TablePagination page={pubPage} totalPages={pubTotalPages} pageSize={pubPageSize} setPage={setPubPage} setPageSize={setPubPageSize} />
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardDummy