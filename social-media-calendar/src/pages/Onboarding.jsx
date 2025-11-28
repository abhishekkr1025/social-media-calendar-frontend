import ConnectButton from '../components/ConnectButton';
import ConnectedAccountRow from '../components/ConnectedAccountRow';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Single-file React onboarding UI
// - Uses Tailwind utility classes for styling
// - Default export is the OnboardingApp component
// - Assumes BACKEND_URL is set in env (REACT_APP_BACKEND_URL)

const BACKEND_URL = 'http://localhost:5000';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OnboardingApp() {
  const [client, setClient] = useState({ name: '', email: '' });
  const [clientId, setClientId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!clientId) return;
    // load connected accounts for this client
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/clients/${clientId}/instagram/accounts`);
        if (res.ok) {
          const data = await res.json();
          setConnected(data);
        }
      } catch (e) {
        console.warn('Failed to fetch connected accounts', e);
      }
    })();
  }, [clientId]);

  const createClient = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      // Your backend should have POST /api/clients that creates a client and returns its id
      const res = await fetch(`${BACKEND_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      const data = await res.json();
      if (res.ok) {
        setClientId(data.id);
        setMessage('Client created. Now connect social accounts.');
        console.log(data);
      } else {
        setMessage(data.error || 'Failed to create client');
      }
    } catch (err) {
      setMessage(err.message || 'Error creating client');
    } finally {
      setSaving(false);
    }
  };

  const DisconnectRow = ({ acc }) => {
    const disconnect = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/instagram/accounts/${acc.id}`, { method: 'DELETE' });
        if (res.ok) {
          setConnected((c) => c.filter(x => x.id !== acc.id));
        }
      } catch (e) {
        console.warn('Failed to disconnect', e);
      }
    };

    return (
      <div className="flex items-center justify-between">
        <ConnectedAccountRow acc={acc} />
        <div className="ml-3">
          <button onClick={disconnect} className="text-sm text-red-600">Disconnect</button>
        </div>
      </div>
    );
  };

  return (
   
          <div className="min-h-screen bg-slate-50 p-6 flex items-start justify-center">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-6">
              <h1 className="text-2xl font-bold mb-4">Client Onboarding</h1>

              <form onSubmit={createClient} className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium">Client name</label>
                  <input value={client.name} onChange={e => setClient({...client, name: e.target.value})} className="mt-1 w-full border rounded p-2" placeholder="e.g., SportsJam" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input value={client.email} onChange={e => setClient({...client, email: e.target.value})} className="mt-1 w-full border rounded p-2" placeholder="client@example.com" />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <textarea value={client.notes || ''} onChange={e => setClient({...client, notes: e.target.value})} className="mt-1 w-full border rounded p-2" rows={3} />
                </div>

                <div className="col-span-2 flex items-center gap-3 mt-2">
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">Create client</button>
                  {clientId && <div className="text-sm text-slate-500">Client ID: <span className="font-medium">{clientId}</span></div>}
                </div>
              </form>

              {/* <div className="mb-6">
                <h2 className="font-semibold mb-2">Connect Social Accounts</h2>
                <p className="text-sm text-slate-500 mb-4">Click the provider you want the client to connect. The client must complete the OAuth flow (they should log in with their account).</p>

                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <ConnectButton platform="facebook" clientId={clientId} />
                  <ConnectButton platform="facebook" clientId={clientId} />
                  <ConnectButton platform="instagram" clientId={clientId} />
                  <ConnectButton platform="linkedin" clientId={clientId} />
                  <ConnectButton platform="twitter" clientId={clientId} />
                </div>
              </div> */}

              <div>
                <h3 className="font-semibold mb-2">Connected Accounts</h3>
                {connected.length === 0 ? (
                  <div className="text-sm text-slate-500">No accounts connected yet.</div>
                ) : (
                  <div className="space-y-3">
                    {connected.map(acc => (
                      <DisconnectRow key={acc.id} acc={acc} />
                    ))}
                  </div>
                )}
              </div>

              {message && <div className="mt-4 p-3 bg-yellow-50 border rounded text-sm">{message}</div>}

            </div>
          </div>
    

        
  );
}
