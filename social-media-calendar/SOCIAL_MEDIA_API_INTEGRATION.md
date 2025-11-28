# Social Media API Integration Module

## Overview

This module provides complete social media API integration for Facebook, Instagram, Twitter/X, LinkedIn, and YouTube. It enables OAuth authentication, account management, and direct posting to multiple platforms.

---

## Features

✅ **OAuth 2.0 Authentication** - Secure authentication flow for all platforms  
✅ **Multi-Platform Support** - Facebook, Instagram, Twitter, LinkedIn, YouTube  
✅ **Account Management** - Connect/disconnect accounts with visual interface  
✅ **Direct Posting** - Post content directly to platforms  
✅ **Scheduled Publishing** - Schedule posts for future publication (where supported)  
✅ **Media Support** - Upload images and videos  
✅ **Token Management** - Automatic token storage and refresh  
✅ **React Hooks** - Easy-to-use React integration  
✅ **Error Handling** - Comprehensive error handling and reporting  

---

## Files Included

### Core Service
- **`src/services/socialMediaAPI.js`** - Main API service class with all platform integrations

### React Integration
- **`src/hooks/useSocialMedia.js`** - React hook for easy component integration
- **`src/components/SocialMediaAccounts.jsx`** - Account management UI component
- **`src/components/SocialMediaAccounts.css`** - Styling for account management
- **`src/components/OAuthCallback.jsx`** - OAuth callback handler
- **`src/components/OAuthCallback.css`** - Styling for OAuth callback

---

## Setup Instructions

### 1. Prerequisites

You need to create developer apps on each platform you want to integrate:

#### Facebook & Instagram
1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Create a new app
3. Add "Facebook Login" and "Instagram Basic Display" products
4. Configure OAuth redirect URIs
5. Get your App ID (Client ID) and App Secret (Client Secret)

#### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Enable OAuth 2.0
4. Configure callback URLs
5. Get your Client ID and Client Secret

#### LinkedIn
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add "Sign In with LinkedIn" product
4. Configure redirect URLs
5. Get your Client ID and Client Secret

#### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Configure authorized redirect URIs
6. Get your Client ID and Client Secret

### 2. Installation

The module is already included in your React project. No additional npm packages are required beyond what's already in `package.json`.

### 3. Configuration

#### Option A: Environment Variables (Recommended for Production)

Create a `.env` file in your project root:

```env
VITE_FACEBOOK_CLIENT_ID=your_facebook_app_id
VITE_FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
VITE_TWITTER_CLIENT_ID=your_twitter_client_id
VITE_TWITTER_CLIENT_SECRET=your_twitter_client_secret
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
VITE_YOUTUBE_CLIENT_ID=your_youtube_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback
```

#### Option B: UI Configuration (For Testing)

Use the built-in configuration UI in the Social Media Accounts component to enter credentials.

---

## Usage Guide

### Basic Integration in Your App

#### 1. Add Account Management Button

```jsx
import { useState } from 'react';
import { SocialMediaAccounts } from './components/SocialMediaAccounts';

function App() {
  const [showAccounts, setShowAccounts] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAccounts(true)}>
        Manage Social Media Accounts
      </button>

      {showAccounts && (
        <SocialMediaAccounts onClose={() => setShowAccounts(false)} />
      )}
    </div>
  );
}
```

#### 2. Use the Hook in Your Components

