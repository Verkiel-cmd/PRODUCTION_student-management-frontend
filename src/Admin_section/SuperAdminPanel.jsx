import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../Auth_section/config';
import '../Webstyles/superadmin.css';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = config.API_URL;

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('/super-admin/admins');
      if (res.data.success) {
        setAdmins(res.data.admins);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (adminId, adminUsername) => {
    if (!window.confirm(`Revoke admin access for "${adminUsername}"? They'll become a regular user.`)) return;
    
    setRevoking(adminId);
    try {
      const res = await axios.post(`/super-admin/revoke/${adminId}`);
      if (res.data.success) {
        setAdmins(admins.filter(a => a.id !== adminId));
        alert('Admin revoked successfully');
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke admin');
    } finally {
      setRevoking(null);
    }
  };

  const isCurrentUser = (admin) => admin.id === parseInt(localStorage.getItem('userId') || '0');

  return (
     <div className="super-admin-panel">
      <div className="super-admin-box">
        <div className="super-admin-header">
          <h2>Super Admin Panel</h2>
        </div>

        <p className="super-admin-description">
          Manage sub-admins. Only you (Super Admin) can invite or revoke admins.
        </p>

        {error && <div className="super-admin-error">{error}</div>}

        {loading ? (
          <div className="super-admin-loading">Loading...</div>
        ) : (
          <div className="super-admin-table-wrapper">
            <table className="super-admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Invited By</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td data-label="Username">{admin.username}</td>
                    <td data-label="Email">{admin.email}</td>
                     <td data-label="Invited By" className="muted">
                      {admin.invited_by_username ? `${admin.invited_by_username} (${admin.invited_by_email})` : '— (Super Admin)'}
                    </td>
                     <td data-label="Joined" className="muted">{new Date(admin.created_at).toLocaleDateString()}</td>
                     <td data-label="Actions">
                      {isCurrentUser(admin) ? (
                        <span className="super-admin-current-user">You (Super Admin)</span>
                      ) : (
                        <button
                          onClick={() => handleRevoke(admin.id, admin.username)}
                          disabled={revoking === admin.id}
                          className="btn super-admin-action-btn"
                        >
                          {revoking === admin.id ? 'Revoking...' : 'Revoke Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      No sub-admins yet. Use "Invite Admin" to add your first sub-admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="super-admin-invite-section">
          <button onClick={() => navigate('/Admin_section/InviteAdmin')} className="super-admin-btn">
            ➕ Invite New Sub-Admin
          </button>
        </div>

        <div className="dashboard-button">
        <button onClick={() => navigate('/dashboard_section/Dashboard')} className="super-admin-btn super-admin-btn-back">
            ← Dashboard
          </button>
          </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;