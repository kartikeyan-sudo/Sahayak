import React, { useEffect, useState } from 'react';
import getApiBase from '../utils/apiBase';

function FirManager() {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE = getApiBase();

  useEffect(() => {
    fetchFirs();
  }, []);

  const fetchFirs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/firs`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to fetch FIR records');
      }

      const data = await res.json();
      setFirs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load FIR records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-card">Loading FIR records...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <div className="admin-card">
      <h2>FIR Records</h2>
      <p style={{ marginBottom: 12, color: '#666' }}>Total records: {firs.length}</p>

      <table className="blog-list-table">
        <thead>
          <tr>
            <th>Application #</th>
            <th>User</th>
            <th>Type</th>
            <th>Loss</th>
            <th>Status</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {firs.map((fir) => (
            <tr key={fir._id}>
              <td>{fir.applicationNumber || 'Pending'}</td>
              <td>{fir.userName || fir.userEmail || fir.userId}</td>
              <td>{fir.incidentType}</td>
              <td>Rs {Number(fir.estimatedLoss || 0).toLocaleString()}</td>
              <td>
                <span className={`status-badge ${String(fir.status || 'draft').toLowerCase().includes('incident') ? 'published' : 'draft'}`}>
                  {fir.status}
                </span>
              </td>
              <td>
                {fir.pdfUrl ? (
                  <a href={fir.pdfUrl} target="_blank" rel="noreferrer">Download</a>
                ) : (
                  'Not generated'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {firs.length === 0 && <p style={{ marginTop: 12 }}>No FIR records found yet.</p>}
    </div>
  );
}

export default FirManager;
