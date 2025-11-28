# Social Media API Integration - Code Examples

## Quick Integration Examples

### Example 1: Add "Connect Accounts" Button to Main App

```jsx
// In your App.jsx
import { useState } from 'react';
import { SocialMediaAccounts } from './components/SocialMediaAccounts';
import { Settings } from 'lucide-react';

function App() {
  const [showAccounts, setShowAccounts] = useState(false);

  return (
    <div className="app">
      {/* Add this button to your header */}
      <button 
        className="settings-btn"
        onClick={() => setShowAccounts(true)}
      >
        <Settings size={20} />
        Social Media Accounts
      </button>

      {/* Modal for account management */}
      {showAccounts && (
        <SocialMediaAccounts onClose={() => setShowAccounts(false)} />
      )}

      {/* Rest of your app */}
    </div>
  );
}
```

---

### Example 2: Add "Post Now" Feature to Scheduled Posts

```jsx
// Enhance your post card with direct posting
import { useSocialMedia } from './hooks/useSocialMedia';
import { Send } from 'lucide-react';

function PostCard({ post }) {
  const { post: postToSocial, isPosting } = useSocialMedia();

  const handlePostNow = async () => {
    try {
      const { results, errors } = await postToSocial(
        post.platforms,
        post.content,
        {
          facebookPageId: 'YOUR_PAGE_ID', // Get from settings
          linkedinPersonUrn: 'YOUR_PERSON_URN' // Get from settings
        }
      );

      // Show success message
      const successPlatforms = Object.keys(results);
      alert(`Posted to: ${successPlatforms.join(', ')}`);

      // Show errors if any
      if (Object.keys(errors).length > 0) {
        console.error('Some posts failed:', errors);
      }
    } catch (err) {
      alert('Failed to post: ' + err.message);
    }
  };

  return (
    <div className="post-card">
      <p>{post.content}</p>
      <button onClick={handlePostNow} disabled={isPosting}>
        <Send size={16} />
        {isPosting ? 'Posting...' : 'Post Now'}
      </button>
    </div>
  );
}
```

---

### Example 3: Show Connected Accounts Status

```jsx
// Add connection status indicator
import { useSocialMedia } from './hooks/useSocialMedia';
import { CheckCircle, XCircle } from 'lucide-react';

function ConnectionStatus() {
  const { connectedAccounts, isConnected } = useSocialMedia();

  const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'];

  return (
    <div className="connection-status">
      <h3>Connected Accounts</h3>
      <div className="status-list">
        {platforms.map(platform => (
          <div key={platform} className="status-item">
            {isConnected(platform) ? (
              <CheckCircle size={16} color="green" />
            ) : (
              <XCircle size={16} color="gray" />
            )}
            <span>{platform}</span>
          </div>
        ))}
      </div>
      <p>{connectedAccounts.length} of {platforms.length} connected</p>
    </div>
  );
}
```

---

### Example 4: Automatic Scheduled Posting

```jsx
// Add automatic posting at scheduled time
import { useEffect } from 'react';
import { useSocialMedia } from './hooks/useSocialMedia';

function AutoPostScheduler({ posts }) {
  const { post } = useSocialMedia();

  useEffect(() => {
    const checkScheduledPosts = () => {
      const now = Date.now();
      
      posts.forEach(async (scheduledPost) => {
        const scheduledTime = new Date(`${scheduledPost.date} ${scheduledPost.time}`).getTime();
        
        // If post time is now (within 1 minute)
        if (Math.abs(scheduledTime - now) < 60000 && !scheduledPost.posted) {
          try {
            await post(scheduledPost.platforms, scheduledPost.content);
            
            // Mark as posted
            scheduledPost.posted = true;
            // Update your posts state here
            
            console.log('Auto-posted:', scheduledPost.id);
          } catch (err) {
            console.error('Auto-post failed:', err);
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkScheduledPosts, 60000);
    
    return () => clearInterval(interval);
  }, [posts, post]);

  return null; // This is a background component
}

// Use in your App:
<AutoPostScheduler posts={posts} />
```