```jsx
import { useSocialMedia } from './hooks/useSocialMedia';

function PostScheduler() {
  const { 
    connectedAccounts, 
    isPosting, 
    post, 
    error 
  } = useSocialMedia();

  const handlePost = async () => {
    const platforms = ['facebook', 'twitter', 'linkedin'];
    const content = 'Hello from my social media calendar!';
    
    const { results, errors } = await post(platforms, content, {
      facebookPageId: 'your_page_id',
      linkedinPersonUrn: 'urn:li:person:your_id'
    });

    console.log('Posted successfully:', results);
    console.log('Errors:', errors);
  };

  return (
    <div>
      <h3>Connected: {connectedAccounts.length} accounts</h3>
      <button onClick={handlePost} disabled={isPosting}>
        {isPosting ? 'Posting...' : 'Post Now'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

#### 3. Set Up OAuth Callback Route

If using React Router:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OAuthCallback } from './components/OAuthCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## API Reference

### `useSocialMedia()` Hook

Returns an object with the following properties and methods:

#### State
- **`connectedAccounts`** - Array of connected account objects
- **`isPosting`** - Boolean indicating if a post is in progress
- **`error`** - Error message or object if an error occurred

#### Methods

##### `connect(platform, clientId, redirectUri)`
Initiates OAuth flow for a platform.

```javascript
connect('facebook', 'your_client_id', 'http://localhost:5173/oauth/callback');
```

##### `disconnect(platform)`
Disconnects a platform account.

```javascript
disconnect('twitter');
```

##### `isConnected(platform)`
Check if a platform is connected.

```javascript
const connected = isConnected('facebook'); // true or false
```

##### `post(platforms, content, options)`
Post to multiple platforms at once.

```javascript
const { results, errors } = await post(
  ['facebook', 'twitter', 'linkedin'],
  'My post content',
  {
    facebookPageId: '123456789',
    linkedinPersonUrn: 'urn:li:person:abc123',
    mediaUrl: 'https://example.com/image.jpg'
  }
);
```

##### `postToFacebook(pageId, content, mediaUrl, scheduledTime)`
Post specifically to Facebook.

```javascript
const result = await postToFacebook(
  'your_page_id',
  'Post content',
  'https://example.com/image.jpg',
  Date.now() + 3600000 // 1 hour from now
);
```

##### `postToInstagram(accountId, imageUrl, caption, scheduledTime)`
Post to Instagram (requires image).

```javascript
const result = await postToInstagram(
  'your_instagram_account_id',
  'https://example.com/image.jpg',
  'Caption text #hashtags'
);
```

##### `postToTwitter(content, mediaIds)`
Post to Twitter/X.

```javascript
const result = await postToTwitter(
  'Tweet content',
  ['media_id_1', 'media_id_2']
);
```

##### `postToLinkedIn(personUrn, content, mediaUrl)`
Post to LinkedIn.

```javascript
const result = await postToLinkedIn(
  'urn:li:person:your_id',
  'LinkedIn post content',
  'https://example.com/article'
);
```

##### `postToYouTube(title, description, videoFile, tags)`
Upload video to YouTube.

```javascript
const result = await postToYouTube(
  'Video Title',
  'Video description',
  videoFileObject,
  ['tag1', 'tag2']
);
```

---

## Platform-Specific Notes

### Facebook
- Requires Page ID for posting
- Supports scheduled posts
- Can include links and media
- Rate limits apply

### Instagram
- **Requires image URL** (cannot post text-only)
- Must use Instagram Business Account
- Connected via Facebook Graph API
- Image must be publicly accessible

### Twitter/X
- 280 character limit
- Media must be uploaded separately
- Rate limits: 300 tweets per 3 hours

### LinkedIn
- Requires Person URN
- Supports articles and media
- Good for professional content

### YouTube
- Video uploads only
- Requires video file upload
- Processing time varies
- Size limits apply

---

## Security Considerations

### ⚠️ Important Security Notes

1. **Never expose Client Secrets in frontend code**
   - Use environment variables
   - Implement backend proxy for token exchange
   - Store secrets server-side only

2. **Token Storage**
   - Currently uses localStorage (acceptable for development)
   - For production, use secure backend storage
   - Implement token encryption

3. **OAuth State Parameter**
   - Always validate state parameter
   - Prevents CSRF attacks
   - Automatically handled by the module

4. **HTTPS Required**
   - All OAuth flows require HTTPS in production
   - Local development can use HTTP

### Recommended Production Architecture

```
User Browser          Your Backend          Social Media APIs
    |                      |                        |
    |-- OAuth Request ---->|                        |
    |                      |---- Auth Request ----->|
    |                      |<--- Auth Code ---------|
    |                      |                        |
    |                      |---- Token Exchange --->|
    |                      |<--- Access Token ------|
    |                      |                        |
    |<-- Session Token ----|                        |
    |                      |                        |
    |-- Post Request ----->|                        |
    |                      |---- API Call --------->|
    |                      |<--- Response ----------|
    |<-- Success ----------|                        |
