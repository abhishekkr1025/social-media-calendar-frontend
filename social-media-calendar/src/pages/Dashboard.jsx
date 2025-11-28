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


  const [newPost, setNewPost] = useState({
    content: '',
    date: '',
    time: '',
    platforms: []
  })

  // ✅ Load from localStorage once when app starts
  // useEffect(() => {
  //   try {
  //     const savedClients = JSON.parse(localStorage.getItem('smm-clients')) || [];
  //     const savedPosts = JSON.parse(localStorage.getItem('smm-posts')) || [];
  //     setClients(savedClients);
  //     setPosts(savedPosts);
  //   } catch (error) {
  //     console.error("Error loading from localStorage:", error);
  //   }
  // }, []);

  // Save data to localStorage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem('smm-clients', JSON.stringify(clients))
  // }, [clients])

  // useEffect(() => {
  //   localStorage.setItem('smm-posts', JSON.stringify(posts))
  // }, [posts])


  //   useEffect(() => {
  //   try {
  //     const storedClients = JSON.parse(localStorage.getItem('clients')) || [];
  //     const storedPosts = JSON.parse(localStorage.getItem('posts')) || [];
  //     setClients(storedClients);
  //     setPosts(storedPosts);
  //   } catch (e) {
  //     console.error('Failed to load localStorage data:', e);
  //   }
  // }, []);

  // Store tokens securely (consider using environment variables or secure storage)
  let instagramToken = "EAAHaB1oOYrwBP2WZC6XBC5sYtY80JCruOhvFHjIoZBPlLPOEMoaewIj2TVsXEi3jGCp8YAkzLkIMkWuMDBFCe7Ob62WKOjof8UGoQM6HwuR98lnU5Lqer3rQVxe7jZCXZCyrbVGZBuGrwQudV63ZAlp8BlgEJ9HiYyL4SGehRrwSgNIk1tLRbqZCpkUXy33Chqyx1NZBvWd696jZCH3AOvUQxvDrbMG6ZBYXIpGkrtHvko67PfZAVjBNGQPpld8ZB1GMYDFtCT5LTrzAaichtomvOw2f8ruj";
  let tokenExpiry = null;

  // Run this in your browser console or add a button for it
  // initializeInstagramToken("EAAHaB1oOYrwBPZCFLgu0hWJeKKPklSfdRzK0JJXMV6R7gZAYQZAFEx60Siv23s03lYB7j3AIOHEIxDSGH5KvJfPMS2YtQ5BNsZAgKaRYPWv2ZAphlxXDkheyDXw2ZCD13ZCf6IqURSxdE0trXkFAgiXMPrzAd1W8hWGTDqoT44047SuZA40JdiNBgyBo3POXN1Etqs8lxB4trE0IujLTbtF2G0WQIhDEw920tSHeb0bVCCZBpBMb55UJ2eqwW6ebWtuhqpNnX5elWeBVho8BcqbhlJM2H");

  const fetchClients = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  // const fetchPosts = async () => {

  //   try {

  //     const res = await fetch("http://localhost:5000/api/posts");
  //     if (!res.ok) throw new Error("Failed to fetch posts");

  //     const data = await res.json();
  //     console.log("Fetched posts:", data);

  //     setPosts(data);

  //   } catch (err) {
  //     console.error("Error fetching posts:", err);
  //   }

  // }




  const handleAddClient = async () => {
    navigate("/onboard");
  }

  const handleConnectButton = async () => {
    navigate("/connect-platform");
  }

  // // Function to refresh Instagram token
  // const refreshInstagramToken = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/api/instagram/refresh-token", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         token: instagramToken
  //       })
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to refresh token");
  //     }

  //     const result = await response.json();
  //     instagramToken = result.access_token;
  //     tokenExpiry = Date.now() + (result.expires_in * 1000); // Convert to milliseconds

  //     console.log("✅ Token refreshed successfully");
  //     return instagramToken;
  //   } catch (error) {
  //     console.error("❌ Token refresh failed:", error);
  //     throw error;
  //   }
  // };

  // // Function to get valid token (refreshes if expired)
  // const getValidInstagramToken = async () => {
  //   // Check if token is expired or about to expire (within 5 minutes)
  //   const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  //   if (!tokenExpiry || Date.now() >= (tokenExpiry - bufferTime)) {
  //     console.log("🔄 Token expired or missing, refreshing...");
  //     return await refreshInstagramToken();
  //   }

  //   return instagramToken;
  // };



  // Load posts from MySQL
  // useEffect(() => {
  //   fetch("http://localhost:5000/api/posts")
  //     .then(res => res.json())
  //     .then(setPosts);
  // }, []);

  // Load all data
  useEffect(() => {
    fetchClients();
    loadAllPosts();

    // Auto-refresh queued & published posts every 10 seconds
    const interval = setInterval(() => {
      loadQueued();
      loadPublished();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // async function loadClients() {
  //    try {
  //     const res = await fetch("http://localhost:5000/api/clients");
  //     const data = await res.json();
  //     setClients(data);
  //   } catch (err) {
  //     console.error("Failed to fetch clients:", err);
  //   }
  // }

  async function loadAllPosts() {
    const res = await fetch("http://localhost:5000/api/posts/all");
    const data = await res.json();

    if (data.success) {
      const formatted = data.posts.map(p => {
        const dt = new Date(p.scheduled_at);
        return {
          ...p,
          date: dt.toISOString().split("T")[0],
          time: dt.toISOString().split("T")[1].slice(0, 5),
          clientName: clients.find(c => c.id === p.clientId)?.name || "Client",
        };
      });

      setPosts(formatted);
      setQueuedPosts(data.queued_posts || []);
    }
  }



  async function loadQueued() {
    const res = await fetch("http://localhost:5000/api/queued-posts");
    const data = await res.json();
    setQueuedPosts(data);
  }

  async function loadPublished() {
    const res = await fetch("http://localhost:5000/api/published-posts");
    const data = await res.json();
    setPublishedPosts(data);
  }




  // async function loadClients() {
  //   const res = await fetch("http://localhost:5000/api/clients");
  //   const data = await res.json();
  //   setClients(data.clients || []);
  // }





  const platformIcons = {
    facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    wordpress: <SiWordpress className='w-4 h-4'/>
  }

  const platformColors = {
    facebook: 'bg-blue-500',
    instagram: 'bg-pink-500',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700',
    youtube: 'bg-red-500',
    wordpress: 'bg-blue-500'
    
  }

  // const addClient = () => {
  //   if (newClient.trim()) {
  //     setClients([...clients, { id: Date.now(), name: newClient }])
  //     setNewClient('')
  //     setShowAddClient(false)
  //   }
  // }

  const addClient = async () => {
    if (!newClient.trim()) return alert("Please enter a client name");

    try {
      const response = await fetch("http://localhost:5000/api/clients", {
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



  // const deleteClient = (clientId) => {
  //   setClients(clients.filter(c => c.id !== clientId))
  //   setPosts(posts.filter(p => p.clientId !== clientId))
  //   if (selectedClient?.id === clientId) {
  //     setSelectedClient(null)
  //   }
  // }

  // const addPost = () => {
  //   if (selectedClient && newPost.content && newPost.date && newPost.time && newPost.platforms.length > 0) {
  //     setPosts([...posts, {
  //       id: Date.now(),
  //       clientId: selectedClient.id,
  //       clientName: selectedClient.name,
  //       ...newPost
  //     }])
  //     setNewPost({ content: '', date: '', time: '', platforms: [] })
  //     setShowAddPost(false)
  //   }
  // }


  // // After callback, use token for API calls
  // const postToLinkedIn = async (text, imageUrl) => {
  //   const token = getStoredToken(); // Get from your storage
  //   const profile = await fetch(`/api/linkedin/profile?token=${token}`);
  //   const { personUrn } = await profile.json();

  //   await fetch('/api/linkedin/post', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ text, imageUrl, token, personUrn })
  //   });
  // };



  const addPost = async () => {
    console.log("function called");
    var isTrue = selectedClient &&
      newPost.content &&
      newPost.date &&
      newPost.time &&
      newPost.platforms.length > 0;

    console.log("Validation:", isTrue);

    if (isTrue) {
      try {
        const imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdPJYVL1V2HvDgFjqF5xm0l5WuZCnS5QrSw&s";

        const scheduled_at = `${newPost.date} ${newPost.time}:00`;


        const formData = new FormData();
        formData.append("clientId", selectedClient.id);
        formData.append("title", newPost.content);
        formData.append("caption", newPost.content);
        formData.append("scheduled_at", scheduled_at);
        formData.append("platforms", JSON.stringify(newPost.platforms));
        formData.append("file", newPost.file);   // ⬅ REAL FILE

        const response = await fetch("http://localhost:5000/api/posts", {
          method: "POST",
          body: formData
        });



        // // 1️⃣ Save to database
        // const response = await fetch("http://localhost:5000/api/posts", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     clientId: selectedClient.id,
        //     title: newPost.content,
        //     caption: newPost.content,
        //     imageUrl,
        //     scheduled_at,
        //     platforms: newPost.platforms,
        //   }),
        // });

        if (!response.ok) {
          throw new Error("Failed to save post");
        }

        const result = await response.json();
        console.log("✅ Post saved:", result);

        // 2️⃣ Fetch updated posts from database
        const postsRes = await fetch("http://localhost:5000/api/posts/all");
        const updatedPosts = await postsRes.json();

        if (Array.isArray(updatedPosts)) {
          setPosts(updatedPosts);
          console.log("✅ Posts refreshed:", updatedPosts);
        }

        // 3️⃣ Reset form
        setNewPost({ content: '', date: '', time: '', platforms: [] });
        setShowAddPost(false);

        // // 4️⃣ Try posting to Instagram if selected
        // if (newPost.platforms.includes('instagram')) {
        //   try {

        //     // Get valid token (will refresh if expired)
        //     const validToken = await getValidInstagramToken();
        //     const accountId = "17841407225233726";
        //     const caption = newPost.content;
        //     const scheduledTime = `${newPost.date}T${newPost.time}`;

        //     const instagramResponse = await fetch("http://localhost:5000/api/instagram/post", {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json" },
        //       body: JSON.stringify({
        //         accountId: accountId,
        //         imageUrl: imageUrl,
        //         caption: caption,
        //         token: "EAAHaB1oOYrwBP72ZAeEtrn3CsZA8gRVHOZBdZCVbGZCkyTZBf8s82qzswkWBPoVZA2Ku1kBlXkHJJgexhhMSDndqfc37XwkjnXiE9souC9LxfldXQE4mxm0ZALPsVyiFxvig3qyuXioaOTZA7IlSmYmRrFyusY15YZBXoovXpKAZA4EnaSzQzxsEcWgSsBIrykT0U6H"
        //       })
        //     });

        //     const instagramResult = await instagramResponse.json();
        //     console.log("✅ Instagram post successful:", instagramResult);
        //   } catch (error) {
        //     console.error("❌ Failed to post to Instagram:", error);
        //     alert("Post saved but failed to publish on Instagram. Check console for details.");
        //   }
        // }


        // 🟣 4️⃣ Try posting to Instagram if selected
        if (newPost.platforms.includes('instagram')) {
          try {
            console.log("📸 Posting to Instagram for client:", selectedClient.id);

            // 1️⃣ Fetch client's connected Instagram account
            // const accountRes = await fetch(`http://localhost:5000/api/clients/${selectedClient.id}/instagram/account`);
            // if (!accountRes.ok) {
            //   throw new Error("No connected Instagram account for this client");
            // }
            // const accountData = await accountRes.json();

            // const { instagram_account_id, token_expires_at } = accountData;
            const caption = newPost.content;
            const imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROdPJYVL1V2HvDgFjqF5xm0l5WuZCnS5QrSw&s";

            // 2️⃣ Send post request to backend
            const instagramResponse = await fetch(`http://localhost:5000/api/clients/${selectedClient.id}/instagram/post`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                caption,
                image_url: imageUrl,
                long_lived_token: "EAAHaB1oOYrwBP72ZAeEtrn3CsZA8gRVHOZBdZCVbGZCkyTZBf8s82qzswkWBPoVZA2Ku1kBlXkHJJgexhhMSDndqfc37XwkjnXiE9souC9LxfldXQE4mxm0ZALPsVyiFxvig3qyuXioaOTZA7IlSmYmRrFyusY15YZBXoovXpKAZA4EnaSzQzxsEcWgSsBIrykT0U6H", // only needed once
              }),
            });

            const instagramResult = await instagramResponse.json();

            if (!instagramResponse.ok) {
              throw new Error(instagramResult.error || "Failed to publish on Instagram");
            }

            console.log("✅ Instagram post successful:", instagramResult);
            alert("✅ Post published successfully to Instagram!");

          } catch (error) {
            console.error("❌ Failed to post to Instagram:", error);
            alert("Post saved but failed to publish on Instagram. Check console for details.");
          }
        }


        // 4️⃣ Validate LinkedIn connection (but DO NOT publish immediately)
        if (newPost.platforms.includes("linkedin")) {
          try {
            console.log("🔵 Checking LinkedIn connection for client:", selectedClient.id);

            const lnRes = await fetch(
              `http://localhost:5000/api/clients/${selectedClient.id}/linkedin/account`
            );

            if (lnRes.status === 404) throw new Error("LinkedIn not connected");
            if (!lnRes.ok) throw new Error("Failed to verify LinkedIn connection");

            const lnAccount = await lnRes.json();
            console.log("✔ LinkedIn account found:", lnAccount);

            // DO NOT PUBLISH HERE!
            // Worker will publish when scheduled_at <= NOW()

          } catch (error) {
            console.error("❌ LinkedIn check failed:", error);
            alert("Post saved but LinkedIn is NOT connected for this client.");
          }
        }




        if (newPost.platforms.includes('twitter')) {
          try {
            console.log("🐦 Fetching Twitter account for client:", selectedClient.id);

            // 1️⃣ Get Twitter OAuth credentials from database
            const twRes = await fetch(
              `http://localhost:5000/api/clients/${selectedClient.id}/twitter/account`
            );

            if (!twRes.ok) throw new Error("Twitter not connected for this client");

            const twAccount = await twRes.json();

            console.log("🐦 Twitter credentials:", twAccount);

            // // 2️⃣ Publish through backend /publish/twitter
            // const publishRes = await fetch("http://localhost:5000/api/publish/twitter", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({
            //     oauth_token: twAccount.oauth_token,
            //     oauth_token_secret: twAccount.oauth_token_secret,
            //     status: newPost.content,
            //     media_url: imageUrl
            //   })
            // });

            // const publishResult = await publishRes.json();
            // console.log("🐦 Twitter publish result:", publishResult);

          } catch (err) {
            console.error("❌ Twitter publish failed:", err);
          }
        }
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

      const response = await fetch(`http://localhost:5000/api/deletePosts/${postId}`, {
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


  // 1. First, connect Instagram account for client with ID 9
  const connectInstagram = async () => {
    const longLivedToken = 'EAAHaB1oOYrwBP72ZAeEtrn3CsZA8gRVHOZBdZCVbGZCkyTZBf8s82qzswkWBPoVZA2Ku1kBlXkHJJgexhhMSDndqfc37XwkjnXiE9souC9LxfldXQE4mxm0ZALPsVyiFxvig3qyuXioaOTZA7IlSmYmRrFyusY15YZBXoovXpKAZA4EnaSzQzxsEcWgSsBIrykT0U6H';

    const response = await fetch('/api/clients/9/instagram/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ long_lived_token: longLivedToken })
    });

    const data = await response.json();
    console.log('Connected:', data);
  };

  // 2. Post to client's Instagram
  const postToInstagram = async () => {
    const response = await fetch('/api/clients/9/instagram/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: 'https://example.com/your-image.jpg',
        caption: 'Check out this amazing post! #instagram #socialmedia'
      })
    });

    const data = await response.json();
    console.log('Posted:', data);
  };

  // 3. Get client's Instagram posts
  const getPosts = async () => {
    const response = await fetch('/api/clients/9/instagram/posts?limit=10');
    const data = await response.json();
    console.log('Posts:', data);
  };


  const deleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting client:", clientId);
      const url = `http://localhost:5000/api/deleteClient/${clientId}`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
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
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardHeader>
                <Button
                  variant="ghost"
                  className="w-full gap-2 hover:bg-blue-50"
                  onClick={() => setShowAddPost(!showAddPost)}
                  disabled={clients.length === 0}
                >
                  <Plus className="w-5 h-5" />
                  Schedule New Post
                </Button>
              </CardHeader>

              {showAddPost && (
                <CardContent className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* Client Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Client</label>
                    <div className="flex gap-2 flex-wrap">
                      {clients.map(client => (
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

                  {/* Post Content */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Post Content</label>
                    <Textarea
                      placeholder="What would you like to post?"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Image/Video</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setNewPost({ ...newPost, file: e.target.files[0] })}
                    />

                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <Input
                        type="date"
                        value={newPost.date}
                        onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                        min="2020-01-01"
                        max="2099-12-31"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time</label>
                      <Input
                        type="time"
                        value={newPost.time}
                        onChange={(e) => setNewPost({ ...newPost, time: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Platforms</label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(platformIcons).map(platform => (
                        <Button
                          key={platform}
                          size="sm"
                          variant={newPost.platforms.includes(platform) ? "default" : "outline"}
                          onClick={() => togglePlatform(platform)}
                          className="gap-2 capitalize"
                        >
                          {platformIcons[platform]}
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addPost} className="flex-1">
                      Add Post
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddPost(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

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
                    <p className="text-sm text-gray-400 mt-1">
                      {clients.length === 0
                        ? "Add a client first, then schedule your first post"
                        : "Click 'Schedule New Post' to get started"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedDates.map(date => {
                    const postsOnDate = getPostsByDate()[date].filter(post =>
                      !selectedClient || post.clientId === selectedClient.id
                    )

                    if (postsOnDate.length === 0) return null

                    return (
                      <div key={date}>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="text-sm">
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Badge>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        <div className="space-y-3">
                          {postsOnDate
                            .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                            .map(post => (
                              <Card key={post.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">
                                          {post.clientName}
                                        </Badge>
                                        <span className="text-sm font-medium text-gray-600">
                                          {post.time}
                                        </span>
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
                                      </div>
                                      <p className="text-gray-700 whitespace-pre-wrap">
                                        {post.content}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deletePost(post.id)}
                                      className="hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ================================
    🚀 QUEUED POSTS (Worker Pending)
   ================================ */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-3">Queued Posts (Waiting for Worker)</h2>

              {queuedPosts.length === 0 ? (
                <p className="text-gray-500">No queued posts found.</p>
              ) : (
                <div className="space-y-3">
                  {queuedPosts.map(q => (
                    <Card key={q.id}>
                      <CardContent className="p-4 flex justify-between">
                        <div>
                          <p className="font-medium">{q.platform.toUpperCase()}</p>
                          <p className="text-gray-600">{q.caption}</p>
                          <p className="text-sm text-gray-500">
                            Scheduled: {q.scheduled_at}
                          </p>
                          <p className="text-sm text-gray-400">
                            Status: {q.status}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* ================================
    🟢 PUBLISHED POSTS HISTORY
   ================================ */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-3">Published Posts (History)</h2>

              {publishedPosts.length === 0 ? (
                <p className="text-gray-500">No published posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {publishedPosts.map(p => (
                    <Card key={p.id}>
                      <CardContent className="p-4 flex justify-between">
                        <div>
                          <p className="font-medium">{p.platform.toUpperCase()}</p>
                          <p className="text-gray-600">{p.caption}</p>
                          <p className="text-sm text-gray-500">
                            Result: {p.status}
                          </p>
                          <p className="text-sm text-gray-400">
                            Posted: {p.created_at}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