---

### Example 5: Post with Image Upload

```jsx
// Post with image to Instagram and Facebook
import { useSocialMedia } from './hooks/useSocialMedia';

function ImagePostForm() {
  const { postToInstagram, postToFacebook } = useSocialMedia();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    // Upload to your server or cloud storage
    // Get public URL
    const imageUrl = 'https://your-server.com/uploads/image.jpg';
    setImage(imageUrl);
  };

  const handlePost = async () => {
    try {
      // Post to Instagram
      const igResult = await postToInstagram(
        'your_instagram_account_id',
        image,
        caption
      );

      // Post to Facebook
      const fbResult = await postToFacebook(
        'your_facebook_page_id',
        caption,
        image
      );

      alert('Posted successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <textarea 
        value={caption} 
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption..."
      />
      <button onClick={handlePost} disabled={!image}>
        Post to Instagram & Facebook
      </button>
    </div>
  );
}
```

---

### Example 6: Bulk Post to All Connected Platforms

```jsx
// Post to all connected platforms at once
import { useSocialMedia } from './hooks/useSocialMedia';

function BulkPoster() {
  const { connectedAccounts, post } = useSocialMedia();

  const postToAll = async (content) => {
    // Get all connected platform IDs
    const platforms = connectedAccounts.map(acc => acc.platform);

    if (platforms.length === 0) {
      alert('No accounts connected!');
      return;
    }

    const { results, errors } = await post(platforms, content);

    // Show results
    const successCount = Object.keys(results).length;
    const errorCount = Object.keys(errors).length;

    alert(`Posted to ${successCount} platforms. ${errorCount} failed.`);
  };

  return (
    <button onClick={() => postToAll('Hello from all my accounts!')}>
      Post to All Connected Accounts ({connectedAccounts.length})
    </button>
  );
}
```

---

### Example 7: Platform-Specific Settings

```jsx
// Store and manage platform-specific settings
import { useState, useEffect } from 'react';

function PlatformSettings() {
  const [settings, setSettings] = useState({
    facebookPageId: '',
    instagramAccountId: '',
    linkedinPersonUrn: ''
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('platform_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('platform_settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  return (
    <div className="platform-settings">
      <h3>Platform Settings</h3>
      
      <div>
        <label>Facebook Page ID</label>
        <input
          value={settings.facebookPageId}
          onChange={(e) => setSettings({...settings, facebookPageId: e.target.value})}
        />
      </div>

      <div>
        <label>Instagram Account ID</label>
        <input
          value={settings.instagramAccountId}
          onChange={(e) => setSettings({...settings, instagramAccountId: e.target.value})}
        />
      </div>

      <div>
        <label>LinkedIn Person URN</label>
        <input
          value={settings.linkedinPersonUrn}
          onChange={(e) => setSettings({...settings, linkedinPersonUrn: e.target.value})}
        />
      </div>

      <button onClick={saveSettings}>Save Settings</button>
    </div>
  );
}

// Use these settings when posting:
const settings = JSON.parse(localStorage.getItem('platform_settings') || '{}');
await post(platforms, content, {
  facebookPageId: settings.facebookPageId,
  instagramAccountId: settings.instagramAccountId,
  linkedinPersonUrn: settings.linkedinPersonUrn
});
```

---

### Example 8: Error Handling and Retry

```jsx
// Robust error handling with retry logic
import { useSocialMedia } from './hooks/useSocialMedia';

function RobustPoster() {
  const { post } = useSocialMedia();

  const postWithRetry = async (platforms, content, options, maxRetries = 3) => {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      try {
        const { results, errors } = await post(platforms, content, options);

        // Retry failed platforms
        const failedPlatforms = Object.keys(errors);
        
        if (failedPlatforms.length === 0) {
          return { success: true, results };
        }

        if (attempt === maxRetries - 1) {
          return { success: false, errors };
        }

        // Retry only failed platforms
        platforms = failedPlatforms;
        attempt++;
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        
      } catch (err) {
        lastError = err;
        attempt++;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  };

  return { postWithRetry };
}
```

