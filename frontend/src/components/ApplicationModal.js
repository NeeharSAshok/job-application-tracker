import React, { useState, useEffect } from 'react';

const STATUSES = ['WISHLIST', 'APPLIED', 'OA_TEST', 'INTERVIEW', 'OFFER', 'REJECTED'];
const STATUS_LABELS = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  OA_TEST: 'OA / Test',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

const EMPTY = {
  companyName: '',
  roleTitle: '',
  jobLink: '',
  location: '',
  status: 'APPLIED',
  appliedDate: new Date().toISOString().slice(0, 10),
  followUpDate: '',
  notes: '',
};

export default function ApplicationModal({ application, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (application) {
      setForm({
        companyName: application.companyName || '',
        roleTitle: application.roleTitle || '',
        jobLink: application.jobLink || '',
        location: application.location || '',
        status: application.status || 'APPLIED',
        appliedDate: application.appliedDate || new Date().toISOString().slice(0, 10),
        followUpDate: application.followUpDate || '',
        notes: application.notes || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [application]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.roleTitle.trim()) {
      setError('Company name and role title are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        followUpDate: form.followUpDate || null,
        jobLink: form.jobLink || null,
        location: form.location || null,
        notes: form.notes || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h3>{application ? 'Edit Application' : 'Add Application'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input className="form-input" name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Google" />
            </div>
            <div className="form-group">
              <label className="form-label">Role Title *</label>
              <input className="form-input" name="roleTitle" value={form.roleTitle} onChange={handleChange} placeholder="e.g. Java Developer" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bengaluru" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Applied Date *</label>
              <input className="form-input" type="date" name="appliedDate" value={form.appliedDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input className="form-input" type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Posting URL</label>
            <input className="form-input" name="jobLink" value={form.jobLink} onChange={handleChange} placeholder="https://linkedin.com/jobs/..." />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Recruiter name, salary range, interview notes..." />
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (application ? 'Update' : 'Add Application')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
