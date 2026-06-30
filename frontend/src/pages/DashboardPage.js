import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { statsAPI, applicationsAPI } from '../services/api';
import ApplicationModal from '../components/ApplicationModal';

const STATUS_COLORS = {
  WISHLIST: '#a78bfa',
  APPLIED: '#38bdf8',
  OA_TEST: '#eab308',
  INTERVIEW: '#fb923c',
  OFFER: '#22c55e',
  REJECTED: '#ef4444',
};

const STATUS_LABELS = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  OA_TEST: 'OA / Test',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '8px 12px', fontSize: 13
      }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{label}</p>
        <p style={{ margin: '2px 0 0', color: 'var(--accent)' }}>{payload[0].value} applications</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editApp, setEditApp] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        statsAPI.getDashboard(),
        applicationsAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setRecent(appsRes.data.slice(0, 8));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    if (editApp) {
      await applicationsAPI.update(editApp.id, formData);
    } else {
      await applicationsAPI.create(formData);
    }
    setEditApp(null);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this application?')) {
      await applicationsAPI.delete(id);
      fetchData();
    }
  };

  if (loading) return <div className="loading-wrap">Loading dashboard…</div>;

  const pieData = stats
    ? Object.entries(stats.statusBreakdown)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: STATUS_LABELS[k] || k, value: v, key: k }))
    : [];

  const timelineData = (stats?.timeline || []).slice(-14).map((t) => ({
    date: t.date.slice(5),
    count: t.count,
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your job search at a glance</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditApp(null); setShowModal(true); }}>
          + Add Application
        </button>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card accent-info">
          <div className="stat-value">{stats?.totalApplications ?? 0}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card accent-purple">
          <div className="stat-value">{stats?.applicationsThisWeek ?? 0}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card accent-warning">
          <div className="stat-value">{stats?.applicationsThisMonth ?? 0}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card accent-success">
          <div className="stat-value">{stats?.interviewRate ?? 0}%</div>
          <div className="stat-label">Interview Rate</div>
        </div>
        <div className="stat-card accent-success">
          <div className="stat-value">{stats?.offerRate ?? 0}%</div>
          <div className="stat-label">Offer Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>
            {stats?.statusBreakdown?.OFFER ?? 0}
          </div>
          <div className="stat-label">Offers Received</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Applications Over Time (last 14 days)</h3>
          {timelineData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 13 }}>
              No data yet — add some applications to see your activity!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timelineData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <XAxis dataKey="date" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>Status Breakdown</h3>
          {pieData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 13 }}>
              No applications yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || '#888'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: 'var(--text-dim)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent applications table */}
      <div className="chart-card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Recent Applications</h3>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <h3>No applications yet</h3>
            <p>Click "+ Add Application" to log your first one.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>
                {['Company', 'Role', 'Location', 'Status', 'Applied', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{app.companyName}</td>
                  <td style={{ padding: '10px', color: 'var(--text-dim)' }}>{app.roleTitle}</td>
                  <td style={{ padding: '10px', color: 'var(--text-dim)' }}>{app.location || '—'}</td>
                  <td style={{ padding: '10px' }}>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-dim)' }}>{app.appliedDate}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: 12, marginRight: 6 }}
                      onClick={() => { setEditApp(app); setShowModal(true); }}
                    >Edit</button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => handleDelete(app.id)}
                    >Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <ApplicationModal
          application={editApp}
          onClose={() => { setShowModal(false); setEditApp(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    WISHLIST: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
    APPLIED:  { bg: 'rgba(56,189,248,0.15)',  color: '#38bdf8' },
    OA_TEST:  { bg: 'rgba(234,179,8,0.15)',   color: '#eab308' },
    INTERVIEW:{ bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
    OFFER:    { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  };
  const labels = {
    WISHLIST: 'Wishlist', APPLIED: 'Applied', OA_TEST: 'OA / Test',
    INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected',
  };
  const style = colors[status] || { bg: 'var(--surface-2)', color: 'var(--text-dim)' };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '3px 9px', borderRadius: 999, fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap'
    }}>
      {labels[status] || status}
    </span>
  );
}
