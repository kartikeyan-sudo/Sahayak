import React, { useState, useEffect } from 'react';
import getApiBase from '../utils/apiBase';

function UserManager() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const API_BASE = getApiBase();

  useEffect(() => {
    fetchUsers();
    // Refresh user list every 30 seconds to update online status
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/users`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch users');
      const data = await resp.json();
      // backend may return { users, total, active } or an array for backward compat
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalUsers(data.length);
        setActiveUsers(data.filter(u => u.isOnline).length);
      } else if (data && data.users) {
        setUsers(data.users);
        setTotalUsers(data.total || data.users.length);
        setActiveUsers(typeof data.active === 'number' ? data.active : data.users.filter(u => u.isOnline).length);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setActiveUsers(0);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setErrorMsg(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/users/${id}/block`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBlocked: !currentStatus })
      });
      if (!resp.ok) throw new Error('Update failed');
      fetchUsers();
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/users/${id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ applicationStatus: newStatus })
      });
      if (!resp.ok) throw new Error('Update failed');
      fetchUsers();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleClearActivity = async (id) => {
    if (!window.confirm('Clear all activity logs for this user?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/users/${id}/activity`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Clear failed');
      fetchUsers();
    } catch (err) {
      alert('Error clearing activity: ' + err.message);
    }
  };

  const handlePermanentBan = async (user) => {
    const confirmMessage = `Permanently ban ${user.name}? This will archive a ban record and delete the user from Neon.`;
    if (!window.confirm(confirmMessage)) return;
    const reason = window.prompt('Optional reason for the permanent ban:', '') || '';
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/users/${user._id}/permanent-ban`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (!resp.ok) throw new Error('Permanent ban failed');
      fetchUsers();
    } catch (err) {
      alert('Error permanently banning user: ' + err.message);
    }
  };

  const viewActivity = (user) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  if (loading) return <div className="admin-card">Loading users...</div>;

  return (
    <div className="admin-card">
      <h2>User Management</h2>
      <p>
        Total users: {totalUsers} | Online: {activeUsers}
        <button className="btn" style={{marginLeft:12}} onClick={fetchUsers}>Refresh</button>
      </p>
      {errorMsg && <div style={{color: 'crimson', marginBottom:8}}>{errorMsg}. Try signing in again.</div>}
      
      <div style={{overflowX: 'auto'}}>
        <table className="blog-list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>App Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span style={{display:'flex', alignItems:'center', gap:4}}>
                    <span style={{width:8, height:8, borderRadius:'50%', background: user.isOnline ? '#4ade80' : '#9ca3af'}}></span>
                    {user.isOnline ? 'Online' : 'Offline'}
                    {user.isBlocked && <span style={{marginLeft:4, color:'#ef4444', fontWeight:600}}>(Blocked)</span>}
                  </span>
                </td>
                <td>
                  <select 
                    value={user.applicationStatus} 
                    onChange={(e) => handleStatusChange(user._id, e.target.value)}
                    style={{padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db'}}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>{new Date(user.lastActive).toLocaleString()}</td>
                <td>
                  <button 
                    className={`btn ${user.isBlocked ? 'btn-primary' : 'btn-danger'}`}
                    onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                    style={{marginRight: 4}}
                  >
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button 
                    className="btn"
                    onClick={() => viewActivity(user)}
                    style={{marginRight: 4}}
                  >
                    Activity
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleClearActivity(user._id)}
                  >
                    Clear Logs
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ marginLeft: 4, background: '#7f1d1d' }}
                    onClick={() => handlePermanentBan(user)}
                  >
                    Permanent Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p style={{ marginTop: 16, color: '#666' }}>
          No users found.
        </p>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedUser && (
        <div style={{position: 'fixed', left:0, top:0, right:0, bottom:0, background: 'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 200}}>
          <div style={{width: 700, maxWidth: '95%', background: 'white', padding: 20, borderRadius: 8, maxHeight: '80vh', overflow: 'auto'}}>
            <h3>Activity Log - {selectedUser.name}</h3>
            <p style={{color: '#666', marginBottom: 16}}>Email: {selectedUser.email}</p>
            
            {selectedUser.activityLog && selectedUser.activityLog.length > 0 ? (
              <div style={{display: 'grid', gap: 8}}>
                {selectedUser.activityLog.slice().reverse().map((log, idx) => (
                  <div key={idx} style={{padding: 12, background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb'}}>
                    <div style={{fontWeight: 600, marginBottom: 4}}>{log.action}</div>
                    {log.details && <div style={{fontSize: 14, color: '#6b7280', marginBottom: 4}}>{log.details}</div>}
                    <div style={{fontSize: 12, color: '#9ca3af'}}>{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{color: '#666'}}>No activity logged yet.</p>
            )}
            
            <div style={{marginTop: 16, display: 'flex', justifyContent: 'flex-end'}}>
              <button className="btn" onClick={() => setShowActivityModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManager;
