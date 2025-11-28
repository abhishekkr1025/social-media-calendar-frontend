// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';



// function ConnectButton({ platform, clientId }) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const BACKEND_URL = 'http://localhost:5000';

//   const startConnect = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // backend returns { url }
//       const resp = await fetch(`${BACKEND_URL}/api/auth/${platform}/login/${clientId}`);
//       const data = await resp.json();
//       if (data.url) {
//         // redirect user to the OAuth dialog
//         window.location.href = data.url;
//       } else if (data.redirect) {
//         window.location.href = data.redirect;
//       } else {
//         setError('No URL returned from server');
//       }
//     } catch (e) {
//       setError(e.message || 'Failed to start OAuth');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={startConnect}
//         disabled={loading}
//         className="px-4 py-2 rounded-lg border inline-flex items-center gap-2 hover:shadow"
//       >
//         <span className="capitalize">Connect {platform}</span>
//         {loading && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" fill="none"/></svg>}
//       </button>
//       {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
//     </div>
//   );
// }

// export default ConnectButton;


export default function ConnectButton({ platform, clientId }) {
  const BACKEND_URL = "http://localhost:5000";

  const connect = () => {
    if (!clientId) {
      alert("Create client first!");
      return;
    }

    window.location.href = `${BACKEND_URL}/auth/${platform}/login/${clientId}`;
  };

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-indigo-600 text-white rounded"
    >
      Connect {platform}
    </button>
  );
}
