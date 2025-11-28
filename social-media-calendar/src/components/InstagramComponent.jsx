import React, { useState, useEffect } from 'react';
import { Instagram, AlertCircle, CheckCircle, Loader2, Settings, Link2 } from 'lucide-react';

// Add this component to your existing calendar app
const InstagramIntegration = ({ clients, selectedClient }) => {
  const [instagramAccounts, setInstagramAccounts] = useState({});
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingClientId, setConnectingClientId] = useState(null);
  const [longLivedToken, setLongLivedToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE = 'http://localhost:5000/api'; // Update with your API URL

  useEffect(() => {
    // Fetch Instagram account info for all clients
    clients.forEach(client => {
      fetchAccountInfo(client.id);
    });
  }, [clients]);

  const fetchAccountInfo = async (clientId) => {
    try {
      const response = await fetch(`${API_BASE}/clients/${clientId}/instagram/account`);
      if (response.ok) {
        const data = await response.json();
        setInstagramAccounts(prev => ({
          ...prev,
          [clientId]: data
        }));
      }
    } catch (err) {
      console.error('Error fetching account:', err);
    }
  };

  const connectInstagram = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/clients/${connectingClientId}/instagram/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ long_lived_token: longLivedToken })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Instagram account connected for ${clients.find(c => c.id === connectingClientId)?.name}!`);
        setShowConnectModal(false);
        setLongLivedToken('');
        fetchAccountInfo(connectingClientId);
      } else {
        setError(data.error || 'Failed to connect account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openConnectModal = (clientId) => {
    setConnectingClientId(clientId);
    setShowConnectModal(true);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Instagram Accounts Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Instagram className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900">Instagram Accounts</h3>
        </div>

        <div className="space-y-2">
          {clients.map(client => {
            const account = instagramAccounts[client.id];
            return (
              <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    {account ? (
                      <p className="text-sm text-gray-600">@{account.username}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Not connected</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openConnectModal(client.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-md transition"
                >
                  <Link2 className="w-4 h-4" />
                  {account ? 'Reconnect' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Connect Instagram for {clients.find(c => c.id === connectingClientId)?.name}
            </h2>
            <p className="text-gray-600 mb-4">Enter the long-lived access token for this client's Instagram Business account.</p>
            
            <textarea
              value={longLivedToken}
              onChange={(e) => setLongLivedToken(e.target.value)}
              placeholder="Paste your long-lived token here..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setLongLivedToken('');
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={connectInstagram}
                disabled={loading || !longLivedToken}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Post Card Component with Instagram posting
const PostCardWithInstagram = ({ post, onDelete, clientId, onPostToInstagram }) => {
  const [posting, setPosting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const handlePostToInstagram = async () => {
    if (!imageUrl) {
      setShowImageInput(true);
      return;
    }

    setPosting(true);
    try {
      await onPostToInstagram(clientId, imageUrl, post.content);
      setShowImageInput(false);
      setImageUrl('');
    } finally {
      setPosting(false);
    }
  };

  const platformIcons = {
    instagram: <Instagram className="w-4 h-4" />,
    linkedin: <Link2 className="w-4 h-4" />,
    facebook: <span className="w-4 h-4">f</span>,
    twitter: <span className="w-4 h-4">𝕏</span>
  };

  const platformColors = {
    instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
    linkedin: 'bg-blue-600',
    facebook: 'bg-blue-500',
    twitter: 'bg-black'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded">
              {post.clientName}
            </span>
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

          {/* Instagram Image Input */}
          {showImageInput && post.platforms.includes('instagram') && (
            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Image URL for Instagram
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Post to Instagram Button */}
          {post.platforms.includes('instagram') && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={handlePostToInstagram}
                disabled={posting}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition disabled:opacity-50"
              >
                {posting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4" />
                    Post to Instagram
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(post.id)}
          className="p-2 hover:bg-red-50 rounded-lg transition"
        >
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Main Integration Hook - Add this to your calendar component
const useInstagramPosting = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE = 'http://localhost:3000/api';

  const postToInstagram = async (clientId, imageUrl, caption) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/clients/${clientId}/instagram/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl, caption })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Posted successfully to Instagram!');
        return true;
      } else {
        setError(data.error || 'Failed to post to Instagram');
        return false;
      }
    } catch (err) {
      setError('Network error. Please try again.');
      return false;
    }
  };

  return { postToInstagram, error, success, setError, setSuccess };
};

// Export components and hook
export { InstagramIntegration, PostCardWithInstagram, useInstagramPosting };