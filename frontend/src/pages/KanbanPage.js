import React, { useState, useEffect, useCallback, useRef } from 'react';
import { applicationsAPI } from '../services/api';
import ApplicationModal from '../components/ApplicationModal';

const COLUMNS = [
  { key: 'WISHLIST',  label: 'Wishlist',   emoji: '🌟' },
  { key: 'APPLIED',   label: 'Applied',    emoji: '📤' },
  { key: 'OA_TEST',   label: 'OA / Test',  emoji: '🧪' },
  { key: 'INTERVIEW', label: 'Interview',  emoji: '🎙️' },
  { key: 'OFFER',     label: 'Offer',      emoji: '🎉' },
  { key: 'REJECTED',  label: 'Rejected',   emoji: '❌' },
];

export default function KanbanPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('APPLIED');

  // drag state via refs (no re-renders mid-drag)
  const dragging = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      const { data } = await applicationsAPI.getAll();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // Group applications by status
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = applications.filter((a) => a.status === col.key);
    return acc;
  }, {});

  // ── Drag handlers ──────────────────────────────────────
  const onDragStart = (e, app) => {
    dragging.current = app;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const onDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDragOver(null);
  };

  const onDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(colKey);
  };

  const onDrop = async (e, colKey) => {
    e.preventDefault();
    setDragOver(null);
    const app = dragging.current;
    dragging.current = null;

    if (!app || app.status === colKey) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status: colKey } : a))
    );

    try {
      await applicationsAPI.updateStatus(app.id, colKey);
    } catch (err) {
      // Revert on failure
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: app.status } : a))
      );
      alert('Failed to update status. Please try again.');
    }
  };

  // ── CRUD handlers ──────────────────────────────────────
  const handleAddToColumn = (colKey) => {
    setDefaultStatus(colKey);
    setEditApp(null);
    setShowModal(true);
  };

  const handleEdit = (app) => {
    setEditApp(app);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    setApplications((prev) => prev.filter((a) => a.id !== id));
    try {
      await applicationsAPI.delete(id);
    } catch (err) {
      fetchApplications();
    }
  };

  const handleSave = async (formData) => {
    if (editApp) {
      const { data } = await applicationsAPI.update(editApp.id, formData);
      setApplications((prev) => prev.map((a) => (a.id === editApp.id ? data : a)));
    } else {
      const payload = { ...formData, status: defaultStatus };
      const { data } = await applicationsAPI.create(payload);
      setApplications((prev) => [...prev, data]);
    }
    setShowModal(false);
    setEditApp(null);
  };

  if (loading) return <div className="loading-wrap">Loading kanban…</div>;

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kanban Board</h1>
          <p className="page-subtitle">
            Drag cards between columns to update status &nbsp;·&nbsp; {applications.length} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditApp(null); setDefaultStatus('APPLIED'); setShowModal(true); }}>
          + Add Application
        </button>
      </div>

      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`kanban-column col-${col.key}${dragOver === col.key ? ' drag-over' : ''}`}
            onDragOver={(e) => onDragOver(e, col.key)}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">
                {col.emoji} {col.label}
              </span>
              <span className="kanban-count">{grouped[col.key].length}</span>
            </div>

            {/* Add button per column */}
            <button
              onClick={() => handleAddToColumn(col.key)}
              style={{
                width: '100%', background: 'transparent', border: '1px dashed var(--border)',
                borderRadius: 8, color: 'var(--text-dim)', padding: '7px', fontSize: 13,
                cursor: 'pointer', marginBottom: 10, fontFamily: 'var(--font)',
              }}
            >
              + Add here
            </button>

            {grouped[col.key].length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, padding: '20px 0' }}>
                Drop here
              </div>
            ) : (
              grouped[col.key].map((app) => (
                <KanbanCard
                  key={app.id}
                  app={app}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <ApplicationModal
          application={editApp ? { ...editApp } : { status: defaultStatus }}
          onClose={() => { setShowModal(false); setEditApp(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function KanbanCard({ app, onDragStart, onDragEnd, onEdit, onDelete }) {
  const daysSince = Math.floor(
    (new Date() - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, app)}
      onDragEnd={onDragEnd}
      title="Drag to move"
    >
      <div className="kanban-card-company">{app.companyName}</div>
      <div className="kanban-card-role">{app.roleTitle}</div>

      {app.location && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>
          📍 {app.location}
        </div>
      )}

      <div className="kanban-card-meta">
        <span>
          {daysSince === 0 ? 'Today' : daysSince === 1 ? '1 day ago' : `${daysSince}d ago`}
        </span>
        {app.jobLink && (
          <a href={app.jobLink} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontSize: 11 }}>
            🔗 Link
          </a>
        )}
      </div>

      {app.notes && (
        <div style={{
          marginTop: 8, fontSize: 11, color: 'var(--text-dim)',
          background: 'var(--surface)', borderRadius: 6, padding: '5px 8px',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          💬 {app.notes}
        </div>
      )}

      <div className="kanban-card-actions">
        <button onClick={() => onEdit(app)}>✏️ Edit</button>
        <button onClick={() => onDelete(app.id)} style={{ color: '#ef4444' }}>🗑 Delete</button>
      </div>
    </div>
  );
}
