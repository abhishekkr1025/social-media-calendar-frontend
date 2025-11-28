import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';



function ConnectedAccountRow({ acc }) {
  return (
    <div className="flex items-center gap-4 p-3 border rounded">
      <img src={acc.profile_picture_url || 'https://via.placeholder.com/48'} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
      <div className="flex-1">
        <div className="font-medium">{acc.username || acc.page_name || '—'}</div>
        <div className="text-xs text-slate-500">Type: {acc.platform || acc.provider || 'instagram'}</div>
      </div>
      <div className="text-xs text-slate-400">ID: {acc.instagram_account_id || acc.id || '—'}</div>
    </div>
  );
}

export default ConnectedAccountRow;