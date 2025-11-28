/**
 * Social Media API Integration Module
 * 
 * Supports: Facebook, Instagram, Twitter/X, LinkedIn, YouTube
 * 
 * Features:
 * - OAuth authentication
 * - Post scheduling
 * - Direct posting
 * - Media upload
 * - Account management
 */

// API Configuration
const API_CONFIG = {
  facebook: {
    apiVersion: 'v18.0',
    baseUrl: 'https://graph.facebook.com',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_manage_metadata'],
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
  },
  instagram: {
    apiVersion: 'v24.0',
    baseUrl: 'https://graph.facebook.com',
    scopes: ['instagram_basic', 'instagram_content_publish'],
    authUrl: 'https://api.instagram.com/oauth/authorize'
  },
  twitter: {
    apiVersion: '2',
    baseUrl: 'https://api.twitter.com/2',
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
    authUrl: 'https://twitter.com/i/oauth2/authorize'
  },
  linkedin: {
    apiVersion: '202401',
    baseUrl: 'https://api.linkedin.com/v2',
    scopes: ['w_member_social', 'r_liteprofile'],
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
  },
  youtube: {
    apiVersion: 'v3',
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    scopes: ['https://www.googleapis.com/auth/youtube.upload'],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  }
};

/**
 * Social Media API Manager
 */
class SocialMediaAPI {
  constructor() {
    this.tokens = this.loadTokens();
    this.accounts = this.loadAccounts();
  }

