import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../Auth_section/config';
import '../Webstyles/inviteadmin.css';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = config.API_URL;

const InviteAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const rules = useMemo(() => ({
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    symbol: /[^A-Za-z0-9]/.test(form.password)
  }), [form.password]);

  const strength = useMemo(() => {
    if (!form.password) return { percent: 0, label: 'Strength: —', color: '#444' };
    let score = 0;
    if (rules.length) score++;
    if (form.password.length >= 12) score++;
    if (form.password.length >= 16) score++;
    if (rules.upper) score++;
    if (rules.lower) score++;
    if (rules.number) score++;
    if (rules.symbol) score++;
    if (score <= 2) return { percent: 33, label: 'Weak', color: '#e03131' };
    if (score <= 5) return { percent: 66, label: 'Medium', color: '#f59f00' };
    return { percent: 100, label: 'Strong', color: '#37b24d' };
  }, [form.password, rules]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
  const newErrors = {};

  if (!form.email.trim()) newErrors.email = 'Email required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';

  if (form.password) {
    if (!form.username.trim()) newErrors.username = 'Username required';
    if (form.password.length < 8) newErrors.password = 'Min 8 characters';
    if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) ||
        !/[0-9]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password))
      newErrors.password = 'Upper, lower, number, and symbol required';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  {!form.password && (
    <div className="invite-alert invite-danger-middle">
      Note: leave Create Password empty to promote an existing user to sub-admin.
    </div>
  )}

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setSuccess('');
    
    try {

     if (!form.password) {
      const res = await axios.post('/admin/promote', {
        email: form.email.trim().toLowerCase()
      });

      if (res.data.success) {
        setSuccess(`Promoted "${res.data.admin.username}" to sub-admin. They still use their original password.`);
        setForm({ 
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
      
      } else {
        const res = await axios.post('/admin/invite', {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      if (res.data.success) {
        setSuccess(`Admin "${res.data.admin.username}" created! They can now log in.`);
        setForm({ 
          username: '', 
          email: '', 
          password: '', 
          confirmPassword: '' 
        });
      }
    }
    
  } catch (err) {
    setErrors({ submit: err.response?.data?.message || 'Failed to process admin action' });
  } finally {
    setLoading(false);
  }
    
};

  return (
    <div className="invite-page">
    <div className="invite-card">
      <form onSubmit={handleSubmit} noValidate>
        <h2 className="invite-title">Invite New Admin</h2>
        <p className="invite-subtitle">Create a sub-admin account. They can log in right away.</p>

        {success && <div className="invite-alert invite-alert-success">{success}</div>}
        {errors.submit && <div className="invite-alert invite-alert-error">{errors.submit}</div>}

        <div className={`invite-field ${errors.username ? 'has-error' : ''}`}>
          <i className="bx bx-user-circle"></i>
          <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
          {errors.username && <span className="invite-error-text">{errors.username}</span>}
        </div>

        <div className={`invite-field ${errors.email ? 'has-error' : ''}`}>
          <i className="bx bxs-envelope"></i>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
          {errors.email && <span className="invite-error-text">{errors.email}</span>}
        </div>

        <div className={`invite-field ${errors.password ? 'has-error' : ''}`}>
          <i className="bx bx-lock-alt"></i>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
          {errors.password && <span className="invite-error-text">{errors.password}</span>}
        </div>

        <div className={`invite-field ${errors.confirmPassword ? 'has-error' : ''}`}>
          <i className="bx bx-lock-alt"></i>
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />
          {errors.confirmPassword && <span className="invite-error-text">{errors.confirmPassword}</span>}
        </div>

        {form.password && (
          <div className="invite-strength">
            <div className="invite-strength-label" style={{ color: strength.color }}>{strength.label}</div>
            <div className="invite-strength-bar">
              <div className="invite-strength-fill" style={{ width: `${strength.percent}%`, backgroundColor: strength.color }} />
            </div>
            <ul className="invite-rules">
              {[
                { key: 'length', text: '8+ chars', met: rules.length },
                { key: 'upper', text: 'Uppercase', met: rules.upper },
                { key: 'lower', text: 'Lowercase', met: rules.lower },
                { key: 'number', text: 'Number', met: rules.number },
                { key: 'symbol', text: 'Symbol', met: rules.symbol }
              ].map(r => (
                <li key={r.key} className={`invite-rule ${r.met ? 'met' : ''}`}>
                  <span className="invite-rule-check">{r.met ? '✓' : '○'}</span>{r.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="invite-btn" disabled={loading}>
          {loading ? 'Inviting...' : 'Invite Admin'}
        </button>

        <button type="button" className="invite-btn invite-btn-back" onClick={() => navigate('/dashboard_section/Dashboard')}>
          ← Back to Dashboard
        </button>
      </form>
    </div>
  </div>
);
};

export default InviteAdmin;