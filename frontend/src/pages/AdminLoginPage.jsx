import React from 'react';
import AdminLogin from '../admin/AdminLogin';

function AdminLoginPage({ onLoginSuccess }) {
  return (
    <div className="admin-login-page">
      <AdminLogin onLogin={(user) => { if (onLoginSuccess) onLoginSuccess(user); }} defaultCreds={{ username: 'admin', password: 'admin' }} />
    </div>
  );
}

export default AdminLoginPage;