  /**
   * Load stored authentication tokens
   */
  loadTokens() {
    const stored = localStorage.getItem('social_media_tokens');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save authentication tokens
   */
  saveTokens() {
    localStorage.setItem('social_media_tokens', JSON.stringify(this.tokens));
  }

  /**
   * Load connected accounts
   */
  loadAccounts() {
    const stored = localStorage.getItem('social_media_accounts');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save connected accounts
   */
  saveAccounts() {
    localStorage.setItem('social_media_accounts', JSON.stringify(this.accounts));
  }

  /**
   * Initialize OAuth flow for a platform
   * @param {string} platform - Platform name (facebook, instagram, twitter, linkedin, youtube)
   * @param {string} clientId - Your app's client ID
   * @param {string} redirectUri - OAuth redirect URI
   */
  initiateAuth(platform, clientId, redirectUri) {
    const config = API_CONFIG[platform];
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const state = this.generateState();
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_platform', platform);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state: state
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback
   * @param {string} code - Authorization code from OAuth callback
   * @param {string} state - State parameter for verification
   * @param {string} clientId - Your app's client ID
   * @param {string} clientSecret - Your app's client secret
   * @param {string} redirectUri - OAuth redirect URI
   */
  async handleAuthCallback(code, state, clientId, clientSecret, redirectUri) {
    const savedState = localStorage.getItem('oauth_state');
    const platform = localStorage.getItem('oauth_platform');

    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    const tokenData = await this.exchangeCodeForToken(
      platform,
      code,
      clientId,
      clientSecret,
      redirectUri
    );

    this.tokens[platform] = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    };

    this.saveTokens();

    // Fetch account info
    const accountInfo = await this.fetchAccountInfo(platform);
    this.accounts[platform] = accountInfo;
    this.saveAccounts();

    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_platform');

    return accountInfo;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(platform, code, clientId, clientSecret, redirectUri) {
    const tokenUrls = {
      facebook: 'https://graph.facebook.com/v18.0/oauth/access_token',
      instagram: 'https://api.instagram.com/oauth/access_token',
      twitter: 'https://api.twitter.com/2/oauth2/token',
      linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
      youtube: 'https://oauth2.googleapis.com/token'
    };

    const response = await fetch(tokenUrls[platform], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch account information for a platform
   */
  async fetchAccountInfo(platform) {
    const token = this.tokens[platform]?.accessToken;
    if (!token) {
      throw new Error(`No token found for ${platform}`);
    }

    const endpoints = {
      facebook: '/me?fields=id,name,picture',
      instagram: '/me?fields=id,username,account_type',
      twitter: '/users/me',
      linkedin: '/me',
      youtube: '/channels?part=snippet&mine=true'
    };

    const config = API_CONFIG[platform];
    const url = `${config.baseUrl}${endpoints[platform]}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch account info: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Check if a platform is connected
   */
  isConnected(platform) {
    return !!this.tokens[platform] && !!this.accounts[platform];
  }

  /**
   * Disconnect a platform
   */
  disconnect(platform) {
    delete this.tokens[platform];
    delete this.accounts[platform];
    this.saveTokens();
    this.saveAccounts();
  }

  /**
   * Post to Facebook
   */
  async postToFacebook(pageId, content, mediaUrl = null, scheduledTime = null) {
    const token = this.tokens.facebook?.accessToken;
    if (!token) {
      throw new Error('Facebook not connected');
    }

    const endpoint = `/${pageId}/feed`;
    const url = `${API_CONFIG.facebook.baseUrl}${endpoint}`;

    const params = {
      message: content,
      access_token: token
    };

    if (mediaUrl) {
      params.link = mediaUrl;
    }

    if (scheduledTime) {
      params.published = false;
      params.scheduled_publish_time = Math.floor(scheduledTime / 1000);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook post failed: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Post to Instagram
   */
  async postToInstagram(accountId, imageUrl, caption, scheduledTime = null) {
    const token = 'EAAHaB1oOYrwBPZCY8C8WDKS6pZCbjSFwgI7Nu8BHSNDUHTtUljxplk6fZBKMQflPzePUtEIZCOBXvfe9ot0RkA62kJKuRLKbXdMznxd5Xtc09MHZByNZAMYmWWi03E8V2hGSJpsQHmfnbdmfMWwihxouxWKndoCKY52YQxILgJbAo71hqsnEB7aY1k109jvc7liZBRUZB56m0TCDWjONmiHUHtBZCZAgdGrEoqf49pSK8ZD';

    console.log(token)
    if (!token) {
      throw new Error('Instagram not connected');
    }

    // Step 1: Create media container
    // const containerUrl = `${API_CONFIG.instagram.baseUrl}/${API_CONFIG.instagram.apiVersion}/${accountId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${token}`

    const containerUrl = "http://localhost:5000/api/instagram/post";
    
    const containerParams = {
      image_url: imageUrl,
      caption: caption,
      access_token: token
    };

    const containerResponse = await fetch(containerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // body: JSON.stringify(containerParams)
    });

    if (!containerResponse.ok) {
      throw new Error(`Instagram container creation failed: ${containerResponse.statusText}`);
    }

    const { id: containerId } = await containerResponse.json();

    // Step 2: Publish or schedule
    const publishUrl = `${API_CONFIG.instagram.baseUrl}/${accountId}/media_publish`;
    
    const publishParams = {
      creation_id: containerId,
      access_token: token
    };

    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(publishParams)
    });

    if (!publishResponse.ok) {
      throw new Error(`Instagram publish failed: ${publishResponse.statusText}`);
    }

    return await publishResponse.json();
  }

  /**
   * Post to Twitter/X
   */
  async postToTwitter(content, mediaIds = []) {
    const token = this.tokens.twitter?.accessToken;
    if (!token) {
      throw new Error('Twitter not connected');
    }

    const url = `${API_CONFIG.twitter.baseUrl}/tweets`;

    const payload = {
      text: content
    };

    if (mediaIds.length > 0) {
      payload.media = { media_ids: mediaIds };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter post failed: ${error.detail || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Post to LinkedIn
   */
  async postToLinkedIn(personUrn, content, mediaUrl = null) {
    const token = this.tokens.linkedin?.accessToken;
    if (!token) {
      throw new Error('LinkedIn not connected');
    }

    const url = `${API_CONFIG.linkedin.baseUrl}/ugcPosts`;

    const payload = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: mediaUrl ? 'ARTICLE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (mediaUrl) {
      payload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        originalUrl: mediaUrl
      }];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`LinkedIn post failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Upload video to YouTube
   */
  async postToYouTube(title, description, videoFile, tags = []) {
    const token = this.tokens.youtube?.accessToken;
    if (!token) {
      throw new Error('YouTube not connected');
    }

    const metadata = {
      snippet: {
        title: title,
        description: description,
        tags: tags,
        categoryId: '22' // People & Blogs
      },
      status: {
        privacyStatus: 'public'
      }
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('video', videoFile);

    const response = await fetch(`${API_CONFIG.youtube.baseUrl}/videos?part=snippet,status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`YouTube upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Post to multiple platforms
   */
  async postToMultiplePlatforms(platforms, content, options = {}) {
    const results = {};
    const errors = {};

    for (const platform of platforms) {
      try {
        switch (platform) {
          case 'facebook':
            results.facebook = await this.postToFacebook(
              options.facebookPageId,
              content,
              options.mediaUrl,
              options.scheduledTime
            );
            break;

          case 'instagram':
            results.instagram = await this.postToInstagram(
              options.instagramAccountId,
              options.imageUrl,
              content,
              options.scheduledTime
            );
            break;

          case 'twitter':
            results.twitter = await this.postToTwitter(content, options.mediaIds || []);
            break;

          case 'linkedin':
            results.linkedin = await this.postToLinkedIn(
              options.linkedinPersonUrn,
              content,
              options.mediaUrl
            );
            break;

          case 'youtube':
            results.youtube = await this.postToYouTube(
              options.title || content.substring(0, 100),
              content,
              options.videoFile,
              options.tags || []
            );
            break;

          default:
            errors[platform] = 'Unsupported platform';
        }
      } catch (error) {
        errors[platform] = error.message;
      }
    }

    return { results, errors };
  }

  /**
   * Generate random state for OAuth
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Refresh access token if expired
   */
  async refreshTokenIfNeeded(platform) {
    const tokenData = this.tokens[platform];
    if (!tokenData) return false;

    // Check if token expires in less than 5 minutes
    if (tokenData.expiresAt - Date.now() > 5 * 60 * 1000) {
      return true; // Token still valid
    }

    // Refresh token logic here
    // This varies by platform and requires implementation
    return false;
  }

  /**
   * Get connected accounts summary
   */
  getConnectedAccounts() {
    return Object.keys(this.accounts).map(platform => ({
      platform,
      account: this.accounts[platform],
      connected: this.isConnected(platform)
    }));
  }
}

// Export singleton instance
export const socialMediaAPI = new SocialMediaAPI();

// Export class for testing
export { SocialMediaAPI };

