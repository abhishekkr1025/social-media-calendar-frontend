import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ConnectSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [accounts, setAccounts] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const connected = params.get('connected');

    if (!connected) return;

    try {
      const parsed = JSON.parse(decodeURIComponent(connected));
      setAccounts(parsed);
    } catch (e) {
      console.warn('Failed to parse connected payload', e);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Connection successful</h2>
        <p className="text-sm text-slate-500 mb-4">
          We received the following connected accounts:
        </p>

        {accounts ? (
          <div className="space-y-3">
            {accounts.map((a, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{a.username || a.page_name || `Page ${a.pageId || ''}`}</div>
                  <div className="text-xs text-slate-500">
                    IG: {a.igId || a.instagram_account_id || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            No connected accounts found in the URL payload.
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/onboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Back to onboarding
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectSuccess;
