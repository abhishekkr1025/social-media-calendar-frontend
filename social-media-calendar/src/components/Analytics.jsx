/**
 * Analytics Dashboard Component
 * 
 * Track posting activity, success rates, and performance metrics
 */

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import './Analytics.css';

export function Analytics({ posts }) {
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    publishedPosts: 0,
    failedPosts: 0,
    platformStats: {},
    clientStats: {},
    timeStats: {},
    weeklyActivity: []
  });

  useEffect(() => {
    calculateAnalytics();
  }, [posts]);

  const calculateAnalytics = () => {
    const now = Date.now();
    const platformStats = {};
    const clientStats = {};
    const timeStats = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const weeklyActivity = Array(7).fill(0);

    let scheduledPosts = 0;
    let publishedPosts = 0;
    let failedPosts = 0;

    posts.forEach(post => {
      const postTime = new Date(`${post.date} ${post.time}`).getTime();
      const isPast = postTime < now;

      // Count by status
      if (post.failed) {
        failedPosts++;
      } else if (isPast) {
        publishedPosts++;
      } else {
        scheduledPosts++;
      }

      // Platform stats
      post.platforms.forEach(platform => {
        if (!platformStats[platform]) {
          platformStats[platform] = { total: 0, published: 0, scheduled: 0, failed: 0 };
        }
        platformStats[platform].total++;
        if (post.failed) {
          platformStats[platform].failed++;
        } else if (isPast) {
          platformStats[platform].published++;
        } else {
          platformStats[platform].scheduled++;
        }
      });

      // Client stats
      if (!clientStats[post.clientName]) {
        clientStats[post.clientName] = { total: 0, published: 0, scheduled: 0 };
      }
      clientStats[post.clientName].total++;
      if (isPast && !post.failed) {
        clientStats[post.clientName].published++;
      } else if (!post.failed) {
        clientStats[post.clientName].scheduled++;
      }

      // Time of day stats
      const hour = parseInt(post.time.split(':')[0]);
      if (hour >= 5 && hour < 12) timeStats.morning++;
      else if (hour >= 12 && hour < 17) timeStats.afternoon++;
      else if (hour >= 17 && hour < 21) timeStats.evening++;
      else timeStats.night++;

      // Weekly activity
      const dayOfWeek = new Date(post.date).getDay();
      weeklyActivity[dayOfWeek]++;
    });

    setAnalytics({
      totalPosts: posts.length,
      scheduledPosts,
      publishedPosts,
      failedPosts,
      platformStats,
      clientStats,
      timeStats,
      weeklyActivity
    });
  };

  const getSuccessRate = () => {
    if (analytics.publishedPosts + analytics.failedPosts === 0) return 0;
    return Math.round((analytics.publishedPosts / (analytics.publishedPosts + analytics.failedPosts)) * 100);
  };

  const getMostActiveDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const maxIndex = analytics.weeklyActivity.indexOf(Math.max(...analytics.weeklyActivity));
    return days[maxIndex];
  };

  const getMostUsedPlatform = () => {
    const platforms = Object.entries(analytics.platformStats);
    if (platforms.length === 0) return 'None';
    return platforms.sort((a, b) => b[1].total - a[1].total)[0][0];
  };

  const getTopClient = () => {
    const clients = Object.entries(analytics.clientStats);
    if (clients.length === 0) return 'None';
    return clients.sort((a, b) => b[1].total - a[1].total)[0][0];
  };

  const getMostActiveTime = () => {
    const times = Object.entries(analytics.timeStats);
    if (times.length === 0) return 'None';
    return times.sort((a, b) => b[1] - a[1])[0][0];
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2><BarChart3 size={24} /> Analytics Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon total">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <div className="card-value">{analytics.totalPosts}</div>
            <div className="card-label">Total Posts</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon scheduled">
            <Clock size={24} />
          </div>
          <div className="card-content">
            <div className="card-value">{analytics.scheduledPosts}</div>
            <div className="card-label">Scheduled</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon published">
            <CheckCircle size={24} />
          </div>
          <div className="card-content">
            <div className="card-value">{analytics.publishedPosts}</div>
            <div className="card-label">Published</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon failed">
            <XCircle size={24} />
          </div>
          <div className="card-content">
            <div className="card-value">{analytics.failedPosts}</div>
            <div className="card-label">Failed</div>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="success-rate-section">
        <h3><Target size={20} /> Success Rate</h3>
        <div className="success-rate-bar">
          <div 
            className="success-rate-fill"
            style={{ width: `${getSuccessRate()}%` }}
          >
            {getSuccessRate()}%
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="stats-section">
        <h3>Platform Performance</h3>
        <div className="platform-stats">
          {Object.entries(analytics.platformStats).map(([platform, stats]) => (
            <div key={platform} className="platform-stat-card">
              <div className="platform-name">{platform}</div>
              <div className="platform-numbers">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Published:</span>
                  <span className="stat-value published">{stats.published}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Scheduled:</span>
                  <span className="stat-value scheduled">{stats.scheduled}</span>
                </div>
                {stats.failed > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Failed:</span>
                    <span className="stat-value failed">{stats.failed}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Stats */}
      <div className="stats-section">
        <h3>Client Activity</h3>
        <div className="client-stats">
          {Object.entries(analytics.clientStats).map(([client, stats]) => (
            <div key={client} className="client-stat-row">
              <div className="client-name">{client}</div>
              <div className="client-bar">
                <div 
                  className="client-bar-fill"
                  style={{ width: `${(stats.total / analytics.totalPosts) * 100}%` }}
                >
                  {stats.total}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="stats-section">
        <h3>Weekly Activity</h3>
        <div className="weekly-chart">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
            const maxValue = Math.max(...analytics.weeklyActivity);
            const height = maxValue > 0 ? (analytics.weeklyActivity[index] / maxValue) * 100 : 0;
            
            return (
              <div key={day} className="day-column">
                <div className="day-bar-container">
                  <div 
                    className="day-bar"
                    style={{ height: `${height}%` }}
                  >
                    <span className="day-value">{analytics.weeklyActivity[index]}</span>
                  </div>
                </div>
                <div className="day-label">{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time of Day Stats */}
      <div className="stats-section">
        <h3>Posting Times</h3>
        <div className="time-stats">
          {Object.entries(analytics.timeStats).map(([time, count]) => (
            <div key={time} className="time-stat-item">
              <div className="time-label">{time.charAt(0).toUpperCase() + time.slice(1)}</div>
              <div className="time-bar">
                <div 
                  className="time-bar-fill"
                  style={{ width: `${(count / analytics.totalPosts) * 100}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3><TrendingUp size={20} /> Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-label">Most Active Day</div>
            <div className="insight-value">{getMostActiveDay()}</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">Top Platform</div>
            <div className="insight-value">{getMostUsedPlatform()}</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">Top Client</div>
            <div className="insight-value">{getTopClient()}</div>
          </div>
          <div className="insight-card">
            <div className="insight-label">Preferred Time</div>
            <div className="insight-value">{getMostActiveTime()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