```

---

## Error Handling

The module provides comprehensive error handling:

```javascript
const { post, error } = useSocialMedia();

try {
  const { results, errors } = await post(platforms, content, options);
  
  // Check individual platform errors
  if (errors.facebook) {
    console.error('Facebook error:', errors.facebook);
  }
  
  // Check successful posts
  if (results.twitter) {
    console.log('Twitter post ID:', results.twitter.id);
  }
  
} catch (err) {
  console.error('General error:', err.message);
}
```

---

## Testing

### Test OAuth Flow

1. Start your dev server: `pnpm run dev`
2. Open the Social Media Accounts component
3. Configure API credentials
4. Click "Connect" on a platform
5. Complete OAuth flow
6. Verify account appears as connected

### Test Posting

```javascript
// Test post to connected platforms
const testPost = async () => {
  const { results, errors } = await post(
    ['facebook', 'twitter'],
    'Test post from my calendar app!',
    {
      facebookPageId: 'your_page_id'
    }
  );
  
  console.log('Results:', results);
  console.log('Errors:', errors);
};
```

---

## Troubleshooting

### Common Issues

#### "Invalid OAuth redirect URI"
- Ensure redirect URI matches exactly in platform settings
- Include protocol (http:// or https://)
- No trailing slashes

#### "Token expired"
- Implement token refresh logic
- Re-authenticate the account

#### "Permission denied"
- Check app permissions/scopes
- User may need to re-authorize

#### "Rate limit exceeded"
- Implement rate limiting in your app
- Add delays between posts
- Cache API responses

### Debug Mode

Enable debug logging:

```javascript
localStorage.setItem('debug_social_media_api', 'true');
```

---

## Extending the Module

### Add a New Platform

1. Add platform config to `API_CONFIG` in `socialMediaAPI.js`
2. Implement platform-specific posting method
3. Add platform to `PLATFORMS` array in `SocialMediaAccounts.jsx`
4. Update documentation

### Custom Post Types

```javascript
// Example: Add carousel post for Instagram
async postInstagramCarousel(accountId, images, caption) {
  // Implementation here
}
```

---

## Rate Limits

| Platform | Limit | Window |
|----------|-------|--------|
| Facebook | 200 calls | 1 hour |
| Instagram | 200 calls | 1 hour |
| Twitter | 300 tweets | 3 hours |
| LinkedIn | 100 posts | 24 hours |
| YouTube | 10,000 units | 24 hours |

---

## Best Practices

1. **Always handle errors gracefully**
2. **Implement retry logic for failed posts**
3. **Cache account information**
4. **Use webhooks for real-time updates**
5. **Implement queue system for bulk posting**
6. **Monitor rate limits**
7. **Log all API interactions**
8. **Test with sandbox/test accounts first**

---

## Support & Resources

### Official Documentation
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)
- [YouTube Data API](https://developers.google.com/youtube/v3)

### Community
- Stack Overflow tags: `facebook-graph-api`, `twitter-api`, `linkedin-api`
- Platform-specific developer forums

---

## License

This module is provided as part of the Social Media Calendar project.

## Version

**1.0.0** - Initial release with full OAuth and posting support for 5 platforms

---

**Ready to connect your social media accounts and start posting!** 🚀
