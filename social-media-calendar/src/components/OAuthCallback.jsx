/**
 * OAuth Callback Handler Component
 * 
 * Handles OAuth redirects from social media platforms
 */

import { useEffect, useState } from 'react';
import { useSocialMedia } from '../hooks/useSocialMedia';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import './OAuthCallback.css';

export function OAuthCallback() {
  const { handleCallback } = useSocialMedia();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Invalid callback parameters');
        }

        // Get stored credentials (in production, these should come from secure backend)
        const clientId = localStorage.getItem('oauth_client_id');
        const clientSecret = localStorage.getItem('oauth_client_secret');
        const redirectUri = localStorage.getItem('oauth_redirect_uri');

        if (!clientId || !clientSecret) {
          throw new Error('Missing OAuth credentials');
        }

        // Handle the callback
        await handleCallback(code, state, clientId, clientSecret, redirectUri);

        setStatus('success');
        setMessage('Successfully connected! Redirecting...');

        // Redirect back to main app after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);

      } catch (err) {
        setStatus('error');
        setMessage(err.message);
        
        // Redirect back after 5 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 5000);
      }
    };

    processCallback();
  }, [handleCallback]);

  return (
    <div className="oauth-callback">
      <div className="callback-card">
        {status === 'processing' && (
          <>
            <Loader2 className="spinner" size={48} />
            <h2>Connecting Account</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="success-icon" size={48} />
            <h2>Success!</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="error-icon" size={48} />
            <h2>Connection Failed</h2>
            <p>{message}</p>
            <button onClick={() => window.location.href = '/'}>
              Return to App
            </button>
          </>
        )}
      </div>
    </div>
  );
}

