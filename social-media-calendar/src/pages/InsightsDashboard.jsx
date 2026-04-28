import { useState, useEffect } from 'react';
import { authFetch } from '../lib/auth';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

// const BASE_URL = 'http://localhost:5000';

const BASE_URL =   "https://prod.panditjee.com";

const PLATFORM_COLORS = {
  instagram: '#E1306C', facebook: '#1877F2', twitter: '#1DA1F2',
  linkedin: '#0A66C2', youtube: '#FF0000', telegram: '#229ED9',
  wordpress: '#21759B', panditjee: '#F97316',
};

const LANG_COLORS = ['#1a1a1a', '#4a3728', '#1e3a4a', '#2d3a1e', '#3a1e3a', '#1e2d4a', '#3a2d1e'];

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function StatCard({ label, value, sub, accent, delay = 0 }) {
  return (
    <div style={{ ...sc.card, animationDelay: `${delay}ms` }} className="db-card">
      <div style={{ ...sc.accent, background: accent }} />
      <p style={sc.cardLabel}>{label}</p>
      <p style={sc.cardValue}>{value ?? '—'}</p>
      {sub && <p style={sc.cardSub}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={sc.tooltip}>
      <p style={{ margin: 0, fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, fontSize: 14, fontWeight: 500, color: p.color || '#1a1a1a' }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

export default function InsightsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${BASE_URL}/api/dashboard/stats`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={sc.loadingWrap}>
      <div style={sc.spinner} className="db-spin" />
      <p style={{ color: '#bbb', marginTop: 16, fontSize: 14 }}>Loading insights…</p>
    </div>
  );

  if (!stats) return <div style={sc.loadingWrap}><p style={{ color: '#bbb' }}>Failed to load stats.</p></div>;

  const successRate = stats.total_published + stats.total_failed > 0
    ? Math.round((stats.total_published / (stats.total_published + stats.total_failed)) * 100)
    : 0;

  return (
    <div style={sc.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .db-card { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .db-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.07) !important; }
        .db-spin { animation: spin 0.8s linear infinite; }
        .db-section { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Header */}
      <div style={sc.header}>
        <div>
          <p style={sc.eyebrow}>Overview</p>
          <h1 style={sc.title}>Insights</h1>
        </div>
        <div style={sc.headerRight}>
          <span style={sc.liveDot} />
          <span style={{ fontSize: 13, color: '#888' }}>Live data</span>
        </div>
      </div>

      {/* KPI Row */}
      <div style={sc.kpiGrid}>
        <StatCard label="Total Clients" value={stats.total_clients} sub="registered" accent="#1a1a1a" delay={0} />
        <StatCard label="Social Posts" value={stats.total_posts} sub="scheduled" accent="#f97316" delay={60} />
        <StatCard label="Blog Posts" value={stats.total_wp_posts} sub="wordpress" accent="#21759B" delay={120} />
        <StatCard label="Published" value={stats.total_published} sub="successfully sent" accent="#16a34a" delay={180} />
        <StatCard label="Success Rate" value={`${successRate}%`} sub={`${stats.total_failed} failed`} accent={successRate > 80 ? '#16a34a' : '#dc2626'} delay={240} />
        <StatCard label="In Queue" value={stats.total_queued} sub="pending" accent="#ca8a04" delay={300} />
      </div>

      {/* Charts Row 1 */}
      <div style={sc.chartsRow}>

        {/* Posts over time */}
        <div style={{ ...sc.chartCard, flex: 2 }} className="db-section">
          <p style={sc.chartTitle}>Published Posts — Last 14 Days</p>
          {stats.postsPerDay.length === 0 ? (
            <div style={sc.empty}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.postsPerDay} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11, fill: '#bbb' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#bbb' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="posts" stroke="#1a1a1a" strokeWidth={2} dot={{ r: 3, fill: '#1a1a1a' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform breakdown */}
        <div style={{ ...sc.chartCard, flex: 1 }} className="db-section">
          <p style={sc.chartTitle}>By Platform</p>
          {stats.platformBreakdown.length === 0 ? (
            <div style={sc.empty}>No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={stats.platformBreakdown}
                    dataKey="count"
                    nameKey="platform"
                    cx="50%" cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {stats.platformBreakdown.map((entry, i) => (
                      <Cell key={i} fill={PLATFORM_COLORS[entry.platform] || '#888'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={sc.legend}>
                {stats.platformBreakdown.map((p, i) => (
                  <div key={i} style={sc.legendItem}>
                    <span style={{ ...sc.legendDot, background: PLATFORM_COLORS[p.platform] || '#888' }} />
                    <span style={sc.legendLabel}>{p.platform}</span>
                    <span style={sc.legendVal}>{p.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={sc.chartsRow}>

        {/* WP posts by language */}
        <div style={{ ...sc.chartCard, flex: 1 }} className="db-section">
          <p style={sc.chartTitle}>Blog Posts by Language</p>
          {stats.wpPostsByLanguage.length === 0 ? (
            <div style={sc.empty}>No blog posts yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.wpPostsByLanguage} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" vertical={false} />
                <XAxis dataKey="language" tick={{ fontSize: 11, fill: '#bbb' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#bbb' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="posts" radius={[6, 6, 0, 0]}>
                  {stats.wpPostsByLanguage.map((_, i) => (
                    <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent activity feed */}
        <div style={{ ...sc.chartCard, flex: 1 }} className="db-section">
          <p style={sc.chartTitle}>Recent Activity</p>
          {stats.recentActivity.length === 0 ? (
            <div style={sc.empty}>No activity yet</div>
          ) : (
            <div style={sc.feed}>
              {stats.recentActivity.map((a, i) => (
                <div key={i} style={sc.feedItem}>
                  <div style={{
                    ...sc.feedDot,
                    background: PLATFORM_COLORS[a.platform] || '#888'
                  }} />
                  <div style={sc.feedContent}>
                    <p style={sc.feedText}>
                      <strong>{a.client_name}</strong> → {a.platform}
                    </p>
                    <p style={sc.feedCaption}>
                      {a.caption?.slice(0, 48)}{a.caption?.length > 48 ? '…' : ''}
                    </p>
                  </div>
                  <div style={sc.feedRight}>
                    <span style={{
                      ...sc.feedStatus,
                      background: a.status === 'success' ? '#f0fdf4' : '#fef2f2',
                      color: a.status === 'success' ? '#16a34a' : '#dc2626',
                      border: `1px solid ${a.status === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    }}>
                      {a.status}
                    </span>
                    <p style={sc.feedTime}>{fmt(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const sc = {
  page: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    maxWidth: 1100,
    margin: '0 auto',
    padding: '36px 24px 60px',
    color: '#1a1a1a',
  },
  loadingWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: 400,
  },
  spinner: {
    width: 28, height: 28,
    border: '2px solid #f0ece6',
    borderTopColor: '#1a1a1a',
    borderRadius: '50%',
  },
  header: {
    display: 'flex', alignItems: 'flex-end',
    justifyContent: 'space-between', marginBottom: 32,
  },
  eyebrow: {
    fontSize: 12, color: '#bbb', margin: '0 0 4px',
    textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 400,
  },
  title: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: 40, fontWeight: 600, margin: 0, letterSpacing: '-1px',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6 },
  liveDot: {
    width: 8, height: 8, borderRadius: '50%', background: '#16a34a',
    boxShadow: '0 0 0 3px rgba(22,163,74,0.2)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 12, marginBottom: 24,
  },
  card: {
    background: '#fff', border: '1px solid #ede9e3',
    borderRadius: 14, padding: '20px 18px',
    position: 'relative', overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  accent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    borderRadius: '14px 14px 0 0',
  },
  cardLabel: {
    fontSize: 11, color: '#bbb', margin: '0 0 8px',
    textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 400,
  },
  cardValue: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: 28, fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.5px',
  },
  cardSub: { fontSize: 11, color: '#bbb', margin: 0 },
  chartsRow: { display: 'flex', gap: 16, marginBottom: 16 },
  chartCard: {
    background: '#fff', border: '1px solid #ede9e3',
    borderRadius: 14, padding: '24px',
    animationDelay: '0.1s',
  },
  chartTitle: {
    fontSize: 13, fontWeight: 600, color: '#1a1a1a',
    margin: '0 0 20px', textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  empty: {
    height: 160, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#ccc', fontSize: 13,
  },
  legend: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 12, color: '#888', flex: 1, textTransform: 'capitalize' },
  legendVal: { fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace" },
  feed: { display: 'flex', flexDirection: 'column', gap: 0 },
  feedItem: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '12px 0', borderBottom: '1px solid #f5f2ee',
  },
  feedDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4 },
  feedContent: { flex: 1, minWidth: 0 },
  feedText: { fontSize: 13, margin: '0 0 2px', color: '#1a1a1a' },
  feedCaption: { fontSize: 11, color: '#bbb', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  feedRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  feedStatus: { fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20 },
  feedTime: { fontSize: 11, color: '#bbb', margin: 0 },
  tooltip: {
    background: '#fff', border: '1px solid #ede9e3',
    borderRadius: 8, padding: '8px 12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
};