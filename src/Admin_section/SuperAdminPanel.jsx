import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../Auth_section/config';
import '../Webstyles/login_style.css';

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
    <div className="log-reg-box" style={{ maxWidth: '900px', margin: '40px auto' }}>
      <div className="form-box register" style={{ opacity: 1, transform: 'none', pointerEvents: 'auto', padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>👑 Super Admin Panel</h2>
          <button onClick={() => navigate('/dashboard_section/Dashboard')} className="btn" style={{ background: '#6c757d' }}>
            ← Dashboard
          </button>
        </div>

        <p style={{ color: '#666', marginBottom: '20px' }}>
          Manage sub-admins. Only you (Super Admin) can invite or revoke admins.
        </p>

        {error && <div style={{color:'red',marginBottom:'16px',padding:'10px',background:'#fdeaea',borderRadius:'8px',border:'1px solid #e53935'}}>{error}</div>}

        {loading ? (
          <div style={{textAlign:'center',padding:'40px'}}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th style={{padding:'12px',borderBottom:'2px solid #dee2e6'}}>Username</th>
                  <th style={{padding:'12px',borderBottom:'2px solid #dee2e6'}}>Email</th>
                  <th style={{padding:'12px',borderBottom:'2px solid #dee2e6'}}>Invited By</th>
                  <th style={{padding:'12px',borderBottom:'2px solid #dee2e6'}}>Joined</th>
                  <th style={{padding:'12px',borderBottom:'2px solid #dee2e6'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{padding:'12px'}}>{admin.username}</td>
                    <td style={{padding:'12px'}}>{admin.email}</td>
                    <td style={{padding:'12px',color:'#666'}}>
                      {admin.invited_by_username ? `${admin.invited_by_username} (${admin.invited_by_email})` : '— (Super Admin)'}
                    </td>
                    <td style={{padding:'12px',color:'#666'}}>{new Date(admin.created_at).toLocaleDateString()}</td>
                    <td style={{padding:'12px'}}>
                      {isCurrentUser(admin) ? (
                        <span style={{color:'#666',fontStyle:'italic'}}>You (Super Admin)</span>
                      ) : (
                        <button
                          onClick={() => handleRevoke(admin.id, admin.username)}
                          disabled={revoking === admin.id}
                          className="btn"
                          style={{ background: '#dc3545', padding: '6px 12px', fontSize: '14px' }}
                        >
                          {revoking === admin.id ? 'Revoking...' : 'Revoke Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{padding:'40px',textAlign:'center',color:'#666'}}>
                      No sub-admins yet. Use "Invite Admin" to add your first sub-admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={() => navigate('/Admin_section/InviteAdmin')} className="btn">
            ➕ Invite New Sub-Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;