import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Plus, Download, Trash2, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'

import '../App.css'
import { useNavigate } from 'react-router-dom'
import { SiWordpress } from 'react-icons/si'
import MonthCalendar from '@/components/MonthCalendar'
import { DndContext } from "@dnd-kit/core";
import { usePagination } from '@/services/usePagination'
import TablePagination from "@/components/TablePagination";
import WordPressSchedulerModal from '@/components/WordPressSchedulerModal'



function Dashboard() {
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
  const [monthDirection, setMonthDirection] = useState("next"); // "next" | "prev"
  const [rawPosts, setRawPosts] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [isWpSchedulerOpen, setIsWpSchedulerOpen] = useState(false);
  const [schedulerType, setSchedulerType] = useState("social");
  // "social" | "blog"






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
    wpStatus: "publish"
  });


  const {
    page: queuedPage,
    setPage: setQueuedPage,
    pageSize: queuedPageSize,
    setPageSize: setQueuedPageSize,
    totalPages: queuedTotalPages,
    paginatedData: paginatedQueuedPosts
  } = usePagination(queuedPosts, 5);


  const BASE_URL = "https://prod.panditjee.com"

  const fetchClients = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/clients`);
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  useEffect(() => {
    loadQueued();
    loadPublished();
    fetchClients();
    loadAllPosts();
  }, [selectedClient]);


  useEffect(() => {
    if (!clients.length || !rawPosts.length) return;

    const formatted = rawPosts.map(p => {
      const dt = new Date(p.scheduled_at);
      return {
        ...p,
        date: toLocalDateString(dt),
        time: dt.toISOString().split("T")[1].slice(0, 5),
        clientName:
          clients.find(c => c.id === p.clientId)?.name || "Client"
      };
    });

    setPosts(formatted);
  }, [clients, rawPosts]);


  const scheduleWordPressPost = async () => {
    if (!selectedClient) {
      return alert("Please select a client");
    }

    if (!wpPost.title || !wpPost.content) {
      return alert("Title and content are required");
    }

    console.log(`Date: ${wpPost.date}`);
    console.log(`Time: ${wpPost.time}`);

    if (!wpPost.date || !wpPost.time) {
      return alert("Please select date and time");
    }

    const scheduled_at = `${wpPost.date} ${wpPost.time}:00`;

    const formData = new FormData();
    formData.append("clientId", selectedClient.id);
    formData.append("title", wpPost.title);
    formData.append("content", wpPost.content);
    formData.append("excerpt", wpPost.excerpt || "");
    formData.append("scheduled_at", scheduled_at);
    formData.append("status", "scheduled");

    if (wpPost.file) {
      formData.append("file", wpPost.file);
    }

    console.log(formData.get("scheduled_at"));
    console.log(formData.get("title"))
    console.log(formData.get("content"))
    console.log(formData.get("clientId"))

    const res = await fetch(`${BASE_URL}/api/wp-posts`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(err);
      alert("Failed to schedule blog post");
      return;
    }

    setIsWpSchedulerOpen(false);
  };







  const handleAddClient = async () => {
    navigate("/onboard");
  }

  const handleConnectButton = async () => {
    navigate("/connect-platform");
  }

  const closeScheduler = () => {
    setIsClosing(true);

    // wait for animation to finish
    setTimeout(() => {
      setIsSchedulerOpen(false);
      setIsClosing(false);
    }, 200); // must match animation duration
  };

  const loadWpPosts = async () => {
    const res = await fetch(`${BASE_URL}/api/wp-posts`);
    const data = await res.json();
    setWpPosts(data);
  };


  async function loadAllPosts() {
    const res = await fetch(`${BASE_URL}/api/posts/all`);
    const data = await res.json();

    if (data.success) {
      setRawPosts(data.posts);
      setQueuedPosts(data.queued_posts || []);
    }
  }




  async function loadQueued() {
    const url = selectedClient && selectedClient.id
      ? `${BASE_URL}/api/queued/${selectedClient.id}`
      : `${BASE_URL}/api/queued-posts`;

    const res = await fetch(url);
    const data = await res.json();
    // console.log(data)
    setQueuedPosts(data);
  }


  async function loadPublished() {
    const url = selectedClient && selectedClient.id
      ? `${BASE_URL}/api/published-posts/${selectedClient.id}`
      : `${BASE_URL}/api/published-posts`;

    const res = await fetch(url);
    const data = await res.json();
    setPublishedPosts(data);
  }











  const platformIcons = {
    facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    wordpress: <SiWordpress className='w-4 h-4' />
  }

  const platformColors = {
    facebook: 'bg-blue-500',
    instagram: 'bg-pink-500',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
    youtube: 'bg-red-500',
    wordpress: 'bg-blue-500'

  }

  function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }




  const addClient = async () => {
    if (!newClient.trim()) return alert("Please enter a client name");

    try {
      const response = await fetch(`${BASE_URL}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClient, email: "" }) // optional email field
      });

      if (!response.ok) throw new Error("Failed to add client");

      const data = await response.json();
      console.log("Client added:", data);

      // refresh client list from DB
      await fetchClients();

      setNewClient("");
      setShowAddClient(false);
    } catch (err) {
      console.error("Error adding client:", err);
      alert("Failed to add client");
    }
  };






  const addPost = async () => {
    console.log("function called");
    var isTrue = selectedClient &&
      newPost.content &&
      newPost.date &&
      newPost.time &&
      newPost.platforms.length > 0;

    console.log("VALIDATION DEBUG", {
      selectedClient,
      content: newPost.content,
      date: newPost.date,
      time: newPost.time,
      platforms: newPost.platforms
    });


    console.log("Validation:", isTrue);

    if (isTrue) {
      try {
        // const imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdPJYVL1V2HvDgFjqF5xm0l5WuZCnS5QrSw&s";

        if (!newPost.date || !newPost.time) {
          alert("Please select a date and time");
          return;
        }

        const scheduled_at = `${newPost.date} ${newPost.time}:00`;





        const formData = new FormData();
        formData.append("clientId", selectedClient.id);
        formData.append("title", newPost.content);
        formData.append("caption", newPost.content);
        formData.append("scheduled_at", scheduled_at);
        formData.append("platforms", JSON.stringify(newPost.platforms));
        formData.append("file", newPost.file);

        console.log("formdata: ", JSON.stringify(formData));

        console.log(formData.get("scheduled_at"))

        const response = await fetch(`${BASE_URL}/api/posts`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Failed to save post");
        }

        closeScheduler();


        const result = await response.json();
        console.log("✅ Post saved:", result);

        // 2️⃣ Fetch updated posts from database
        const postsRes = await fetch(`${BASE_URL}/api/posts/all`);
        const updatedPosts = await postsRes.json();

        if (Array.isArray(updatedPosts)) {
          setPosts(updatedPosts);
          console.log("✅ Posts refreshed:", updatedPosts);
        }

        // 3️⃣ Reset form
        setNewPost({ content: '', date: '', time: '', platforms: [] });
        setShowAddPost(false);


        // 🟣 4️⃣ Try posting to Instagram if selected









      } catch (error) {
        console.error("❌ Error adding post:", error);
        alert("Failed to save post. Check console for details.");
      }
    } else {
      alert("Please fill in all fields and select at least one platform!");
    }
  };


  const deletePost = async (postId) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting post:", postId);

      const response = await fetch(`${BASE_URL}/api/deletePosts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      const result = await response.json();
      console.log("✅ Post deleted:", result);

      // Update the posts state to remove the deleted post
      setPosts(posts.filter(post => post.id !== postId));

      // Optional: Show success message
      alert("Post deleted successfully!");

    } catch (error) {
      console.error("❌ Error deleting post:", error);
      alert("Failed to delete post. Check console for details.");
    }
  };

  const goToPrevMonth = () => {
    setMonthDirection("prev");
    setCalendarDate(prev =>
      new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setMonthDirection("next");
    setCalendarDate(prev =>
      new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };


  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Dropped outside any valid cell
    if (!over) return;

    const postId = active.id;      // post id
    const newDate = over.id;       // YYYY-MM-DD

    // No change
    const post = posts.find(p => p.id === postId);
    if (!post || post.date === newDate) return;

    // 🔹 Update UI immediately (optimistic update)
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, date: newDate }
          : p
      )
    );

    try {
      // 🔹 Persist to backend
      await fetch(`${BASE_URL}/api/posts/${postId}/reschedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate })
      });
    } catch (err) {
      console.error("Failed to reschedule post", err);
    }
  };



  const deleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting client:", clientId);
      const url = `${BASE_URL}/api/deleteClient/${clientId}`;
      console.log("📍 URL:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("📡 Response status:", response.status);
      console.log(response.json);
      console.log("📡 Response content-type:", response.headers.get('content-type'));

      // Get the response text to see what's actually being returned
      const responseText = await response.text();
      console.log("📄 Response body:", responseText);

      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Response is not JSON:", responseText.substring(0, 200));
        throw new Error("Server returned HTML instead of JSON. Check if backend is running.");
      }

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete client");
      }

      console.log("✅ Client deleted:", result);
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      alert("Client deleted successfully!");

    } catch (error) {
      console.error("❌ Error deleting client:", error);
      alert(`Failed to delete client: ${error.message}`);
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
      post.clientName,
      post.date,
      post.time,
      `"${post.content.replace(/"/g, '""')}"`,
      post.platforms.join('; ')
    ])

    const csv = [headers, ...rows].map(row => row.join(','))
      .join('\n')

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
      if (!postsByDate[post.date]) {
        postsByDate[post.date] = []
      }
      postsByDate[post.date].push(post)
    })
    return postsByDate
  }

  const sortedDates = Object.keys(getPostsByDate()).sort()

  const filteredPosts = selectedClient
    ? posts.filter(p => p.clientId === selectedClient.id)
    : posts


  const {
    page: schedPage,
    setPage: setSchedPage,
    pageSize: schedPageSize,
    setPageSize: setSchedPageSize,
    totalPages: schedTotalPages,
    paginatedData: paginatedScheduledPosts
  } = usePagination(filteredPosts, 5);


  const {
    page: pubPage,
    setPage: setPubPage,
    pageSize: pubPageSize,
    setPageSize: setPubPageSize,
    totalPages: pubTotalPages,
    paginatedData: paginatedPublishedPosts
  } = usePagination(publishedPosts, 5);



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 top-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 bg-black z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Social Media Calendar</h1>
                <p className="text-sm text-gray-500">Manage posts for all your clients</p>
              </div>
            </div>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>


            <Button onClick={handleConnectButton} variant="outline" className="gap-2">

              Connect to Platforms
            </Button>


          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Clients */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Clients</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => handleAddClient()}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>

                  {/* <Button
                    size="sm"
                    onClick={addClient}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>  */}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {showAddClient && (
                  <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input
                      placeholder="Client name"
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addClient()}
                    />
                    <Button size="sm" onClick={addClient}>Add</Button>
                  </div>
                )}

                <Button
                  variant={selectedClient === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedClient(null)}
                >
                  All Clients ({posts.length})
                </Button>



                {clients.map(client => (
                  <div key={client.id} className="flex items-center gap-2 group">
                    <Button
                      variant={selectedClient?.id === client.id ? "default" : "ghost"}
                      className="flex-1 justify-start"
                      onClick={() => setSelectedClient(client)}
                    >
                      {client.name} ({posts.filter(p => p.clientId === client.id).length})
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteClient(client.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {clients.length === 0 && !showAddClient && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No clients yet. Add one to get started!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Add Post Section */}
            {isSchedulerOpen && (
              <div
                className={`
      fixed inset-0 z-50 flex items-center justify-center
      bg-black/40
      transition-opacity duration-200
      ${isClosing ? "opacity-0" : "opacity-100"}
    `}
                onClick={closeScheduler} // outside click
              >
                <Card
                  className={`
        w-full max-w-lg
        transform transition-all duration-200
        ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}
      `}
                  onClick={(e) => e.stopPropagation()} // prevent outside close
                >
                  <CardHeader>
                    <CardTitle>
                      Schedule {schedulerType === "social" ? "Social Post" : "Blog Post"} —{" "}
                      {selectedDate}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 🔀 TOGGLE */}
                    <div className="flex rounded-lg bg-gray-100 p-1">
                      <button
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition
              ${schedulerType === "social"
                            ? "bg-white shadow text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                          }`}
                        onClick={() => setSchedulerType("social")}
                      >
                        Social Post
                      </button>

                      <button
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition
              ${schedulerType === "blog"
                            ? "bg-white shadow text-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                          }`}
                        onClick={() => setSchedulerType("blog")}
                      >
                        Blog Post
                      </button>
                    </div>

                    {/* 👤 CLIENT */}
                    <div>
                      <label className="text-sm font-medium">Client</label>
                      <div className="flex gap-2 flex-wrap">
                        {clients.map((client) => (
                          <Button
                            key={client.id}
                            size="sm"
                            variant={
                              selectedClient?.id === client.id ? "default" : "outline"
                            }
                            onClick={() => setSelectedClient(client)}
                          >
                            {client.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* =====================
            SOCIAL POST
        ===================== */}
                    {schedulerType === "social" && (
                      <>
                        <Textarea
                          placeholder="Post content"
                          value={newPost.content}
                          onChange={(e) =>
                            setNewPost({ ...newPost, content: e.target.value })
                          }
                        />

                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Upload Image / Video
                          </label>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) =>
                              setNewPost({
                                ...newPost,
                                file: e.target.files?.[0] || null,
                              })
                            }
                          />
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {Object.keys(platformIcons)
                            .filter((p) => p !== "wordpress")
                            .map((platform) => (
                              <Button
                                key={platform}
                                size="sm"
                                variant={
                                  newPost.platforms.includes(platform)
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => togglePlatform(platform)}
                              >
                                {platformIcons[platform]} {platform}
                              </Button>
                            ))}
                        </div>
                      </>
                    )}

                    {/* =====================
            BLOG POST (WORDPRESS)
        ===================== */}
                    {schedulerType === "blog" && (
                      <>
                        <Input
                          placeholder="Blog title"
                          value={wpPost.title}
                          onChange={(e) =>
                            setWpPost({ ...wpPost, title: e.target.value })
                          }
                        />

                        <Textarea
                          placeholder="Write your blog content..."
                          rows={6}
                          value={wpPost.content}
                          onChange={(e) =>
                            setWpPost({ ...wpPost, content: e.target.value })
                          }
                        />

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setWpPost({
                              ...wpPost,
                              featuredImage: e.target.files?.[0] || null,
                            })
                          }
                        />
                        <Textarea
                          placeholder="Excerpt (optional)"
                          rows={2}
                          value={wpPost.excerpt}
                          onChange={(e) =>
                            setWpPost({ ...wpPost, excerpt: e.target.value })
                          }
                        />
                      </>
                    )}

                    {/* ⏰ TIME */}
                    {schedulerType === "social" ? (
                      <Input
                        type="time"
                        value={newPost.time}
                        onChange={(e) =>
                          setNewPost({ ...newPost, time: e.target.value })
                        }
                      />
                    ) : (
                      <Input
                        type="time"
                        value={wpPost.time}
                        onChange={(e) =>
                          setWpPost({ ...wpPost, time: e.target.value })
                        }
                      />
                    )}


                    {/* 🔘 ACTIONS */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() =>
                          schedulerType === "social"
                            ? addPost()
                            : scheduleWordPressPost()
                        }
                      >
                        Schedule {schedulerType === "social" ? "Post" : "Blog"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={closeScheduler}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}





            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={goToPrevMonth}>
                ←
              </Button>

              <h2 className="text-lg font-semibold">
                {calendarDate.toLocaleString("en-US", {
                  month: "long",
                  year: "numeric"
                })}
              </h2>

              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                →
              </Button>
            </div>





            <DndContext onDragEnd={handleDragEnd}>
              <div
                key={calendarDate.toISOString()}
                className={`transition-all duration-300 ease-in-out
    ${monthDirection === "next"
                    ? "animate-slide-left"
                    : "animate-slide-right"}
  `}
              >
                <MonthCalendar
                  posts={filteredPosts}
                  calendarDate={calendarDate}
                  onDateClick={(date) => {
                    setSelectedDate(date);

                    setNewPost(prev => ({
                      ...prev,
                      date,
                      time: prev.time === "" ? "09:00" : prev.time
                    }));

                    // ✅ WordPress post (THIS WAS MISSING)
                    setWpPost(prev => ({
                      ...prev,
                      date,
                      time: prev.time === "" ? "09:00" : prev.time

                    }));

                    if (!selectedClient && clients.length === 1) {
                      setSelectedClient(clients[0]);
                    }

                    setIsSchedulerOpen(true);
                  }}

                />
              </div>
            </DndContext>


            {/* Posts Calendar View */}
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
                // <Card>
                //   <CardContent className="p-0 overflow-x-auto">
                //     <table className="w-full text-sm">
                //       <thead className="bg-gray-50 border-b">
                //         <tr>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">Time</th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">Client</th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">Platforms</th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">Content</th>
                //           <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                //         </tr>
                //       </thead>

                //       <tbody>
                //         {filteredPosts
                //           .sort(
                //             (a, b) =>
                //               `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
                //           )
                //           .map(post => (
                //             <tr
                //               key={post.id}
                //               className="border-b last:border-b-0 hover:bg-gray-50 transition"
                //             >
                //               {/* Date */}
                //               <td className="px-4 py-3 whitespace-nowrap">
                //                 {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                //                   month: "short",
                //                   day: "numeric",
                //                   year: "numeric"
                //                 })}
                //               </td>

                //               {/* Time */}
                //               <td className="px-4 py-3 font-medium text-gray-700">
                //                 {post.time}
                //               </td>

                //               {/* Client */}
                //               <td className="px-4 py-3">
                //                 <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">
                //                   {post.clientName}
                //                 </Badge>
                //               </td>

                //               {/* Platforms */}
                // <td className="px-4 py-3">
                //   <div className="flex gap-1">
                //     {post.platforms.map(platform => (
                //       <div
                //         key={platform}
                //         className={`${platformColors[platform]} p-1.5 rounded text-white`}
                //         title={platform}
                //       >
                //         {platformIcons[platform]}
                //       </div>
                //     ))}
                //   </div>
                // </td>

                //               {/* Content */}
                //               <td className="px-4 py-3 max-w-md truncate text-gray-700">
                //                 {post.content}
                //               </td>

                //               {/* Actions */}
                //               <td className="px-4 py-3 text-right">
                //                 <Button
                //                   size="sm"
                //                   variant="ghost"
                //                   onClick={() => deletePost(post.id)}
                //                   className="hover:bg-red-50"
                //                 >
                //                   <Trash2 className="w-4 h-4 text-red-500" />
                //                 </Button>
                //               </td>
                //             </tr>
                //           ))}
                //       </tbody>
                //     </table>
                //   </CardContent>
                // </Card>

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
                            <td className="px-4 py-3 truncate max-w-sm">
                              {post.caption}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {post.platforms.map(platform => (
                                  <div
                                    key={platform}
                                    className={`${platformColors[platform]} p-1.5 rounded text-white`}
                                    title={platform}
                                  >
                                    {platformIcons[platform]}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this post?")) {
                                    deletePost(post.id);
                                  }
                                }}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <TablePagination
                      page={schedPage}
                      totalPages={schedTotalPages}
                      pageSize={schedPageSize}
                      setPage={setSchedPage}
                      setPageSize={setSchedPageSize}
                    />
                  </CardContent>
                </Card>


              )}
            </div>


            {/* ================================
    🚀 QUEUED POSTS (Worker Pending)
   ================================ */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-3">
                Queued Posts (Waiting for Worker)
              </h2>

              {queuedPosts.length === 0 ? (
                <p className="text-gray-500">No queued posts found.</p>
              ) : (
                // <Card>
                //   <CardContent className="p-0 overflow-x-auto">


                //     <table className="w-full text-sm">
                //       <thead className="bg-gray-50 border-b">
                //         <tr>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">
                //             Platform
                //           </th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">
                //             Caption
                //           </th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">
                //             Scheduled At
                //           </th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">
                //             Status
                //           </th>
                //         </tr>
                //       </thead>
                //       <tbody>
                //         {paginatedData.map(q => (
                //           <tr key={q.id} className="border-b">
                //             <td className="px-4 py-3">{q.platform.toUpperCase()}</td>
                //             <td className="px-4 py-3">{q.caption}</td>
                // <td className="px-4 py-3 text-gray-600">
                //   {new Date(q.scheduled_at).toLocaleString()}
                // </td>
                //         <td className="px-4 py-3">
                //           <span
                //             className={`
                //   inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                //   ${q.status === "queued" && "bg-yellow-100 text-yellow-800"}
                //   ${q.status === "processing" && "bg-blue-100 text-blue-800"}
                //   ${q.status === "posted" && "bg-green-100 text-green-800"}
                //   ${q.status === "failed" && "bg-red-100 text-red-800"}
                // `}
                //           >
                //             {q.status}
                //           </span>
                //         </td>
                //           </tr>
                //         ))}
                //       </tbody>


                //     </table>

                //     <TablePagination
                //       page={page}
                //       totalPages={totalPages}
                //       pageSize={pageSize}
                //       setPage={setPage}
                //       setPageSize={setPageSize}
                //     />

                //   </CardContent>
                // </Card>

                <Card>
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left">Platform</th>
                          <th className="px-4 py-3 text-left">Caption</th>
                          <th className="px-4 py-3 text-left">Scheduled At</th>
                          <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedQueuedPosts.map(q => (
                          <tr key={q.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">
                              {q.platform.toUpperCase()}
                            </td>
                            <td className="px-4 py-3 truncate max-w-md">
                              {q.title}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${q.status === "queued" && "bg-yellow-100 text-yellow-800"}
                      ${q.status === "processing" && "bg-blue-100 text-blue-800"}
                      ${q.status === "posted" && "bg-green-100 text-green-800"}
                      ${q.status === "failed" && "bg-red-100 text-red-800"}
                    `}
                              >
                                {q.status}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {new Date(q.scheduled_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <TablePagination
                      page={queuedPage}
                      totalPages={queuedTotalPages}
                      pageSize={queuedPageSize}
                      setPage={setQueuedPage}
                      setPageSize={setQueuedPageSize}
                    />
                  </CardContent>
                </Card>

              )}
            </div>

            {/* ================================
    🟢 PUBLISHED POSTS HISTORY
   ================================ */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-3">
                Published Posts (History)
              </h2>

              {publishedPosts.length === 0 ? (
                <p className="text-gray-500">No published posts yet.</p>
              ) : (
                // <Card>
                //   <CardContent className="p-0 overflow-x-auto">
                //     <table className="w-full text-sm">
                //       <thead className="bg-gray-50 border-b">
                //         <tr>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">
                //             Platform
                //           </th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">
                //             Caption
                //           </th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">
                //             Status
                //           </th>
                //           <th className="px-4 py-3 text-left font-medium text-gray-600">
                //             Posted At
                //           </th>
                //         </tr>
                //       </thead>

                //       <tbody>
                //         {publishedPosts.map(p => (
                //           <tr
                //             key={p.id}
                //             className="border-b last:border-b-0 hover:bg-gray-50 transition"
                //           >
                //             {/* Platform */}
                //             <td className="px-4 py-3 font-medium">
                //               {p.platform.toUpperCase()}
                //             </td>

                //             {/* Caption */}
                //             <td className="px-4 py-3 text-gray-700 max-w-md truncate">
                //               {p.caption || "-"}
                //             </td>

                //             {/* Status */}
                //             <td className="px-4 py-3">
                //               <span
                //                 className={`
                //       inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                //       ${p.status === "success" && "bg-green-100 text-green-800"}
                //       ${p.status === "failed" && "bg-red-100 text-red-800"}
                //     `}
                //               >
                //                 {p.status}
                //               </span>
                //             </td>

                //             {/* Created At */}
                //             <td className="px-4 py-3 text-gray-600">
                //               {new Date(p.created_at).toLocaleString()}
                //             </td>
                //           </tr>
                //         ))}
                //       </tbody>
                //     </table>
                //   </CardContent>
                // </Card>

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
                            <td className="px-4 py-3 font-medium">
                              {p.platform.toUpperCase()}
                            </td>
                            <td className="px-4 py-3 truncate max-w-md">
                              {p.caption}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs
                  ${p.status === "success"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"}
                `}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {new Date(p.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <TablePagination
                      page={pubPage}
                      totalPages={pubTotalPages}
                      pageSize={pubPageSize}
                      setPage={setPubPage}
                      setPageSize={setPubPageSize}
                    />
                  </CardContent>
                </Card>

              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