---

### Example 9: Post Queue System

```jsx
// Queue system for bulk posting with rate limiting
import { useState } from 'react';
import { useSocialMedia } from './hooks/useSocialMedia';

function PostQueue() {
  const { post } = useSocialMedia();
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);

  const addToQueue = (platforms, content, options) => {
    setQueue([...queue, { platforms, content, options }]);
  };

  const processQueue = async () => {
    if (processing || queue.length === 0) return;

    setProcessing(true);

    for (const item of queue) {
      try {
        await post(item.platforms, item.content, item.options);
        
        // Remove from queue
        setQueue(prev => prev.filter(q => q !== item));
        
        // Wait 2 seconds between posts (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (err) {
        console.error('Queue item failed:', err);
        // Keep in queue or move to failed queue
      }
    }

    setProcessing(false);
  };

  return (
    <div>
      <h3>Post Queue ({queue.length})</h3>
      <button onClick={processQueue} disabled={processing}>
        {processing ? 'Processing...' : 'Process Queue'}
      </button>
    </div>
  );
}
```

---

### Example 10: Analytics Dashboard

```jsx
// Track posting success/failure rates
import { useState, useEffect } from 'react';

function PostingAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    successfulPosts: 0,
    failedPosts: 0,
    platformStats: {}
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('posting_analytics');
    if (saved) {
      setAnalytics(JSON.parse(saved));
    }
  }, []);

  const recordPost = (platform, success) => {
    setAnalytics(prev => {
      const updated = {
        ...prev,
        totalPosts: prev.totalPosts + 1,
        successfulPosts: success ? prev.successfulPosts + 1 : prev.successfulPosts,
        failedPosts: success ? prev.failedPosts : prev.failedPosts + 1,
        platformStats: {
          ...prev.platformStats,
          [platform]: {
            total: (prev.platformStats[platform]?.total || 0) + 1,
            success: (prev.platformStats[platform]?.success || 0) + (success ? 1 : 0)
          }
        }
      };

      localStorage.setItem('posting_analytics', JSON.stringify(updated));
      return updated;
    });
  };

  const successRate = analytics.totalPosts > 0 
    ? ((analytics.successfulPosts / analytics.totalPosts) * 100).toFixed(1)
    : 0;

  return (
    <div className="analytics-dashboard">
      <h3>Posting Analytics</h3>
      <div className="stats">
        <div>Total Posts: {analytics.totalPosts}</div>
        <div>Success Rate: {successRate}%</div>
        <div>Failed: {analytics.failedPosts}</div>
      </div>
      
      <h4>By Platform</h4>
      {Object.entries(analytics.platformStats).map(([platform, stats]) => (
        <div key={platform}>
          {platform}: {stats.success}/{stats.total} 
          ({((stats.success/stats.total) * 100).toFixed(0)}%)
        </div>
      ))}
    </div>
  );
}
```

---

## Complete Integration Checklist

- [ ] Install dependencies (already included)
- [ ] Create developer apps on each platform
- [ ] Configure OAuth redirect URIs
- [ ] Add API credentials to environment variables
- [ ] Import and add `SocialMediaAccounts` component
- [ ] Set up OAuth callback route
- [ ] Connect at least one account
- [ ] Test posting functionality
- [ ] Implement error handling
- [ ] Add platform-specific settings storage
- [ ] (Optional) Implement automatic scheduled posting
- [ ] (Optional) Add analytics tracking
- [ ] (Optional) Implement post queue system

---

**You're ready to integrate social media posting into your calendar!** 🎉
