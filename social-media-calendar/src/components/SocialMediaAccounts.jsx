/**
 * Social Media Accounts Management Component
 * 
 * Allows users to connect/disconnect social media accounts
 */

import { useState } from 'react';
import { useSocialMedia } from '../hooks/useSocialMedia';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  Check,
  X,
  Settings,
  Link as LinkIcon
} from 'lucide-react';
import './SocialMediaAccounts.css';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' }
];

export function SocialMediaAccounts({ onClose }) {
  const { connectedAccounts, connect, disconnect, isConnected, error } = useSocialMedia();
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: window.location.origin + '/oauth/callback'
  });

  const handleConnect = (platform) => {
    if (!config.clientId) {
      alert('Please configure API credentials first');
      setShowConfig(true);
      return;
    }

    connect(platform, config.clientId, config.redirectUri);
  };

  const handleDisconnect = (platform) => {
    if (confirm(`Disconnect from ${platform}?`)) {
      disconnect(platform);
    }
  };

  const getAccountInfo = (platformId) => {
    return connectedAccounts.find(acc => acc.platform === platformId);
  };

  return (
    <div className="social-media-accounts">
      <div className="accounts-header">
        <h2>Social Media Accounts</h2>
        <div className="header-actions">
          <button 
            className="config-btn"
            onClick={() => setShowConfig(!showConfig)}
            title="API Configuration"
          >
            <Settings size={18} />
          </button>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      {showConfig && (
        <div className="api-config">
          <h3>API Configuration</h3>
          <p className="config-note">
            Configure your OAuth credentials. You need to create apps on each platform's developer portal.
          </p>
          
          <div className="config-field">
            <label>Client ID</label>
            <input
              type="text"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              placeholder="Your app's client ID"
            />
          </div>

          <div className="config-field">
            <label>Client Secret</label>
            <input
              type="password"
              value={config.clientSecret}
              onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              placeholder="Your app's client secret"
            />
          </div>

          <div className="config-field">
            <label>Redirect URI</label>
            <input
              type="text"
              value={config.redirectUri}
              onChange={(e) => setConfig({ ...config, redirectUri: e.target.value })}
              placeholder="OAuth callback URL"
            />
          </div>

          <div className="config-links">
            <h4>Developer Portal Links:</h4>
            <ul>
              <li><a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
              <li><a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">Instagram (via Facebook)</a></li>
              <li><a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer">Twitter Developer Portal</a></li>
              <li><a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer">LinkedIn Developers</a></li>
              <li><a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console (YouTube)</a></li>
            </ul>
          </div>
        </div>
      )}

      <div className="accounts-list">
        {PLATFORMS.map(platform => {
          const PlatformIcon = platform.icon;
          const connected = isConnected(platform.id);
          const accountInfo = getAccountInfo(platform.id);

          return (
            <div 
              key={platform.id} 
              className={`account-card ${connected ? 'connected' : ''}`}
              style={{ '--platform-color': platform.color }}
            >
              <div className="account-icon">
                <PlatformIcon size={32} />
              </div>

              <div className="account-info">
                <h3>{platform.name}</h3>
                {connected && accountInfo?.account ? (
                  <div className="account-details">
                    <p className="account-name">
                      {accountInfo.account.name || 
                       accountInfo.account.username || 
                       accountInfo.account.id}
                    </p>
                    <span className="status-badge connected">
                      <Check size={14} /> Connected
                    </span>
                  </div>
                ) : (
                  <span className="status-badge disconnected">
                    Not connected
                  </span>
                )}
              </div>

              <div className="account-actions">
                {connected ? (
                  <button 
                    className="disconnect-btn"
                    onClick={() => handleDisconnect(platform.id)}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button 
                    className="connect-btn"
                    onClick={() => handleConnect(platform.id)}
                  >
                    <LinkIcon size={16} />
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="accounts-footer">
        <p className="info-text">
          Connect your social media accounts to enable direct posting from the calendar.
        </p>
      </div>
    </div>
  );
}

