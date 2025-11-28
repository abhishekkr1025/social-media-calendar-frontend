/**
 * React Hook for Social Media API Integration
 * 
 * Provides easy-to-use interface for connecting accounts and posting
 */

import { useState, useEffect, useCallback } from 'react';
import { socialMediaAPI } from '../services/socialMediaAPI';

export function useSocialMedia() {
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  // Load connected accounts on mount
  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  /**
   * Load connected accounts
   */
  const loadConnectedAccounts = useCallback(() => {
    const accounts = socialMediaAPI.getConnectedAccounts();
    setConnectedAccounts(accounts);
  }, []);

  /**
   * Connect to a platform
   */
  const connect = useCallback((platform, clientId, redirectUri) => {
    try {
      setError(null);
      socialMediaAPI.initiateAuth(platform, clientId, redirectUri);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  /**
   * Handle OAuth callback
   */
  const handleCallback = useCallback(async (code, state, clientId, clientSecret, redirectUri) => {
    try {
      setError(null);
      const accountInfo = await socialMediaAPI.handleAuthCallback(
        code,
        state,
        clientId,
        clientSecret,
        redirectUri
      );
      loadConnectedAccounts();
      return accountInfo;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [loadConnectedAccounts]);

  /**
   * Disconnect from a platform
   */
  const disconnect = useCallback((platform) => {
    try {
      setError(null);
      socialMediaAPI.disconnect(platform);
      loadConnectedAccounts();
    } catch (err) {
      setError(err.message);
    }
  }, [loadConnectedAccounts]);

  /**
   * Check if a platform is connected
   */
  const isConnected = useCallback((platform) => {
    return socialMediaAPI.isConnected(platform);
  }, []);

  /**
   * Post to multiple platforms
   */
  const post = useCallback(async (platforms, content, options = {}) => {
    setIsPosting(true);
    setError(null);

    try {
      const { results, errors } = await socialMediaAPI.postToMultiplePlatforms(
        platforms,
        content,
        options
      );

      setIsPosting(false);

      if (Object.keys(errors).length > 0) {
        setError(errors);
      }

      return { results, errors };
    } catch (err) {
      setIsPosting(false);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Post to Facebook
   */
  const postToFacebook = useCallback(async (pageId, content, mediaUrl = null, scheduledTime = null) => {
    setIsPosting(true);
    setError(null);

    try {
      const result = await socialMediaAPI.postToFacebook(pageId, content, mediaUrl, scheduledTime);
      setIsPosting(false);
      return result;
    } catch (err) {
      setIsPosting(false);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Post to Instagram
   */
  const postToInstagram = useCallback(async (accountId, imageUrl, caption, scheduledTime = null) => {
    setIsPosting(true);
    setError(null);

    try {
      const result = await socialMediaAPI.postToInstagram(accountId, imageUrl, caption, scheduledTime);
      setIsPosting(false);
      return result;
    } catch (err) {
      setIsPosting(false);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Post to Twitter
   */
  const postToTwitter = useCallback(async (content, mediaIds = []) => {
    setIsPosting(true);
    setError(null);

    try {
      const result = await socialMediaAPI.postToTwitter(content, mediaIds);
      setIsPosting(false);
      return result;
    } catch (err) {
      setIsPosting(false);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Post to LinkedIn
   */
  const postToLinkedIn = useCallback(async (personUrn, content, mediaUrl = null) => {
    setIsPosting(true);
    setError(null);

    try {
      const result = await socialMediaAPI.postToLinkedIn(personUrn, content, mediaUrl);
      setIsPosting(false);
      return result;
    } catch (err) {
      setIsPosting(false);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Post to YouTube
   */
  const postToYouTube = useCallback(async (title, description, videoFile, tags = []) => {
    setIsPosting(true);
    setError(null);

    try {
      const result = await socialMediaAPI.postToYouTube(title, description, videoFile, tags);
      setIsPosting(false);
      return result;
    } catch (err) {
      setIsPosting(false);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    // State
    connectedAccounts,
    isPosting,
    error,

    // Methods
    connect,
    disconnect,
    isConnected,
    handleCallback,
    post,
    postToFacebook,
    postToInstagram,
    postToTwitter,
    postToLinkedIn,
    postToYouTube,
    loadConnectedAccounts
  };
}

